import { GoogleGenerativeAI } from '@google/generative-ai';
import Career from '../models/Career.js';
import Skill from '../models/Skill.js';
import LearningResource from '../models/LearningResource.js';

// Initialize Gemini Client if key is available
let aiModel = null;
if (process.env.AI_API_KEY) {
  try {
    const ai = new GoogleGenerativeAI(process.env.AI_API_KEY);
    // Use gemini-1.5-flash as default fast text model
    aiModel = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('Gemini AI Service initialized successfully.');
  } catch (err) {
    console.error('Error initializing Gemini Client:', err.message);
  }
}

/**
 * Generate AI-powered academic audit explanation & guidance.
 */
export const generateAcademicInsights = async (auditResult, studentName) => {
  const prompt = `
    You are an expert academic advisor at a university.
    Provide personalized, professional, and encouraging academic advice for student "${studentName}" based on their recent academic audit details.
    
    Academic Audit Details:
    - Overall Academic Score: ${auditResult.academicScore}/100
    - Attendance Rate: ${auditResult.attendanceRate}%
    - Assignment Average: ${auditResult.assignmentAvg}%
    - Credit Completion: ${auditResult.creditCompletionRate}%
    - Active Backlogs: ${auditResult.backlogsCount}
    - Academic Risk Level: ${auditResult.riskLevel}
    - Key Weaknesses Identified: ${JSON.stringify(auditResult.weakSubjects)}
    - Key Strengths Identified: ${JSON.stringify(auditResult.strongSubjects)}
    
    Please write:
    1. A detailed 2-3 sentence overview of their current standing.
    2. A structured set of 3 actionable steps tailored specifically to their risk level and weaknesses (especially addressing attendance or specific weak subjects).
    3. An encouraging sign-off.
    
    Format the response clearly as a readable text block with markdown bullet points. Do not include preambles like "Here is the response".
  `;

  if (aiModel) {
    try {
      const result = await aiModel.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Gemini generateAcademicInsights failed, falling back to heuristics:', error.message);
    }
  }

  // Sophisticated heuristic fallback
  return generateHeuristicAcademicInsights(auditResult, studentName);
};

/**
 * Generate AI-powered skill gap analysis commentary.
 */
export const generateSkillGapInsights = async (gapResult, studentName) => {
  if (!gapResult.hasTargetCareer) {
    return "Please select a target career profile in your profile settings to receive skill gap insights.";
  }

  const prompt = `
    You are a professional technical career coach.
    Provide actionable feedback for student "${studentName}" who is targetting the career role: "${gapResult.careerName}".
    
    Career Profile:
    - Career Path: ${gapResult.careerName}
    - Career Description: ${gapResult.careerDescription}
    - Skill Match Percentage: ${gapResult.matchPercentage}%
    - Matched Skills: ${gapResult.matchedSkills.map(s => s.name).join(', ')}
    - Partial Skills (Lower proficiency than required): ${gapResult.partialSkills.map(s => `${s.name} (Requires ${s.requiredProficiency}, has ${s.currentProficiency})`).join(', ')}
    - Missing Skills (Not in profile): ${gapResult.missingSkills.map(s => `${s.name} (Requires ${s.requiredProficiency})`).join(', ')}

    Please write:
    1. A brief analysis of their current preparedness (1-2 sentences).
    2. Highlight the most critical missing or partial skills they need to focus on next (based on importance).
    3. Suggest how their current matched skills will help them succeed.
    
    Keep it concise, professional, and career-oriented. Format in markdown.
  `;

  if (aiModel) {
    try {
      const result = await aiModel.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Gemini generateSkillGapInsights failed, falling back to heuristics:', error.message);
    }
  }

  // Heuristic fallback
  return generateHeuristicSkillGapInsights(gapResult, studentName);
};

/**
 * Generate AI-powered personalized weekly learning roadmap.
 */
