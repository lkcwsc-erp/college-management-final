/* ============================================================
   seedScholarshipMaster.js
   Run: node seedScholarshipMaster.js
   Seeds MahaDBT receivable amounts — AY 2025-26
   Source: Official fee structure Excel files

   Model fields used:
     categories[]     ← array of categories (new model)
     mahaDBTReceivable ← amount field (new model)
   ============================================================ */

require('dotenv').config();
const mongoose          = require('mongoose');
const ScholarshipMaster = require('./models/ScholarshipMaster');

/* ── MahaDBT Receivable Amounts (from Excel, AY 2025-26) ─────
   B.Sc (Un-Aided):
     FY = Enrollment(400) + Admission(550) + Tuition(16500) +
          Gymkhana(700) + Lab(5250) + Library(1000) + Other(1740) = 26140
     SY = Admission(550) + Tuition(16500) + Gymkhana(700) +
          Lab(5250) + Library(1000) + Other(1340)                 = 25340
     TY = same as SY                                              = 25340

   B.A (Un-Aided):
     FY = 10390  (official Excel total)
     SY =  9590
     TY =  9390

   NOTE: OPEN category gets Tuition Fee only (handled in auto-calculate).
         This seed stores the FULL amount for reserved categories.
   ─────────────────────────────────────────────────────────── */

const academicYear = '2025-26';

const AMOUNTS = {
  'B.Sc': { FY: 26140, SY: 25340, TY: 25340 },
  'B.A':  { FY: 10390, SY:  9590, TY:  9390 },
};

// Tuition fees only — used for OPEN category calculation reference
const TUITION_FEES = {
  'B.Sc': { FY: 16500, SY: 16500, TY: 16500 },
  'B.A':  { FY:  5500, SY:  5500, TY:  5500 },
};

// Reserved categories — get full MahaDBT benefit
const RESERVED_CATEGORIES = [
  'SC', 'ST', 'OBC', 'VJ/DT(NT-A)', 'NT-B', 'NT-C', 'NT-D', 'SBC', 'SEBC', 'EWS',
];

/* ── Strategy: one record per courseType + admissionYear
      with ALL reserved categories in the categories[] array.
      This is cleaner than 10 records per course+year combo.
   ─────────────────────────────────────────────────────────── */
const records = [];

for (const [courseType, yearAmts] of Object.entries(AMOUNTS)) {
  for (const [admissionYear, amount] of Object.entries(yearAmts)) {
    // One record: all reserved categories for this course + year
    records.push({
      categories:       RESERVED_CATEGORIES,
      courseType,
      admissionYear,
      academicYear,
      mahaDBTReceivable: amount,
      tuitionFee:        TUITION_FEES[courseType]?.[admissionYear] || 0,
      description:       `MahaDBT receivable — ${courseType} ${admissionYear} AY ${academicYear} (Reserved categories)`,
      createdBy:         'Seed Script',
      isActive:          true,
    });

    // Separate record for OPEN category — tuition fee only
    records.push({
      categories:       ['OPEN'],
      courseType,
      admissionYear,
      academicYear,
      mahaDBTReceivable: TUITION_FEES[courseType]?.[admissionYear] || 0,
      tuitionFee:        TUITION_FEES[courseType]?.[admissionYear] || 0,
      description:       `MahaDBT receivable — ${courseType} ${admissionYear} AY ${academicYear} (OPEN — Tuition Fee only)`,
      createdBy:         'Seed Script',
      isActive:          true,
    });
  }
}

/* ── Seed function ─────────────────────────────────────────── */
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  let created = 0, updated = 0, skipped = 0, errors = 0;

  for (const rec of records) {
    const label = `[${rec.categories.join('+')}] ${rec.courseType} ${rec.admissionYear} ${rec.academicYear}`;
    try {
      // Match on courseType + admissionYear + academicYear + same category set
      // We check if a record already covers the same categories array
      const existing = await ScholarshipMaster.findOne({
        courseType:    rec.courseType,
        admissionYear: rec.admissionYear,
        academicYear:  rec.academicYear,
        // Match records where categories array has the same length and same first element
        // (good enough for upsert — avoids duplicates)
        categories:    { $all: rec.categories, $size: rec.categories.length },
      });

      if (existing) {
        const needsUpdate =
          existing.mahaDBTReceivable !== rec.mahaDBTReceivable ||
          existing.isActive !== true;

        if (needsUpdate) {
          existing.mahaDBTReceivable = rec.mahaDBTReceivable;
          existing.isActive          = true;
          existing.description       = rec.description;
          await existing.save();
          console.log(`🔄 Updated:  ${label} = ₹${rec.mahaDBTReceivable}`);
          updated++;
        } else {
          console.log(`✅ OK:       ${label} = ₹${rec.mahaDBTReceivable}`);
          skipped++;
        }
      } else {
        await ScholarshipMaster.create(rec);
        console.log(`➕ Created:  ${label} = ₹${rec.mahaDBTReceivable}`);
        created++;
      }
    } catch (err) {
      console.error(`❌ Error    (${label}): ${err.message}`);
      errors++;
    }
  }

  console.log('\n─────────────────────────────────────────');
  console.log(`➕ Created : ${created}`);
  console.log(`🔄 Updated : ${updated}`);
  console.log(`✅ Skipped : ${skipped}`);
  console.log(`❌ Errors  : ${errors}`);
  console.log('─────────────────────────────────────────\n');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

seed().catch(console.error);
