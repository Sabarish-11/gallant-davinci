import SystemConfig from '../models/SystemConfig.js';
import AcademicRecord from '../models/AcademicRecord.js';
import StudentProfile from '../models/StudentProfile.js';

// Default configuration constants
const DEFAULT_CONFIGS = {
  attendanceThreshold: 75,
  riskThresholds: {
    critical: 50,
    high: 65,
    moderate: 80,
  },
  gpaThresholds: {
    critical: 5.0,
    high: 6.0,
    moderate: 7.0,
  },
  weights: {
    marks: 0.30,       // 30% Subject Exam Performance
    attendance: 0.20,  // 20% Attendance
    assignment: 0.15,  // 15% Assignment Marks
    cgpa: 0.20,        // 20% CGPA (normalized)
    credits: 0.15,     // 15% Credit Completion
  }
};

// Helper to get system configs or return default
const getConfigValue = async (key, defaultValue) => {
  try {
    const config = await SystemConfig.findOne({ key });
    return config ? config.value : defaultValue;
  } catch (error) {
    console.error(`Error loading system config for key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Perform Academic Audit for a single student.
 * Returns detailed scores, risk assessment, backlogs, strengths/weaknesses and recommendations.
 */
export const performAcademicAudit = async (studentId, currentSemester = null) => {
  // Load Configurations
  const attendanceThreshold = await getConfigValue('attendanceThreshold', DEFAULT_CONFIGS.attendanceThreshold);
  const gpaThresholds = await getConfigValue('gpaThresholds', DEFAULT_CONFIGS.gpaThresholds);
  const weights = await getConfigValue('weights', DEFAULT_CONFIGS.weights);

  // Fetch Academic Records & Student Profile
  const query = { studentId };
  if (currentSemester) {
    query.semester = currentSemester;
  }
  const records = await AcademicRecord.find(query);
  const profile = await StudentProfile.findOne({ userId: studentId });

  if (!profile) {
    throw new Error('Student profile not found');
  }

  // Handle empty academic records (e.g., first semester starting out)
  if (records.length === 0) {
    return {
      academicScore: 100,
      attendanceRate: profile.attendance,
      assignmentAvg: 100,
      creditCompletionRate: 100,
      riskLevel: 'LOW RISK',
      reasons: ['No academic records available yet for evaluation.'],
      weakSubjects: [],
      strongSubjects: [],
      backlogsCount: 0,
      totalCreditsRegistered: 0,
      totalCreditsEarned: 0,
      recommendations: ['Select preferred career path to start skill gap analysis.', 'Attend classes regularly to maintain good standing.'],
    };
  }

  let totalRegisteredCredits = 0;
  let totalEarnedCredits = 0;
  let sumSubjectScores = 0;
  let sumAttendance = 0;
  let sumAssignments = 0;
  let backlogsCount = 0;

  const weakSubjects = [];
  const strongSubjects = [];

  records.forEach((record) => {
    totalRegisteredCredits += record.credits;
    if (record.grade !== 'F' && record.passStatus) {
      totalEarnedCredits += record.credits;
    } else {
      backlogsCount++;
    }

    // Weighted subject score: 30% internal, 20% assignment, 50% end exam
    const subjectScore = (record.internalMarks * 0.3) + (record.assignmentMarks * 0.2) + (record.examMarks * 0.5);
    sumSubjectScores += subjectScore;
    sumAttendance += record.attendance;
    sumAssignments += record.assignmentMarks;

    // Identify weak/strong subjects
    if (subjectScore < 60) {
      weakSubjects.push({
        code: record.subjectCode,
        name: record.subjectName,
        score: Math.round(subjectScore),
        attendance: record.attendance,
        reason: subjectScore < 50 ? 'Critical performance' : 'Needs improvement',
      });
    } else if (subjectScore >= 80) {
      strongSubjects.push({
        code: record.subjectCode,
        name: record.subjectName,
        score: Math.round(subjectScore),
      });
    }
  });

  const avgSubjectScore = sumSubjectScores / records.length;
  const avgAttendance = sumAttendance / records.length;
  const avgAssignment = sumAssignments / records.length;
  const creditCompletionRate = totalRegisteredCredits > 0 ? (totalEarnedCredits / totalRegisteredCredits) * 100 : 100;
  const normalizedCGPA = profile.cgpa * 10; // Normalized to 0-100 scale

  // Overall Academic Score calculation
  const academicScore = Math.round(
    (avgSubjectScore * weights.marks) +
    (avgAttendance * weights.attendance) +
    (avgAssignment * weights.assignment) +
    (normalizedCGPA * weights.cgpa) +
    (creditCompletionRate * weights.credits)
  );

  // Risk Classification
  let riskLevel = 'LOW RISK';
  const reasons = [];
  const recommendations = [];

  // Rules for risk triggering
  if (avgAttendance < 60 || profile.cgpa < gpaThresholds.critical || backlogsCount >= 3) {
    riskLevel = 'CRITICAL RISK';
  } else if (avgAttendance < attendanceThreshold || profile.cgpa < gpaThresholds.high || backlogsCount >= 1) {
    riskLevel = 'HIGH RISK';
  } else if (avgAttendance < 80 || profile.cgpa < gpaThresholds.moderate || avgAssignment < 75) {
    riskLevel = 'MODERATE RISK';
  }

  // Compile detailed justifications (Explainable Risk)
  if (avgAttendance < attendanceThreshold) {
    reasons.push(`Attendance rate is ${Math.round(avgAttendance)}% which is below the required threshold of ${attendanceThreshold}%.`);
    recommendations.push('Attend extra tutorial classes and regular lectures to restore attendance percentage.');
  }
  if (profile.cgpa < gpaThresholds.high) {
    reasons.push(`CGPA is ${profile.cgpa.toFixed(2)}, which is below the safe institutional line of ${gpaThresholds.high.toFixed(2)}.`);
    recommendations.push('Schedule academic mentoring sessions to work on core topics and exam preparation.');
  }
  if (backlogsCount > 0) {
    reasons.push(`Student currently has ${backlogsCount} backlog subject(s) in active record.`);
    recommendations.push('Prioritize registering for backlog clearance exams in the coming academic cycle.');
  }
  if (avgAssignment < 75) {
    reasons.push(`Average assignment mark is ${Math.round(avgAssignment)}%, pointing to incomplete or weak submission quality.`);
    recommendations.push('Submit assignments on time and double-check instructions with course TAs.');
  }
  weakSubjects.forEach((sub) => {
    reasons.push(`Weak performance in ${sub.name} (${sub.code}) with an overall score of ${sub.score}%.`);
    recommendations.push(`Revise foundational syllabus for ${sub.name} and seek faculty hours help.`);
  });

  if (reasons.length === 0) {
    reasons.push('Excellent academic performance with high attendance and zero backlogs.');
    recommendations.push('Keep up the good work! Focus on core skills building and profile enhancements.');
  }

  return {
    academicScore,
    attendanceRate: Math.round(avgAttendance),
    assignmentAvg: Math.round(avgAssignment),
    creditCompletionRate: Math.round(creditCompletionRate),
    riskLevel,
    reasons,
    weakSubjects,
    strongSubjects,
    backlogsCount,
    totalCreditsRegistered: totalRegisteredCredits,
    totalCreditsEarned: totalEarnedCredits,
    recommendations,
  };
};
