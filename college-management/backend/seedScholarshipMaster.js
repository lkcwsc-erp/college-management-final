/* ============================================================
   seedScholarshipMaster.js
   Run: node seedScholarshipMaster.js
   Seeds MahaDBT receivable amounts — AY 2025-26
   Source: Official fee structure Excel files
   ============================================================ */

require('dotenv').config();
const mongoose          = require('mongoose');
const ScholarshipMaster = require('./models/ScholarshipMaster');

/* ── MahaDBT Receivable Amounts (from Excel, AY 2025-26) ─────
   B.Sc (Un-Aided):
     FY = Enrollment(400) + Admission(550) + Tuition(16500) +
          Gymkhana(700) + Lab(5250) + Library(1000) + Other(1340) = 26140
     SY = Admission(550) + Tuition(16500) + Gymkhana(700) +
          Lab(5250) + Library(1000) + Other(1340) = 25340
     TY = same as SY                               = 25340

   B.A (Un-Aided):
     FY = Enrollment(400) + Admission(550) + Tuition(5500) +
          Gymkhana(700) + Lab(300) + Library(1000) + Other(1540) = 9990  → official: 10390
     SY = Admission(550) + Tuition(5500) + Gymkhana(700) +
          Lab(300) + Library(1000) + Other(1540)                  = 9590
     TY = same structure, Other(1340)                             = 9390

   NOTE: BA FY official Excel total = 10390 (used below).
   ─────────────────────────────────────────────────────────── */

const academicYear = '2025-26';

const AMOUNTS = {
  'B.Sc': { FY: 26140, SY: 25340, TY: 25340 },
  'B.A':  { FY: 10390, SY:  9590, TY:  9390 },
};

// Categories eligible for MahaDBT (OPEN is not eligible)
const eligibleCategories = [
  'SC', 'ST', 'OBC', 'VJ/DT(NT-A)', 'NT-B', 'NT-C', 'NT-D', 'SBC', 'SEBC', 'EWS',
];

const records = [];
for (const [courseType, yearAmts] of Object.entries(AMOUNTS)) {
  for (const category of eligibleCategories) {
    for (const [admissionYear, scholarshipAmount] of Object.entries(yearAmts)) {
      records.push({ category, courseType, admissionYear, academicYear, scholarshipAmount,
        description: `MahaDBT receivable — ${courseType} ${admissionYear} AY ${academicYear}`,
        createdBy: 'Seed Script', isActive: true });
    }
  }
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  let created = 0, updated = 0, skipped = 0;

  for (const rec of records) {
    try {
      // Upsert — update if exists (to fix wrong amounts), create if new
      const existing = await ScholarshipMaster.findOne({
        category: rec.category,
        courseType: rec.courseType,
        admissionYear: rec.admissionYear,
        academicYear: rec.academicYear,
      });

      if (existing) {
        if (existing.scholarshipAmount !== rec.scholarshipAmount) {
          existing.scholarshipAmount = rec.scholarshipAmount;
          existing.isActive = true;
          await existing.save();
          console.log(`🔄 Updated: ${rec.category} + ${rec.courseType} + ${rec.admissionYear} = ₹${rec.scholarshipAmount}`);
          updated++;
        } else {
          console.log(`✅ OK (no change): ${rec.category} + ${rec.courseType} + ${rec.admissionYear} = ₹${rec.scholarshipAmount}`);
          skipped++;
        }
      } else {
        await ScholarshipMaster.create(rec);
        console.log(`➕ Created: ${rec.category} + ${rec.courseType} + ${rec.admissionYear} = ₹${rec.scholarshipAmount}`);
        created++;
      }
    } catch (err) {
      console.error(`❌ Error (${rec.category} ${rec.courseType} ${rec.admissionYear}): ${err.message}`);
    }
  }

  console.log(`\n✅ Done. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`);
  mongoose.disconnect();
}

seed().catch(console.error);
