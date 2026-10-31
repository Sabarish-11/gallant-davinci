import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import AuditLog from '../models/AuditLog.js';

// Generate Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'dev_jwt_secret_token_academic_audit_companion_987654321',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, studentId, department, batch, semester } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    if (role === 'STUDENT' && studentId) {
      const studentIdExists = await User.findOne({ studentId });
      if (studentIdExists) {
        return res.status(400).json({
          success: false,
          message: 'Student ID already registered',
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || 'STUDENT',
      studentId: role === 'STUDENT' ? studentId : undefined,
      department,
      batch: role === 'STUDENT' ? batch : undefined,
      semester: role === 'STUDENT' ? semester || 1 : undefined,
    });

    if (user) {
      // If student, create student profile
      if (user.role === 'STUDENT') {
        await StudentProfile.create({
          userId: user._id,
          cgpa: 0.0,
          attendance: 100.0,
          skills: [],
          certifications: [],
          projects: [],
        });
      }

      // Log the registration action
      await AuditLog.create({
        userId: user._id,
        action: 'USER_REGISTERED',
        details: `User registered with email: ${email}, role: ${user.role}`,
        ip: req.ip || '127.0.0.1',
      });

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data',
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find User
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact administrator.',
      });
    }

    // Log the login action
    await AuditLog.create({
      userId: user._id,
      action: 'USER_LOGGED_IN',
      details: `User logged in with email: ${email}`,
      ip: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        batch: user.batch,
        semester: user.semester,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let profileData = null;
    if (user.role === 'STUDENT') {
      profileData = await StudentProfile.findOne({ userId: user._id }).populate('preferredCareer');
    }

    res.json({
      success: true,
      data: {
        user,
        profile: profileData,
      },
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};
