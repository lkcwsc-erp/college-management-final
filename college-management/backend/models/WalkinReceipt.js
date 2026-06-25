// models/WalkinReceipt.js
// Persists Walk-in / Old Student fee receipts collected from the Accounts Section.
// These students may NOT have an Admission record, so their receipts cannot live
// inside Admission.feeLedger — hence a dedicated collection. They are merged into
// /admissions/receipts/all so the Payment History & Finance Overview show them too.
const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema(
  { label: String, amount: Number },
  { _id: false }
);

const walkinReceiptSchema = new mongoose.Schema(
  {
    receiptNo:     { type: String, index: true },
    studentName:   { type: String, default: '' },
    phone:         { type: String, default: '' },
    prnNo:         { type: String, default: '' },
    rollNo:        { type: String, default: '' },
    course:        { type: String, default: '' },
    admissionYear: { type: String, default: '' },
    feeType:       { type: String, default: '' },
    feeTypeLabel:  { type: String, default: '' },
    lineItems:     { type: [lineItemSchema], default: [] },
    amount:        { type: Number, default: 0 },
    paymentMode:   { type: String, default: 'cash' },
    transactionId: { type: String, default: '' },
    notes:         { type: String, default: '' },
    collectedBy:   { type: String, default: '' },
    paidAt:        { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WalkinReceipt', walkinReceiptSchema);
