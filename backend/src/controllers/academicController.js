import AcademicRecord from '../models/AcademicRecord.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Get academic records for a student
// @route   GET /api/academic-records
// @access  Private (Student/Faculty/Admin)
export const getAcademicRecords = async (req, res) => {
  try {
    let studentId = req.user._id;

    // Faculty and Admin can view other students' records
    if (req.user.role !== 'STUDENT' && req.query.studentId) {
      studentId = req.query.studentId;
    }

    const records = await AcademicRecord.find({ studentId }).sort({ semester: 1, subjectCode: 1 });
    
    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Create academic record
// @route   POST /api/academic-records
// @access  Private (Faculty/Admin)
export const createAcademicRecord = async (req, res) => {
  try {
    const {
      studentId,
      semester,
      subjectCode,
      subjectName,
      credits,
      internalMarks,
      assignmentMarks,
      examMarks,
      attendance,
      grade,
      passStatus,
    } = req.body;

    // Check if student exists
    const student = await User.findOne({ _id: studentId, role: 'STUDENT' });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student user not found',
      });
    }

    // Check for duplicate record
    const duplicate = await AcademicRecord.findOne({ studentId, semester, subjectCode });
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `Academic record already exists for ${subjectCode} in semester ${semester}`,
      });
    }

    const record = await AcademicRecord.create({
      studentId,
      semester,
      subjectCode,
      subjectName,
      credits,
      internalMarks,
      assignmentMarks,
      examMarks,
      attendance,
      grade,
      passStatus,
    });

    // Automatically recalculate Student Profile's overall GPA/attendance if needed,
    // or trigger it in a background operation
    await recalculateProfileStats(studentId);

    await AuditLog.create({
      userId: req.user._id,
      action: 'ACADEMIC_RECORD_CREATED',
      details: `Created record for student: ${student.email}, subject: ${subjectCode}, sem: ${semester}`,
      ip: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Update academic record
// @route   PUT /api/academic-records/:id
// @access  Private (Faculty/Admin)
export const updateAcademicRecord = async (req, res) => {
  try {
    const {
      internalMarks,
      assignmentMarks,
      examMarks,
      attendance,
      grade,
      passStatus,
      credits,
    } = req.body;

    let record = await AcademicRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Academic record not found',
      });
    }

    const oldDetails = `Marks: [Int: ${record.internalMarks}, Assgn: ${record.assignmentMarks}, Exam: ${record.examMarks}, Attd: ${record.attendance}%]`;

    if (internalMarks !== undefined) record.internalMarks = internalMarks;
    if (assignmentMarks !== undefined) record.assignmentMarks = assignmentMarks;
    if (examMarks !== undefined) record.examMarks = examMarks;
    if (attendance !== undefined) record.attendance = attendance;
    if (grade !== undefined) record.grade = grade;
    if (passStatus !== undefined) record.passStatus = passStatus;
    if (credits !== undefined) record.credits = credits;

    await record.save();
    await recalculateProfileStats(record.studentId);

    const newDetails = `Marks: [Int: ${record.internalMarks}, Assgn: ${record.assignmentMarks}, Exam: ${record.examMarks}, Attd: ${record.attendance}%]`;

    await AuditLog.create({
      userId: req.user._id,
      action: 'ACADEMIC_RECORD_MODIFIED',
      details: `Modified record ID ${record._id} for subject ${record.subjectCode}. Changed from ${oldDetails} to ${newDetails}`,
      ip: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Delete academic record
// @route   DELETE /api/academic-records/:id
// @access  Private (Faculty/Admin)
export const deleteAcademicRecord = async (req, res) => {
  try {
    const record = await AcademicRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Academic record not found',
      });
    }

    const studentId = record.studentId;
    const details = `Subject ${record.subjectCode}, sem ${record.semester}, credits ${record.credits}`;
    
    await record.deleteOne();
    await recalculateProfileStats(studentId);

    await AuditLog.create({
      userId: req.user._id,
      action: 'ACADEMIC_RECORD_DELETED',
      details: `Deleted academic record for student ID ${studentId}. Details: ${details}`,
      ip: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      message: 'Academic record deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Manual update of overall GPA and Attendance (Faculty/Admin override)
// @route   PUT /api/academic-records/student/:studentId/override
// @access  Private (Faculty/Admin)
export const overrideProfileStats = async (req, res) => {
  try {
    const { cgpa, attendance } = req.body;
    const studentId = req.params.studentId;

    const profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    if (cgpa !== undefined) profile.cgpa = cgpa;
    if (attendance !== undefined) profile.attendance = attendance;

    await profile.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'PROFILE_STATS_OVERRIDDEN',
      details: `Overrode overall stats. New CGPA: ${cgpa || profile.cgpa}, Attendance: ${attendance || profile.attendance}%`,
      ip: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      message: 'Profile stats overridden successfully',
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// Helper: Calculate average attendance and GPA and save to profile
const recalculateProfileStats = async (studentId) => {
  const records = await AcademicRecord.find({ studentId });
  const profile = await StudentProfile.findOne({ userId: studentId });

  if (!profile || records.length === 0) return;

  // Calculate Average Attendance
  const avgAttendance = records.reduce((acc, curr) => acc + curr.attendance, 0) / records.length;
  profile.attendance = parseFloat(avgAttendance.toFixed(2));

  // Compute GPA (Credits * Grade Value) / Total Credits
  // Grades: S=10, A=9, B=8, C=7, D=6, E=5, F=0
  const GRADE_VALUES = { 'S': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0 };

  let totalCredits = 0;
  let weightedPoints = 0;

  records.forEach((record) => {
    const value = GRADE_VALUES[record.grade] !== undefined ? GRADE_VALUES[record.grade] : 0;
    weightedPoints += value * record.credits;
    totalCredits += record.credits;
  });

  const cgpa = totalCredits > 0 ? weightedPoints / totalCredits : 0;
  profile.cgpa = parseFloat(cgpa.toFixed(2));

  await profile.save();
};