export const generatePersonalizedRoadmap = async (gapResult, studentProfile) => {
  if (!gapResult.hasTargetCareer) {
    return {
      message: "Target career must be selected to generate a roadmap.",
      weeks: []
    };
  }

  const studyHours = studentProfile.learningPreferences?.weeklyHours || 5;
  const studyMode = studentProfile.learningPreferences?.mode || 'ONLINE';

  // Gather resources for missing skills to enrich prompt or fallback
  const missingSkillIds = [...gapResult.missingSkills, ...gapResult.partialSkills].map(s => s.skillId);
  const resources = await LearningResource.find({ skillId: { $in: missingSkillIds } }).populate('skillId');

  const prompt = `
    You are a curriculum designer.
    Design a personalized 4-week learning roadmap for a student targeting a "${gapResult.careerName}" role.
    
    Details:
    - Weekly Study Time: ${studyHours} hours
    - Study Mode Preference: ${studyMode}
    - Missing Skills: ${gapResult.missingSkills.map(s => `${s.name} (${s.requiredProficiency})`).join(', ')}
    - Skills Needing Upgrade (Partial): ${gapResult.partialSkills.map(s => `${s.name} (Need ${s.requiredProficiency}, has ${s.currentProficiency})`).join(', ')}
    - Available Learning Resources: ${resources.map(r => `[${r.title} by ${r.provider} - URL: ${r.url}]`).join(', ')}

    Generate a JSON object containing a weekly study outline for 4 weeks.
    The response MUST be valid JSON only, without any markdown formatting blocks or extra text.
    The JSON structure must be:
    {
      "explanation": "Brief overview of the roadmap strategy based on study hours.",
      "weeks": [
        {
          "weekNumber": 1,
          "focus": "Topic focus name",
          "objectives": ["Objective 1", "Objective 2"],
          "estimatedHours": ${studyHours},
          "resources": [
            { "title": "Resource title", "url": "Resource URL", "provider": "Provider" }
          ]
        },
        ... (up to week 4)
      ]
    }
  `;

  if (aiModel) {
    try {
      const result = await aiModel.generateContent(prompt);
      let text = result.response.text().trim();
      
      // Clean up markdown code blocks if the AI returned them
      if (text.startsWith('```json')) {
        text = text.substring(7, text.length - 3).trim();
      } else if (text.startsWith('```')) {
        text = text.substring(3, text.length - 3).trim();
      }

      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini generatePersonalizedRoadmap failed, falling back to heuristics:', error.message);
    }
  }

  // Heuristic fallback
  return generateHeuristicRoadmap(gapResult, resources, studyHours);
};

/**
 * AI Assistant chat endpoint.
 */
export const queryAssistant = async (message, context) => {
  const prompt = `
    You are the "Campus AI Companion", a supportive educational and career planning assistant.
    You have secure, authorized access to the following student's profile:
    
    Student Context:
    - Name: ${context.studentName}
    - CGPA: ${context.cgpa}
    - Overall Attendance: ${context.attendance}%
    - Academic Risk: ${context.riskLevel}
    - Active Backlogs: ${context.backlogsCount}
    - Selected Career Goal: ${context.careerGoal || 'Not selected'}
    - Skill Match %: ${context.skillMatch || 0}%
    - Strong Subjects: ${context.strongSubjects?.join(', ') || 'None'}
    - Weak Subjects: ${context.weakSubjects?.join(', ') || 'None'}
    - Missing Skills: ${context.missingSkills?.join(', ') || 'None'}
    
    Student's question: "${message}"

    Rules:
    - Respond concisely in a helpful, friendly academic advisor tone.
    - Refer directly to their actual marks, CGPA, attendance, or missing skills to justify your answers. Keep the explanations transparent.
    - Do not make up facts. Only discuss the subjects or skills mentioned.
    - Keep responses under 4-5 sentences where possible.
    - If the user asks about other students or unrelated topics, politely guide them back to their own academic status and career path.
  `;

  if (aiModel) {
    try {
      const result = await aiModel.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Gemini queryAssistant failed, falling back to heuristics:', error.message);
    }
  }

  return generateHeuristicAssistantResponse(message, context);
};


// ==========================================
// HEURISTIC NLP FALLBACK GENERATORS
// ==========================================

