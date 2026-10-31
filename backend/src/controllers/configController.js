import SystemConfig from '../models/SystemConfig.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Get all system configurations
// @route   GET /api/admin/config
// @access  Private (Admin)
export const getConfigs = async (req, res) => {
  try {
    const configs = await SystemConfig.find({});
    res.json({
      success: true,
      data: configs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Update or create a system configuration
// @route   PUT /api/admin/config
// @access  Private (Admin)
export const updateConfig = async (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Key and Value are required',
      });
    }

    let config = await SystemConfig.findOne({ key });

    if (config) {
      config.value = value;
      await config.save();
    } else {
      config = await SystemConfig.create({ key, value });
    }

    await AuditLog.create({
      userId: req.user._id,
      action: 'SYSTEM_CONFIG_UPDATED',
      details: `Updated config key "${key}" to value: ${JSON.stringify(value)}`,
      ip: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      message: `Configuration for "${key}" updated successfully`,
      data: config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};
