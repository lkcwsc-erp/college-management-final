const express = require('express');
const router = express.Router();

const {
  getAllStaff,
  getStaffById,
  getMyProfile,
  createStaff,
  updateStaff,
  deleteStaff,
  staffLogin
} = require('../controllers/staffController');

const {
  protect,
  authorizeRoles
} = require('../middleware/authMiddleware');

router.post('/login', staffLogin);

router.get(
  '/',
  protect,
  authorizeRoles('admin', 'staff_principal'),
  getAllStaff
);

router.get(
  '/my-profile',
  protect,
  authorizeRoles('staff', 'staff_principal'),
  getMyProfile
);

router.get(
  '/:id',
  protect,
  authorizeRoles('admin', 'staff_principal'),
  getStaffById
);

router.post(
  '/',
  protect,
  authorizeRoles('admin', 'staff_principal'),
  createStaff
);

router.put(
  '/:id',
  protect,
  authorizeRoles('admin', 'staff_principal'),
  updateStaff
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('admin', 'staff_principal'),
  deleteStaff
);

module.exports = router;
