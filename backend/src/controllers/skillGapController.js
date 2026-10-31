import { analyzeSkillGap } from '../services/skillGapEngine.js';
import { generateSkillGapInsights, generatePersonalizedRoadmap } from '../services/aiService.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';

// @desc    Get skill gap analysis for current student
// @route   GET /api/skill-gap/me
// @access  Private (Student)
export const getMySkillGap = async (req, res) => {
  try {
    const studentId = req.user._id;

    const gapResult = await analyzeSkillGap(studentId);
    
    let aiInsights = '';
    let roadmap = null;

    if (gapResult.hasTargetCareer) {
      const profile = await StudentProfile.findOne({ userId: studentId });
      aiInsights = await generateSkillGapInsights(gapResult, req.user.name);
      roadmap = await generatePersonalizedRoadmap(gapResult, profile);
    }

    res.json({
      success: true,
      data: {
        gapAnalysis: gapResult,
        aiInsights,
        roadmap,
      },
    });
  } catch (error) {
    console.error('getMySkillGap error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Get skill gap analysis for any student
// @route   GET /api/skill-gap/student/:studentId
// @access  Private (Faculty/Admin)
export const getStudentSkillGap = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const student = await User.findById(studentId);
    if (!student || student.role !== 'STUDENT') {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const gapResult = await analyzeSkillGap(studentId);
    let aiInsights = '';
    let roadmap = null;

    if (gapResult.hasTargetCareer) {
      const profile = await StudentProfile.findOne({ userId: studentId });
      aiInsights = await generateSkillGapInsights(gapResult, student.name);
      roadmap = await generatePersonalizedRoadmap(gapResult, profile);
    }

    res.json({
      success: true,
      data: {
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
        },
        gapAnalysis: gapResult,
        aiInsights,
        roadmap,
      },
    });
  } catch (error) {
    console.error('getStudentSkillGap error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};