function generateHeuristicAcademicInsights(audit, name) {
  let overview = `Hello ${name}. Your overall academic score is calculated at **${audit.academicScore}/100**, and your academic risk is classified as **${audit.riskLevel}**. `;
  
  if (audit.riskLevel === 'CRITICAL RISK' || audit.riskLevel === 'HIGH RISK') {
    overview += `This classification is driven by critical factors in your profile requiring immediate correction to avoid credit deficit or administrative probation.`;
  } else if (audit.riskLevel === 'MODERATE RISK') {
    overview += `You are in a fair academic position, but minor improvements in attendance or assignment consistency are recommended to elevate your performance.`;
  } else {
    overview += `Your statistics indicate excellent standing. Keep doing what you're doing.`;
  }

  const steps = [];
  if (audit.attendanceRate < 75) {
    steps.push(`**Improve attendance immediately**: Your average attendance of **${audit.attendanceRate}%** is below the university guideline of 75%. Prioritize attending all lectures and clear any medical or personal absences with your department head.`);
  } else {
    steps.push(`**Maintain class attendance**: Your attendance is solid (**${audit.attendanceRate}%**). Continue attending regularly to preserve your internal assessment weight.`);
  }

  if (audit.backlogsCount > 0) {
    steps.push(`**Create backlog clearing plan**: You have **${audit.backlogsCount}** backlog course(s). Check the supplementary exam schedule and allocate 2 hours of study daily for clearance.`);
  } else if (audit.weakSubjects.length > 0) {
    const weakNames = audit.weakSubjects.map(s => s.name).join(', ');
    steps.push(`**Review Weak Subjects**: You have scored low in course(s): *${weakNames}*. Focus on doing revision sets, solving previous years' exam papers, and seeking peer assistance.`);
  } else {
    steps.push(`**Engage in Advanced Research**: Since you have zero backlogs and no weak subjects, consider participating in department research projects or extra-curricular hackathons.`);
  }

  if (audit.assignmentAvg < 75) {
    steps.push(`**Improve Assignment Standards**: Your average assignment score is **${audit.assignmentAvg}%**. Connect with your course coordinators to understand rubrics and submit deliverables ahead of time.`);
  } else {
    steps.push(`**Upskill further**: With an assignment average of **${audit.assignmentAvg}%**, your conceptual foundation is strong. Try applying this knowledge in your projects.`);
  }

  const recommendationsList = steps.map(s => `- ${s}`).join('\n');

  return `
### Academic Status Overview
${overview}

### Recommended Actions
${recommendationsList}

*Disclaimer: These insights are rule-based advice generated by the Academic Companion Engine.*
`;
}

function generateHeuristicSkillGapInsights(gap, name) {
  let text = `### Career Path Match: **${gap.careerName}**
You have matched **${gap.matchPercentage}%** of the skills required for the **${gap.careerName}** career track.

`;

  if (gap.matchPercentage >= 80) {
    text += `You are highly prepared for this role! You possess a robust set of matched skills like: *${gap.matchedSkills.map(s => s.name).join(', ')}*. Focus on polish and advanced projects.\n\n`;
  } else if (gap.matchPercentage >= 50) {
    text += `You have a promising start but have notable gaps in core skills. Upgrading your profile will substantially improve your hireability.\n\n`;
  } else {
    text += `You are in the early stages of preparing for this career. A dedicated learning approach is necessary to bridge these skill gaps.\n\n`;
  }

  if (gap.missingSkills.length > 0) {
    const criticalMissing = gap.missingSkills.filter(s => s.importance === 'HIGH').map(s => s.name);
    if (criticalMissing.length > 0) {
      text += `#### 🚨 High-Priority Missing Skills:
You must acquire the following essential skills which are highly valued in the industry: **${criticalMissing.join(', ')}**.\n\n`;
    }
  }

  if (gap.partialSkills.length > 0) {
    const partialToUpgrade = gap.partialSkills.map(s => `*${s.name}* (upgrade from ${s.currentProficiency} to ${s.requiredProficiency})`);
    text += `#### 📈 Skills to Upgrade:
You already have foundations in these skills but need to deepen your expertise: ${partialToUpgrade.join(', ')}.\n\n`;
  }

  if (gap.matchedSkills.length > 0) {
    text += `#### 🏆 Strengths:
Your profile stands out in: **${gap.matchedSkills.map(s => s.name).join(', ')}**. Make sure to highlight these on your resume.`;
  }

  return text;
}

