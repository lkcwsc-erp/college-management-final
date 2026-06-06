const Contact = require('../models/Contact');

// Create new contact message (public)
exports.createContact = async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json({ success: true, message: 'Message sent successfully', contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all contact messages (admin only)
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: contacts.length, contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark as read (admin only)
exports.markAsRead = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.status(200).json({ success: true, contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ NEW: Update admin reply (admin only)
exports.updateReply = async (req, res) => {
  try {
    const { adminReply } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        adminReply: adminReply,
        isRead: true,
        repliedBy: req.user._id,
        repliedAt: new Date(),
      },
      { new: true }
    );
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });
    res.status(200).json({ success: true, message: 'Reply saved successfully', contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ NEW: Delete contact message (admin only)
exports.deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
