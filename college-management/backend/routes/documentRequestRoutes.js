const express = require('express');
const router = express.Router();
const DocumentRequest = require('../models/DocumentRequest');
const Admission = require('../models/Admission');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// ============ STUDENT: Submit New Document Request ============
router.post('/', protect, async (req, res) => {
  try {
    const { documentType, reason, urgency } = req.body;

    // Validate document type
    const validTypes = ['ID_CARD', 'MARKSHEET', 'MIGRATION', 'TC', 'BONAFIDE'];
    if (!validTypes.includes(documentType)) {
      return res.status(400).json({ success: false, message: 'Invalid document type' });
    }

    // Auto-fetch student details from their admission
    const admission = await Admission.findOne({ email: req.user.email });

    const labels = {
      'ID_CARD': '🪪 ID Card',
      'MARKSHEET': '📄 Marksheet',
      'MIGRATION': '📜 Migration Certificate',
      'TC': '🎓 Transfer Certificate (TC)',
      'BONAFIDE': '📋 Bonafide Certificate'
    };

    const data = {
      student: req.user._id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      studentPhone: req.user.phone || '',
      documentType,
      documentTypeLabel: labels[documentType] || documentType,
      reason: reason || '',
      urgency: urgency || 'normal',
      status: 'pending_accounts'
    };

    // Auto-fill from admission
    if (admission) {
      data.branch = admission.courseType || '';
      data.admissionYear = admission.admissionYear || '';
      data.rollNumber = admission.rollNumber || '';
      // Calculate batch (e.g., 2026-2027)
      if (admission.admissionYear) {
        const currentYear = new Date().getFullYear();
        data.batch = `${currentYear}-${currentYear + 1}`;
      }
    }

    const request = await DocumentRequest.create(data);

    res.status(201).json({
      success: true,
      message: 'Document request submitted! Waiting for Accounts Section review.',
      request
    });
  } catch (error) {
    console.error('❌ Document request error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ STUDENT: View My Requests ============
router.get('/my', protect, async (req, res) => {
  try {
    const requests = await DocumentRequest.find({ studentEmail: req.user.email })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ACCOUNTS SECTION: View Pending Requests ============
router.get('/accounts/pending', protect, authorizeRoles('staff_accounts', 'admin'), async (req, res) => {
  try {
    const requests = await DocumentRequest.find({ status: 'pending_accounts' })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ACCOUNTS SECTION: View All My Processed ============
router.get('/accounts/all', protect, authorizeRoles('staff_accounts', 'admin'), async (req, res) => {
  try {
    const requests = await DocumentRequest.find({
      $or: [
        { status: 'pending_accounts' },
        { accountsApprovedBy: { $ne: '' } }
      ]
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ACCOUNTS APPROVES ============
router.put('/accounts/approve/:id', protect, authorizeRoles('staff_accounts', 'admin'), async (req, res) => {
  try {
    const { notes } = req.body;
    const request = await DocumentRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'pending_accounts') {
      return res.status(400).json({ success: false, message: 'This request is no longer pending in Accounts.' });
    }

    // Decide next stage
    // TC → goes to Principal
    // Other docs → goes directly to Student Section for generation
    const isTC = request.documentType === 'TC';
    const newStatus = isTC ? 'pending_principal' : 'pending_generation';

    request.status = newStatus;
    request.accountsApprovedBy = req.user.name || req.user.email;
    request.accountsApprovedDate = new Date();
    request.accountsNotes = notes || '';
    await request.save();

    res.status(200).json({
      success: true,
      message: isTC
        ? '✅ TC approved! Forwarded to Principal for final approval.'
        : '✅ Approved! Forwarded to Student Section for document generation.',
      request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ACCOUNTS REJECTS ============
router.put('/accounts/reject/:id', protect, authorizeRoles('staff_accounts', 'admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await DocumentRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected_by_accounts',
        rejectionReason: reason || 'Rejected by Accounts',
        rejectedBy: req.user.name || req.user.email,
        rejectedAt: 'accounts',
        accountsApprovedBy: req.user.name || req.user.email,
        accountsApprovedDate: new Date(),
        accountsNotes: reason || ''
      },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Request rejected.', request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ PRINCIPAL: View TC Requests Pending ============
router.get('/principal/pending', protect, authorizeRoles('staff_principal', 'admin'), async (req, res) => {
  try {
    const requests = await DocumentRequest.find({
      status: 'pending_principal',
      documentType: 'TC'
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ PRINCIPAL: View All My Processed ============
router.get('/principal/all', protect, authorizeRoles('staff_principal', 'admin'), async (req, res) => {
  try {
    const requests = await DocumentRequest.find({
      documentType: 'TC',
      $or: [
        { status: 'pending_principal' },
        { principalApprovedBy: { $ne: '' } }
      ]
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ PRINCIPAL APPROVES TC ============
router.put('/principal/approve/:id', protect, authorizeRoles('staff_principal', 'admin'), async (req, res) => {
  try {
    const { notes } = req.body;
    const request = await DocumentRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (request.documentType !== 'TC') {
      return res.status(400).json({ success: false, message: 'Only TC requests need Principal approval' });
    }
    if (request.status !== 'pending_principal') {
      return res.status(400).json({ success: false, message: 'This request is no longer pending in Principal.' });
    }

    request.status = 'pending_generation';
    request.principalApprovedBy = req.user.name || req.user.email;
    request.principalApprovedDate = new Date();
    request.principalNotes = notes || '';
    await request.save();

    res.status(200).json({
      success: true,
      message: '✅ TC approved by Principal! Forwarded to Student Section.',
      request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ PRINCIPAL REJECTS TC ============
router.put('/principal/reject/:id', protect, authorizeRoles('staff_principal', 'admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await DocumentRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected_by_principal',
        rejectionReason: reason || 'Rejected by Principal',
        rejectedBy: req.user.name || req.user.email,
        rejectedAt: 'principal',
        principalApprovedBy: req.user.name || req.user.email,
        principalApprovedDate: new Date(),
        principalNotes: reason || ''
      },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Request rejected.', request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ STUDENT SECTION: View Ready-to-Generate Requests ============
router.get('/student-section/pending', protect, authorizeRoles('staff_student', 'admin'), async (req, res) => {
  try {
    const requests = await DocumentRequest.find({ status: 'pending_generation' })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ STUDENT SECTION: View All Processed ============
router.get('/student-section/all', protect, authorizeRoles('staff_student', 'admin'), async (req, res) => {
  try {
    const requests = await DocumentRequest.find({
      $or: [
        { status: 'pending_generation' },
        { status: 'completed' }
      ]
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ STUDENT SECTION: Mark As Generated/Completed ============
router.put('/student-section/complete/:id', protect, authorizeRoles('staff_student', 'admin'), async (req, res) => {
  try {
    const { notes, documentFile } = req.body;
    const request = await DocumentRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'completed',
        generatedBy: req.user.name || req.user.email,
        generatedDate: new Date(),
        generationNotes: notes || '',
        generatedDocumentFile: documentFile || ''
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: '✅ Document generated! Student notified.',
      request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ADMIN: View All ============
router.get('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const requests = await DocumentRequest.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ DELETE ============
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    await DocumentRequest.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
