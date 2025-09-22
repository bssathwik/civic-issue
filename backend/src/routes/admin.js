const express = require('express');
const {
  createAdmin,
  getAllAdmins,
  updateAdminRole,
  deactivateAdmin,
  getAdminStats
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateAdminCreation } = require('../middleware/validation');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Admin management routes
router.post('/create', validateAdminCreation, createAdmin);
router.get('/', getAllAdmins);
router.get('/stats', getAdminStats);
router.put('/:id/role', updateAdminRole);
router.put('/:id/deactivate', deactivateAdmin);

module.exports = router;