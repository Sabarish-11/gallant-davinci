import { queryAssistant } from '../services/aiService.js';
import { performAcademicAudit } from '../services/auditEngine.js';
import { analyzeSkillGap } from '../services/skillGapEngine.js';
import StudentProfile from '../models/StudentProfile.js';

// @desc    Query the Campus AI Assistant
// @route   POST /api/ai/chat
// @access  Private (Student)
export const chatWithAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const studentId = req.user._id;

    // Fetch Academic Context
    const auditData = await performAcademicAudit(studentId);

    // Fetch Career & Skill Gap Context
    const gapResult = await analyzeSkillGap(studentId);
    const profile = await StudentProfile.findOne({ userId: studentId }).populate('preferredCareer');

    const context = {
      studentName: req.user.name,
      cgpa: profile?.cgpa || 0.0,
      attendance: auditData.attendanceRate,
      riskLevel: auditData.riskLevel,
      backlogsCount: auditData.backlogsCount,
      careerGoal: gapResult.careerName,
      skillMatch: gapResult.matchPercentage,
      strongSubjects: auditData.strongSubjects.map(s => s.name),
      weakSubjects: auditData.weakSubjects.map(s => s.name),
      missingSkills: gapResult.missingSkills.map(s => s.name),
    };

    const reply = await queryAssistant(message, context);

    res.json({
      success: true,
      data: {
        reply,
      },
    });
  } catch (error) {
    console.error('chatWithAssistant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};
