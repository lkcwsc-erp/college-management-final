/* ============================================================
   models/CollegeFeeStructure.js
   Stores the complete college fee structure per course + academic year.
   Each document = one course (B.Sc. / B.A.) for one academic year.
   Fee items are stored as an array so they can be added/edited/deleted.

   NOTE: This file replaces the old, broken filename
   "Collegefeestructure #U00b7 JS" (the middle-dot character in the
   original filename made it un-requireable on most filesystems, which
   is why the fee-structure API was never actually wired up on the
   backend). Delete the old file once this one is in place.
   ============================================================ */
const mongoose = require('mongoose');

const feeItemSchema = new mongoose.Schema({
  id:       { type: String, required: true },          // e.g. 'bsc_c2'
  name:     { type: String, required: true, trim: true },
  section:  { type: String, enum: ['University', 'College'], required: true },
  // 6 values: [Sem1, Sem2, Sem3, Sem4, Sem5, Sem6]
  s:        { type: [Number], default: [0,0,0,0,0,0] },
}, { _id: false });

const collegeFeeStructureSchema = new mongoose.Schema({
  courseType:   {
    type: String,
    required: true,
    trim: true,
    // 'B.Sc.' / 'B.A.' — matches keys used in DETAILED_FEES (Accounts Section)
  },
  academicYear: {
    type: String,
    required: true,
    trim: true,
    // e.g. '2025-26', '2026-27', '2027-28' ...
  },
  items: [feeItemSchema],
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, default: '' },
  updatedBy: { type: String, default: '' },
}, { timestamps: true });

// One document per course + academic year
collegeFeeStructureSchema.index(
  { courseType: 1, academicYear: 1 },
  { unique: true }
);

module.exports = mongoose.model('CollegeFeeStructure', collegeFeeStructureSchema);
