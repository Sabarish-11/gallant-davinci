import { analyzeSkillGap } from '../services/skillGapEngine.js';
import LearningResource from '../models/LearningResource.js';
import StudentProfile from '../models/StudentProfile.js';

// @desc    Get recommendations for the current student
// @route   GET /api/recommendations/me
// @access  Private (Student)
export const getMyRecommendations = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Run skill gap analysis to identify missing and partial skills
    const gap = await analyzeSkillGap(studentId);

    if (!gap.hasTargetCareer) {
      return res.json({
        success: true,
        message: 'Please set your preferred career path in your Profile settings to get learning recommendations.',
        data: []
      });
    }

    const recommendations = [];

    // Combine missing and partial skills to find resources
    const allGaps = [
      ...gap.missingSkills.map(s => ({ ...s, isMissing: true })),
      ...gap.partialSkills.map(s => ({ ...s, isMissing: false }))
    ];

    // For each gap skill, retrieve matching learning resources from DB
    for (const gapSkill of allGaps) {
      const resources = await LearningResource.find({
        skillId: gapSkill.skillId
      });

      // Simple heuristic for difficulty mapping based on required proficiency
      // If student has BEGINNER and needs INTERMEDIATE, recommend BEGINNER/INTERMEDIATE courses.
      const priorityLabel = gapSkill.priority === 1 ? 'CRITICAL' : (gapSkill.priority <= 3 ? 'HIGH' : 'MEDIUM');

      recommendations.push({
        skillId: gapSkill.skillId,
        skillName: gapSkill.name,
        category: gapSkill.category,
        priority: priorityLabel,
        priorityValue: gapSkill.priority,
        currentProficiency: gapSkill.isMissing ? 'None' : gapSkill.currentProficiency,
        requiredProficiency: gapSkill.requiredProficiency,
        whyItMatters: gapSkill.reason || `${gapSkill.name} is key for achieving the ${gap.careerName} path.`,
        resources: resources.map(r => ({
          _id: r._id,
          title: r.title,
          provider: r.provider,
          url: r.url,
          difficulty: r.difficulty,
          duration: r.duration || 'Self-paced',
          type: r.type
        })),
        estimatedHours: gapSkill.isMissing ? 15 : 8, // Estimated hours to close this gap
      });
    }

    // Sort by priority value (ascending) so higher priority items are returned first
    recommendations.sort((a, b) => a.priorityValue - b.priorityValue);

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error('getMyRecommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message
    });
  }
};
