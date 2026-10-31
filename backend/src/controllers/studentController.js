import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Get student profile
// @route   GET /api/students/me
// @access  Private (Student)
export const getMyProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id }).populate('preferredCareer');
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Update student profile (projects, certifications, preferences)
// @route   PUT /api/students/me
// @access  Private (Student)
export const updateMyProfile = async (req, res) => {
  try {
    const { projects, certifications, learningPreferences } = req.body;

    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    if (projects) profile.projects = projects;
    if (certifications) profile.certifications = certifications;
    if (learningPreferences) profile.learningPreferences = learningPreferences;

    await profile.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'PROFILE_UPDATED',
      details: 'Updated projects, certifications, or learning preferences',
      ip: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Update student skills
// @route   PUT /api/students/me/skills
// @access  Private (Student)
export const updateMySkills = async (req, res) => {
  try {
    const { skills } = req.body; // Array of { name, proficiency }

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: 'Skills must be an array',
      });
    }

    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    profile.skills = skills;
    await profile.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'SKILLS_UPDATED',
      details: `Updated skills list. Total skills: ${skills.length}`,
      ip: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      message: 'Skills updated successfully',
      data: profile.skills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Update target career
// @route   PUT /api/students/me/career
// @access  Private (Student)
export const updateMyCareer = async (req, res) => {
  try {
    const { preferredCareerId } = req.body;

    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    profile.preferredCareer = preferredCareerId || null;
    await profile.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'CAREER_GOAL_UPDATED',
      details: `Preferred career updated to: ${preferredCareerId || 'None'}`,
      ip: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      message: 'Preferred career updated successfully',
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Get all students with search, filters, pagination
// @route   GET /api/students
// @access  Private (Faculty/Admin)
export const getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || '';
    const department = req.query.department || '';
    const semester = req.query.semester || '';
    const batch = req.query.batch || '';

    // Build query for User table matching STUDENTS role
    const userQuery = { role: 'STUDENT' };

    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) {
      userQuery.department = department;
    }

    if (semester) {
      userQuery.semester = parseInt(semester);
    }

    if (batch) {
      userQuery.batch = batch;
    }

    // Get matching users
    const users = await User.find(userQuery)
      .select('-passwordHash')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments(userQuery);

    // Get profiles for these users
    const userIds = users.map(u => u._id);
    const profiles = await StudentProfile.find({ userId: { $in: userIds } }).populate('preferredCareer');

    // Merge users and profiles
    const mergedStudents = users.map(user => {
      const prof = profiles.find(p => p.userId.toString() === user._id.toString());
      return {
        ...user.toObject(),
        profile: prof || null,
      };
    });

    res.json({
      success: true,
      count: mergedStudents.length,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      totalCount: totalUsers,
      data: mergedStudents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Get single student details by user id
// @route   GET /api/students/:id
// @access  Private (Faculty/Admin)
export const getStudentById = async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'STUDENT' }).select('-passwordHash');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const profile = await StudentProfile.findOne({ userId: student._id }).populate('preferredCareer');

    res.json({
      success: true,
      data: {
        ...student.toObject(),
        profile: profile || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};
