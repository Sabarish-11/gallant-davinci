import { performAcademicAudit } from '../services/auditEngine.js';
import { generateAcademicInsights } from '../services/aiService.js';
import User from '../models/User.js';

// @desc    Get Academic Audit for self
// @route   GET /api/audit/me
// @access  Private (Student)
export const getMyAudit = async (req, res) => {
  try {
    const studentId = req.user._id;
    const auditData = await performAcademicAudit(studentId);

    // Generate AI feedback summary
    const aiInsights = await generateAcademicInsights(auditData, req.user.name);

    res.json({
      success: true,
      data: {
        audit: auditData,
        aiInsights,
      },
    });
  } catch (error) {
    console.error('getMyAudit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Get Academic Audit for any student
// @route   GET /api/audit/student/:studentId
// @access  Private (Faculty/Admin)
export const getStudentAudit = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const student = await User.findById(studentId);
    if (!student || student.role !== 'STUDENT') {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const auditData = await performAcademicAudit(studentId);
    const aiInsights = await generateAcademicInsights(auditData, student.name);

    res.json({
      success: true,
      data: {
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
          studentId: student.studentId,
          department: student.department,
          batch: student.batch,
          semester: student.semester,
        },
        audit: auditData,
        aiInsights,
      },
    });
  } catch (error) {
    console.error('getStudentAudit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};
