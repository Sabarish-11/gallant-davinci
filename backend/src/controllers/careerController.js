import Career from '../models/Career.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Get all careers
// @route   GET /api/careers
// @access  Private
export const getCareers = async (req, res) => {
  try {
    const careers = await Career.find({}).populate('requiredSkills.skillId');
    res.json({
      success: true,
      data: careers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Get career by ID
// @route   GET /api/careers/:id
// @access  Private
export const getCareerById = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id).populate('requiredSkills.skillId');
    if (!career) {
      return res.status(404).json({
        success: false,
        message: 'Career profile not found',
      });
    }

    res.json({
      success: true,
      data: career,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Create new career profile
// @route   POST /api/careers
// @access  Private (Admin)
export const createCareer = async (req, res) => {
  try {
    const { name, description, requiredSkills } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Career name is required',
      });
    }

    const existingCareer = await Career.findOne({ name });
    if (existingCareer) {
      return res.status(400).json({
        success: false,
        message: 'Career profile already exists with this name',
      });
    }

    const career = await Career.create({
      name,
      description,
      requiredSkills: requiredSkills || [],
    });

    await AuditLog.create({
      userId: req.user._id,
      action: 'CAREER_CREATED',
      details: `Created career: ${name} with ${requiredSkills?.length || 0} skills`,
      ip: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      success: true,
      data: career,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Update career profile
// @route   PUT /api/careers/:id
// @access  Private (Admin)
export const updateCareer = async (req, res) => {
  try {
    const { name, description, requiredSkills } = req.body;

    let career = await Career.findById(req.params.id);
    if (!career) {
      return res.status(404).json({
        success: false,
        message: 'Career profile not found',
      });
    }

    if (name) career.name = name;
    if (description) career.description = description;
    if (requiredSkills) career.requiredSkills = requiredSkills;

    await career.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'CAREER_MODIFIED',
      details: `Modified career ID ${career._id} (${career.name})`,
      ip: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      data: career,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Delete career profile
// @route   DELETE /api/careers/:id
// @access  Private (Admin)
export const deleteCareer = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    if (!career) {
      return res.status(404).json({
        success: false,
        message: 'Career profile not found',
      });
    }

    const name = career.name;
    await career.deleteOne();

    await AuditLog.create({
      userId: req.user._id,
      action: 'CAREER_DELETED',
      details: `Deleted career path: ${name}`,
      ip: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      message: 'Career profile deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};
