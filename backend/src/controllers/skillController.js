import Skill from '../models/Skill.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Get all skills
// @route   GET /api/skills
// @access  Private
export const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find({}).sort({ category: 1, name: 1 });
    res.json({
      success: true,
      data: skills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Create new skill
// @route   POST /api/skills
// @access  Private (Admin)
export const createSkill = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name and Category are required',
      });
    }

    const existingSkill = await Skill.findOne({ name });
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists with this name',
      });
    }

    const skill = await Skill.create({
      name,
      category,
      description,
    });

    await AuditLog.create({
      userId: req.user._id,
      action: 'SKILL_CREATED',
      details: `Created skill: ${name} (${category})`,
      ip: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      success: true,
      data: skill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private (Admin)
export const updateSkill = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    let skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found',
      });
    }

    if (name) skill.name = name;
    if (category) skill.category = category;
    if (description) skill.description = description;

    await skill.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'SKILL_MODIFIED',
      details: `Modified skill: ${skill.name} (Category: ${skill.category})`,
      ip: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      data: skill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private (Admin)
export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found',
      });
    }

    const skillName = skill.name;
    await skill.deleteOne();

    await AuditLog.create({
      userId: req.user._id,
      action: 'SKILL_DELETED',
      details: `Deleted skill: ${skillName}`,
      ip: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      message: 'Skill deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};
