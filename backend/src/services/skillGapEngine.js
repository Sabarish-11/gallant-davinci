import Career from '../models/Career.js';
import Skill from '../models/Skill.js';
import StudentProfile from '../models/StudentProfile.js';

// Convert proficiency string to numeric values
const PROFICIENCY_VALUES = {
  'BEGINNER': 1,
  'INTERMEDIATE': 2,
  'ADVANCED': 3
};

// Convert importance string to numeric weights
const IMPORTANCE_WEIGHTS = {
  'HIGH': 3,
  'MEDIUM': 2,
  'LOW': 1
};

/**
 * Perform Skill Gap Analysis for a student.
 * Compares current skills with target career skills.
 */
export const analyzeSkillGap = async (studentId) => {
  const profile = await StudentProfile.findOne({ userId: studentId }).populate('preferredCareer');
  
  if (!profile) {
    throw new Error('Student profile not found');
  }

  const studentSkillsMap = {};
  profile.skills.forEach(sk => {
    studentSkillsMap[sk.name.toLowerCase()] = PROFICIENCY_VALUES[sk.proficiency] || 1;
  });

  if (!profile.preferredCareer) {
    return {
      hasTargetCareer: false,
      careerName: null,
      matchPercentage: 0,
      matchedSkills: [],
      partialSkills: [],
      missingSkills: [],
    };
  }

  // Fetch full details of the career, populating the skills info
  const career = await Career.findById(profile.preferredCareer._id).populate('requiredSkills.skillId');
  if (!career) {
    throw new Error('Career profile not found');
  }

  let totalPossibleScore = 0;
  let studentEarnedScore = 0;

  const matchedSkills = [];
  const partialSkills = [];
  const missingSkills = [];

  for (const reqSkill of career.requiredSkills) {
    const skillDetail = reqSkill.skillId;
    if (!skillDetail) continue;

    const skillName = skillDetail.name;
    const reqProf = reqSkill.proficiency || 'INTERMEDIATE';
    const importance = reqSkill.importance || 'MEDIUM';

    const reqProfVal = PROFICIENCY_VALUES[reqProf] || 2;
    const importanceWeight = IMPORTANCE_WEIGHTS[importance] || 2;

    const maxSkillScore = reqProfVal * importanceWeight;
    totalPossibleScore += maxSkillScore;

    const studProfVal = studentSkillsMap[skillName.toLowerCase()];

    if (studProfVal === undefined) {
      // Skill is missing
      missingSkills.push({
        skillId: skillDetail._id,
        name: skillName,
        category: skillDetail.category,
        importance,
        requiredProficiency: reqProf,
        priority: importance === 'HIGH' ? 1 : (importance === 'MEDIUM' ? 3 : 5),
        reason: `${skillName} is a ${importance} importance requirement for a ${career.name} role, but is not present in your profile.`
      });
    } else if (studProfVal >= reqProfVal) {
      // Skill matched or exceeded
      studentEarnedScore += maxSkillScore;
      matchedSkills.push({
        skillId: skillDetail._id,
        name: skillName,
        category: skillDetail.category,
        currentProficiency: Object.keys(PROFICIENCY_VALUES).find(key => PROFICIENCY_VALUES[key] === studProfVal) || 'BEGINNER',
        requiredProficiency: reqProf,
      });
    } else {
      // Skill present but insufficient proficiency (partial match)
      const earnedSkillScore = studProfVal * importanceWeight;
      studentEarnedScore += earnedSkillScore;
      
      const currentProfStr = Object.keys(PROFICIENCY_VALUES).find(key => PROFICIENCY_VALUES[key] === studProfVal) || 'BEGINNER';
      partialSkills.push({
        skillId: skillDetail._id,
        name: skillName,
        category: skillDetail.category,
        importance,
        currentProficiency: currentProfStr,
        requiredProficiency: reqProf,
        priority: importance === 'HIGH' ? 2 : 4,
        reason: `You have ${skillName} at ${currentProfStr} level, but the role requires ${reqProf} level.`
      });
    }
  }

  const matchPercentage = totalPossibleScore > 0 ? Math.round((studentEarnedScore / totalPossibleScore) * 100) : 100;

  // Sort missing/partial lists by priority ascending
  missingSkills.sort((a, b) => a.priority - b.priority);
  partialSkills.sort((a, b) => a.priority - b.priority);

  return {
    hasTargetCareer: true,
    careerId: career._id,
    careerName: career.name,
    careerDescription: career.description,
    matchPercentage,
    matchedSkills,
    partialSkills,
    missingSkills,
  };
};