function generateHeuristicRoadmap(gap, resources, studyHours) {
  const roadmap = {
    explanation: `Heuristic study schedule structured around ${studyHours} weekly learning hours. Focus is on bridging key gaps for the ${gap.careerName} path.`,
    weeks: []
  };

  const gapSkills = [...gap.missingSkills, ...gap.partialSkills];

  for (let i = 1; i <= 4; i++) {
    // Pick 1-2 skills for this week
    const skillIndex = (i - 1) % (gapSkills.length || 1);
    const targetSkill = gapSkills[skillIndex];

    const weekRes = resources
      .filter(r => r.skillId && targetSkill && r.skillId._id.toString() === targetSkill.skillId.toString())
      .map(r => ({ title: r.title, url: r.url, provider: r.provider }));

    if (targetSkill) {
      roadmap.weeks.push({
        weekNumber: i,
        focus: `Mastery of ${targetSkill.name}`,
        objectives: [
          `Understand fundamental theories of ${targetSkill.name}`,
          `Build 1 small implementation or complete a module lab in ${targetSkill.name}`,
          `Reach target proficiency: ${targetSkill.requiredProficiency}`
        ],
        estimatedHours: studyHours,
        resources: weekRes.length > 0 ? weekRes : [
          { title: `${targetSkill.name} Documentation`, url: 'https://docs.microsoft.com/en-us/', provider: 'Official Docs' }
        ]
      });
    } else {
      roadmap.weeks.push({
        weekNumber: i,
        focus: "Advanced Project Development",
        objectives: [
          "Consolidate your strong skills in a full-stack project",
          "Publish repository to GitHub and request faculty review"
        ],
        estimatedHours: studyHours,
        resources: [
          { title: "GitHub Projects Guide", url: "https://github.com", provider: "GitHub Docs" }
        ]
      });
    }
  }

  return roadmap;
}

function generateHeuristicAssistantResponse(message, context) {
  const msgLower = message.toLowerCase();

  if (msgLower.includes('risk') || msgLower.includes('at-risk')) {
    return `Hello ${context.studentName}, your current risk status is classified as **${context.riskLevel}**. This is based on your attendance rate of **${context.attendance}%** and CGPA of **${context.cgpa}**. ` +
      (context.riskLevel !== 'LOW RISK' 
        ? `We recommend checking the "Academic Audit" tab to review reasons like low performance in courses: ${context.weakSubjects?.join(', ') || 'None'}.` 
        : `Your record is clean and you are doing very well.`);
  }

  if (msgLower.includes('career') || msgLower.includes('job') || msgLower.includes('engineer') || msgLower.includes('role')) {
    if (!context.careerGoal) {
      return `It looks like you haven't set a target career path. Go to the "Profile" page and select a career (e.g. Software Engineer, Frontend Developer) to analyze your skill match percentage.`;
    }
    return `For your target career **${context.careerGoal}**, you have a **${context.skillMatch}%** skill match. The most critical skills you are missing are: **${context.missingSkills?.join(', ') || 'None'}**. You should explore the "Skill Gap" page to view custom roadmaps.`;
  }

  if (msgLower.includes('attendance')) {
    return `Your overall attendance is **${context.attendance}%**. Make sure it stays above 75% to avoid being flagged as High Risk. If you have weak attendance in individual subjects like ${context.weakSubjects?.join(', ') || 'None'}, try to consult with the respective faculty.`;
  }

  if (msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('hey')) {
    return `Hello ${context.studentName}! I am your Campus Companion AI. How can I help you today? You can ask me questions about your academic risk, career gaps, or study roadmap.`;
  }

  return `I understand you're asking about: "${message}". Based on your current CGPA of **${context.cgpa}** and target goal of **${context.careerGoal || 'Not set'}**, my advice is to focus on strengthening your foundations in: ${context.missingSkills?.slice(0, 3).join(', ') || 'core skills'} and completing any pending assignments. Let me know if you'd like a week-by-week study plan!`;
}
