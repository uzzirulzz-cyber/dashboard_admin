const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ADMIN_ROLES = ['admin','super_admin','manager'];
const STAFF_ROLES = ['admin','super_admin','manager','support','content_manager'];

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'User not found or inactive' });
    if (user.isSuspended) return res.status(403).json({ success: false, message: 'Account suspended: ' + (user.suspendReason || '') });
    if (user.isBanned) return res.status(403).json({ success: false, message: 'Account banned' });
    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch {}
  next();
};

const admin = (req, res, next) => {
  if (!req.user || !ADMIN_ROLES.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

const superAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Super admin access required' });
  }
  next();
};

const staff = (req, res, next) => {
  if (!req.user || !STAFF_ROLES.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Staff access required' });
  }
  next();
};

// Audit log helper
const logAudit = async (req, action, resource, resourceId, details, success = true) => {
  try {
    const { AuditLog } = require('../models/Misc');
    await AuditLog.create({
      user: req.user?._id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action,
      resource,
      resourceId: resourceId?.toString(),
      details,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      success
    });
  } catch {}
};

module.exports = { protect, optionalAuth, admin, superAdmin, staff, logAudit };
