import AuditLog from '../models/AuditLog.js';

// @desc    Get system audit logs
// @route   GET /api/audit-logs
// @access  Private (Admin)
export const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find({})
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalLogs = await AuditLog.countDocuments({});

    res.json({
      success: true,
      count: logs.length,
      totalPages: Math.ceil(totalLogs / limit),
      currentPage: page,
      totalCount: totalLogs,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};
