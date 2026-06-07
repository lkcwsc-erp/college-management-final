// routes/docFeeTypeRoutes.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/docFeeTypeController');

router.get('/',          protect, ctrl.getAll);
router.get('/approved',  protect, ctrl.getApproved);
router.post('/',         protect, ctrl.create);
router.put('/:id/approve', protect, ctrl.approve);
router.put('/:id/reject',  protect, ctrl.reject);
router.put('/:id',       protect, ctrl.updatePrice);
router.delete('/:id',    protect, ctrl.remove);

module.exports = router;
