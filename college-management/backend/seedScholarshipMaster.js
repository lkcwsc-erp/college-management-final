/* ============================================================
   seedScholarshipMaster.js
   Run once: node seedScholarshipMaster.js
   Seeds MahaDBT receivable amounts from actual fee structure
   Excel files (AY 2025-26)
   ============================================================ */

require('dotenv').config();
const mongoose         = require('mongoose');
const ScholarshipMaster = require('./models/ScholarshipMaster');

// ── MahaDBT Receivable Amounts from Excel (AY 2025-26) ─────
//
// B.Sc (Un-Aided):
//   FY = Enrollment(400) + Admission(550) + Tuition(16500) +
//        Gymkhana(700) + Lab(5250) + Library(1000) + Other(1340) = 25740
//   SY = Admission(550) + Tuition(16500) + Gymkhana(700) +
//        Lab(5250) + Library(1000) + Other(1340) = 25340
//   TY = Admission(550) + Tuition(16500) + Gymkhana(700) +
//        Lab(5250) + Library(1000) + Other(165) = 24165
//
// B.A (Un-Aided):
//   FY = Enrollment(400) + Admission(550) + Tuition(5500) +
//        Gymkhana(700) + Lab(300) + Library(1000) + Other(1540) = 9990
//   SY = Admission(550) + Tuition(5500) + Gymkhana(700) +
//        Lab(300) + Library(1000) + Other(1540) = 9590
//   TY = Admission(550) + Tuition(5500) + Gymkhana(700) +
//        Lab(300) + Library(1000) + Other(1340) = 9390

const academicYear = '2025-26';

// Categories eligible for MahaDBT scholarship
// (OPEN/EWS get lower amounts — adjust as per government notification)
// Below uses the full MahaDBT receivable as base for SC/ST/OBC etc.
// For OPEN/EWS categories, reduce accordingly (typically 50% or fixed amount)

const bscAmounts = { FY: 25740, SY: 25340, TY: 24165 };
const baAmounts  = { FY: 9990,  SY: 9590,  TY: 9390  };

const eligibleCategories = [
  'SC', 'ST', 'OBC', 'VJ/DT(NT-A)', 'NT-B', 'NT-C', 'NT-D', 'SBC', 'SEBC',
];
// EWS typically gets a different (often partial) amount — add separately if needed
const ewsCategories = ['EWS'];

const records = [];

// B.Sc — eligible categories (full amount)
for (const category of eligibleCategories) {
  for (const [year, amount] of Object.entries(bscAmounts)) {
    records.push({ category, courseType: 'B.Sc', admissionYear: year, academicYear, scholarshipAmount: amount });
  }
}
// B.Sc — EWS (example: use same amount; update if different govt rate applies)
for (const [year, amount] of Object.entries(bscAmounts)) {
  records.push({ category: 'EWS', courseType: 'B.Sc', admissionYear: year, academicYear, scholarshipAmount: amount });
}

// B.A — eligible categories (full amount)
for (const category of eligibleCategories) {
  for (const [year, amount] of Object.entries(baAmounts)) {
    records.push({ category, courseType: 'B.A', admissionYear: year, academicYear, scholarshipAmount: amount });
  }
}
// B.A — EWS
for (const [year, amount] of Object.entries(baAmounts)) {
  records.push({ category: 'EWS', courseType: 'B.A', admissionYear: year, academicYear, scholarshipAmount: amount });
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  let created = 0, skipped = 0;

  for (const rec of records) {
    try {
      await ScholarshipMaster.create({ ...rec, createdBy: 'Seed Script', isActive: true });
      console.log(`✅ ${rec.category} + ${rec.courseType} + ${rec.admissionYear} = ₹${rec.scholarshipAmount}`);
      created++;
    } catch (err) {
      if (err.code === 11000) {
        console.log(`⚠️  Skip (exists): ${rec.category} + ${rec.courseType} + ${rec.admissionYear}`);
        skipped++;
      } else {
        console.error(`❌ Error: ${err.message}`);
      }
    }
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
  mongoose.disconnect();
}

seed().catch(console.error);
