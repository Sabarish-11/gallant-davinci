import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import AcademicRecord from '../models/AcademicRecord.js';
import Career from '../models/Career.js';
import Skill from '../models/Skill.js';
import { performAcademicAudit } from '../services/auditEngine.js';
import { analyzeSkillGap } from '../services/skillGapEngine.js';

// @desc    Get dashboard metrics for logged-in Student
// @route   GET /api/dashboard/student
// @access  Private (Student)
export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Run engines
    const audit = await performAcademicAudit(studentId);
    const gap = await analyzeSkillGap(studentId);
    const profile = await StudentProfile.findOne({ userId: studentId }).populate('preferredCareer');

    // Retrieve historical performance by semester
    const semesterData = await AcademicRecord.aggregate([
      { $match: { studentId } },
      {
        $group: {
          _id: '$semester',
          avgExamMarks: { $avg: '$examMarks' },
          avgInternalMarks: { $avg: '$internalMarks' },
          totalCredits: { $sum: '$credits' },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format semester stats
    const semesterTrend = semesterData.map(d => ({
      semester: `Sem ${d._id}`,
      examAvg: Math.round(d.avgExamMarks),
      internalAvg: Math.round(d.avgInternalMarks),
      credits: d.totalCredits,
    }));

    // Subject attendance breakdown
    const subjectRecords = await AcademicRecord.find({ studentId }).select('subjectCode subjectName attendance');
    const attendanceBreakdown = subjectRecords.map(r => ({
      subject: r.subjectCode,
      name: r.subjectName,
      attendance: r.attendance,
    }));

    // Construct notifications based on triggers
    const notifications = [];
    if (audit.attendanceRate < 75) {
      notifications.push({
        id: 'n1',
        type: 'danger',
        message: `Your average attendance is ${audit.attendanceRate}%, which is below the 75% threshold!`,
      });
    }
    if (audit.backlogsCount > 0) {
      notifications.push({
        id: 'n2',
        type: 'warning',
        message: `You have ${audit.backlogsCount} active backlogs. Plan your clearance exams.`,
      });
    }
    if (gap.hasTargetCareer && gap.matchPercentage < 40) {
      notifications.push({
        id: 'n3',
        type: 'info',
        message: `Your skill match for ${gap.careerName} is low (${gap.matchPercentage}%). Check recommended courses.`,
      });
    }
    if (!gap.hasTargetCareer) {
      notifications.push({
        id: 'n4',
        type: 'info',
        message: `Select a target career in your profile settings to initiate skill gap insights.`,
      });
    }

    res.json({
      success: true,
      data: {
        stats: {
          academicScore: audit.academicScore,
          cgpa: profile?.cgpa || 0.0,
          attendance: audit.attendanceRate,
          creditCompletion: audit.creditCompletionRate,
          riskLevel: audit.riskLevel,
          skillMatch: gap.matchPercentage,
          careerGoal: gap.careerName || 'Not Set',
        },
        semesterTrend,
        attendanceBreakdown,
        notifications,
        skillsCount: profile?.skills?.length || 0,
        projectsCount: profile?.projects?.length || 0,
        certificationsCount: profile?.certifications?.length || 0,
      },
    });
  } catch (error) {
    console.error('getStudentDashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Get dashboard metrics for Faculty
// @route   GET /api/dashboard/faculty
// @access  Private (Faculty)
export const getFacultyDashboard = async (req, res) => {
  try {
    const { department, batch, semester } = req.query;

    const userQuery = { role: 'STUDENT' };
    if (department) userQuery.department = department;
    if (batch) userQuery.batch = batch;
    if (semester) userQuery.semester = parseInt(semester);

    const students = await User.find(userQuery).select('_id name email department batch semester studentId');
    const studentIds = students.map(s => s._id);

    // Fetch Student Profiles
    const profiles = await StudentProfile.find({ userId: { $in: studentIds } });

    if (students.length === 0) {
      return res.json({
        success: true,
        data: {
          stats: { totalStudents: 0, avgCgpa: 0, avgAttendance: 0, atRiskCount: 0 },
          riskDistribution: [],
          atRiskStudents: [],
          subjectAverages: [],
        }
      });
    }

    // Averages calculations
    let totalCgpa = 0;
    let totalAttendance = 0;
    profiles.forEach(p => {
      totalCgpa += p.cgpa;
      totalAttendance += p.attendance;
    });

    const avgCgpa = parseFloat((totalCgpa / students.length).toFixed(2)) || 0;
    const avgAttendance = Math.round(totalAttendance / students.length) || 0;

    // Audit and analyze each student to compile risk levels
    let criticalCount = 0;
    let highCount = 0;
    let moderateCount = 0;
    let lowCount = 0;

    const atRiskStudents = [];

    for (const student of students) {
      try {
        const audit = await performAcademicAudit(student._id);
        const profile = profiles.find(p => p.userId.toString() === student._id.toString());
        
        const riskObj = {
          studentId: student._id,
          name: student.name,
          rollNumber: student.studentId,
          department: student.department,
          semester: student.semester,
          cgpa: profile?.cgpa || 0.0,
          attendance: audit.attendanceRate,
          riskLevel: audit.riskLevel,
          reasons: audit.reasons.slice(0, 2),
        };

        if (audit.riskLevel === 'CRITICAL RISK') {
          criticalCount++;
          atRiskStudents.push(riskObj);
        } else if (audit.riskLevel === 'HIGH RISK') {
          highCount++;
          atRiskStudents.push(riskObj);
        } else if (audit.riskLevel === 'MODERATE RISK') {
          moderateCount++;
        } else {
          lowCount++;
        }
      } catch (err) {
        console.error(`Audit calculation failed for student ${student._id}:`, err.message);
      }
    }

    // Sort atRisk list (critical first)
    atRiskStudents.sort((a, b) => {
      if (a.riskLevel === 'CRITICAL RISK' && b.riskLevel !== 'CRITICAL RISK') return -1;
      if (a.riskLevel !== 'CRITICAL RISK' && b.riskLevel === 'CRITICAL RISK') return 1;
      return b.cgpa - a.cgpa;
    });

    // Aggregated subject performance
    const subjectAverages = await AcademicRecord.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      {
        $group: {
          _id: '$subjectCode',
          subjectName: { $first: '$subjectName' },
          avgMarks: { $avg: { $add: [ { $multiply: ['$internalMarks', 0.3] }, { $multiply: ['$assignmentMarks', 0.2] }, { $multiply: ['$examMarks', 0.5] } ] } },
          avgAttendance: { $avg: '$attendance' },
        }
      },
      { $sort: { avgMarks: 1 } }, // Ascending order to show weakest subjects first
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents: students.length,
          avgCgpa,
          avgAttendance,
          atRiskCount: criticalCount + highCount,
        },
        riskDistribution: [
          { name: 'Low Risk', value: lowCount, color: '#10B981' },
          { name: 'Moderate Risk', value: moderateCount, color: '#F59E0B' },
          { name: 'High Risk', value: highCount, color: '#EF4444' },
          { name: 'Critical Risk', value: criticalCount, color: '#7F1D1D' },
        ],
        atRiskStudents,
        subjectAverages: subjectAverages.map(s => ({
          subject: s._id,
          name: s.subjectName,
          averageScore: Math.round(s.avgMarks),
          averageAttendance: Math.round(s.avgAttendance),
        })),
      },
    });
  } catch (error) {
    console.error('getFacultyDashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Get dashboard metrics for Admin
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
export const getAdminDashboard = async (req, res) => {
  try {
    // Basic counts
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const totalFaculty = await User.countDocuments({ role: 'FACULTY' });
    const totalCareers = await Career.countDocuments({});
    const totalSkills = await Skill.countDocuments({});

    // Institutional stats
    const studentProfiles = await StudentProfile.find({});
    let totalCgpa = 0;
    let totalAttendance = 0;
    
    studentProfiles.forEach(p => {
      totalCgpa += p.cgpa;
      totalAttendance += p.attendance;
    });

    const avgCgpa = totalStudents > 0 ? parseFloat((totalCgpa / totalStudents).toFixed(2)) : 0;
    const avgAttendance = totalStudents > 0 ? Math.round(totalAttendance / totalStudents) : 0;

    // Department comparison
    const deptStats = await User.aggregate([
      { $match: { role: 'STUDENT' } },
      {
        $lookup: {
          from: 'studentprofiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'profile'
        }
      },
      { $unwind: '$profile' },
      {
        $group: {
          _id: '$department',
          avgGpa: { $avg: '$profile.cgpa' },
          avgAttd: { $avg: '$profile.attendance' },
          studentCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Popular Careers
    const careerPreferences = await StudentProfile.aggregate([
      { $match: { preferredCareer: { $ne: null } } },
      {
        $group: {
          _id: '$preferredCareer',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'careers',
          localField: '_id',
          foreignField: '_id',
          as: 'careerInfo'
        }
      },
      { $unwind: '$careerInfo' },
      {
        $project: {
          name: '$careerInfo.name',
          count: 1,
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Calculate generic risk distribution for admin dashboard
    let low = 0, moderate = 0, high = 0, critical = 0;
    const allStudents = await User.find({ role: 'STUDENT' }).select('_id');
    for (const stud of allStudents) {
      try {
        const audit = await performAcademicAudit(stud._id);
        if (audit.riskLevel === 'CRITICAL RISK') critical++;
        else if (audit.riskLevel === 'HIGH RISK') high++;
        else if (audit.riskLevel === 'MODERATE RISK') moderate++;
        else low++;
      } catch (err) {}
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalFaculty,
          totalCareers,
          totalSkills,
          avgCgpa,
          avgAttendance,
          totalAtRisk: critical + high,
        },
        riskDistribution: [
          { name: 'Low Risk', value: low, color: '#10B981' },
          { name: 'Moderate Risk', value: moderate, color: '#F59E0B' },
          { name: 'High Risk', value: high, color: '#EF4444' },
          { name: 'Critical Risk', value: critical, color: '#7F1D1D' },
        ],
        departmentComparison: deptStats.map(d => ({
          department: d._id || 'General',
          cgpa: parseFloat(d.avgGpa.toFixed(2)),
          attendance: Math.round(d.avgAttd),
          count: d.studentCount,
        })),
        careerPreferences: careerPreferences.map(c => ({
          name: c.name,
          studentsCount: c.count,
        })),
      }
    });
  } catch (error) {
    console.error('getAdminDashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};
