/* ============================================================
   controllers/collegeFeeStructureController.js
   CRUD for college fee structure (total fees per item).
   Used by: Accounts Section (create/edit) and
            Scholarship Section → MahaDBT Receivable (read, apply
            year-wise + category-wise).
   ============================================================ */
const CollegeFeeStructure = require('../models/CollegeFeeStructure');

/* ── helper: derive yearly totals from item array ─────────── */
function deriveYearTotals(items) {
  // yearIdx: FY=[0,1], SY=[2,3], TY=[4,5]
  const years = { FY: [0,1], SY: [2,3], TY: [4,5] };
  const totals = {};
  for (const [yr, idxs] of Object.entries(years)) {
    totals[yr] = items.reduce(
      (sum, item) => sum + (item.s[idxs[0]] || 0) + (item.s[idxs[1]] || 0),
      0
    );
  }
  return totals; // { FY: 30677, SY: 28957, TY: 30692 }
}

/* ── helper: derive Tuition-Fee-only totals per year ──────────
   Used for the "OPEN" scholarship category, which under MahaDBT
   only covers the Tuition Fee, not the full fee structure.        */
function deriveTuitionByYear(items) {
  const years = { FY: [0,1], SY: [2,3], TY: [4,5] };
  const tuitionItems = items.filter(item => /tuition\s*fee/i.test(item.name || ''));
  const totals = {};
  for (const [yr, idxs] of Object.entries(years)) {
    totals[yr] = tuitionItems.reduce(
      (sum, item) => sum + (item.s[idxs[0]] || 0) + (item.s[idxs[1]] || 0),
      0
    );
  }
  return totals; // { FY: 16500, SY: 16500, TY: 16500 }
}

/* ── helper: derive a simple { FeeHeadName: amount } map per year ──
   Used by the Scholarship Section's read-only Fee Structure view so
   it can render the same fee-head breakdown Accounts entered,
   without needing to know about semesters.                          */
function deriveHeadwiseByYear(items) {
  const years = { FY: [0,1], SY: [2,3], TY: [4,5] };
  const headwise = { FY: {}, SY: {}, TY: {} };
  for (const [yr, idxs] of Object.entries(years)) {
    items.forEach(item => {
      const val = (item.s[idxs[0]] || 0) + (item.s[idxs[1]] || 0);
      if (val) headwise[yr][item.name] = (headwise[yr][item.name] || 0) + val;
    });
  }
  return headwise;
}

function withDerived(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    yearTotals:   deriveYearTotals(obj.items || []),
    tuitionByYear: deriveTuitionByYear(obj.items || []),
    headwiseByYear: deriveHeadwiseByYear(obj.items || []),
  };
}


/* ─────────────────────────────────────────────────────────────
   GET /api/fee-structure
   Returns all active fee structures (optionally filter by
   courseType or academicYear query params).
───────────────────────────────────────────────────────────── */
exports.getAllFeeStructures = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.courseType)   filter.courseType   = req.query.courseType;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;

    const docs = await CollegeFeeStructure.find(filter).sort({ courseType: 1, academicYear: -1 });
    const result = docs.map(withDerived);
    return res.json({ success: true, structures: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


/* ─────────────────────────────────────────────────────────────
   GET /api/fee-structure/:id
───────────────────────────────────────────────────────────── */
exports.getFeeStructureById = async (req, res) => {
  try {
    const doc = await CollegeFeeStructure.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, structure: withDerived(doc) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


/* ─────────────────────────────────────────────────────────────
   POST /api/fee-structure
   Create a new fee structure for a course + academic year.
   Body: { courseType, academicYear, items: [...] }
───────────────────────────────────────────────────────────── */
exports.createFeeStructure = async (req, res) => {
  try {
    const { courseType, academicYear, items, createdBy } = req.body;
    if (!courseType || !academicYear || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'courseType, academicYear and items are required' });
    }

    // Check duplicate
    const existing = await CollegeFeeStructure.findOne({ courseType, academicYear });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Fee structure for ${courseType} AY ${academicYear} already exists. Use PUT to update.`,
      });
    }

    const doc = await CollegeFeeStructure.create({
      courseType, academicYear, items,
      createdBy: createdBy || '', isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Fee structure created',
      structure: withDerived(doc),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


/* ─────────────────────────────────────────────────────────────
   POST /api/fee-structure/upsert
   Create-or-update in a single call. Used by the Accounts Section
   "Create new academic year" / direct item-edit flows so a custom
   year's structure (e.g. 2026-27, 2027-28) is always persisted to
   the database and instantly available everywhere — including the
   Scholarship Section's MahaDBT Receivable Management tab.
   Body: { courseType, academicYear, items: [...] }
───────────────────────────────────────────────────────────── */
exports.upsertFeeStructure = async (req, res) => {
  try {
    const { courseType, academicYear, items, createdBy } = req.body;
    if (!courseType || !academicYear || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'courseType, academicYear and items are required' });
    }

    let doc = await CollegeFeeStructure.findOne({ courseType, academicYear });
    if (doc) {
      doc.items = items;
      doc.isActive = true;
      if (createdBy) doc.updatedBy = createdBy;
      doc.markModified('items');
      await doc.save();
    } else {
      doc = await CollegeFeeStructure.create({
        courseType, academicYear, items,
        createdBy: createdBy || '', isActive: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Fee structure saved',
      structure: withDerived(doc),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


/* ─────────────────────────────────────────────────────────────
   PUT /api/fee-structure/:id
   Full update (replace items array).
───────────────────────────────────────────────────────────── */
exports.updateFeeStructure = async (req, res) => {
  try {
    const { courseType, academicYear, items, updatedBy, isActive } = req.body;
    const doc = await CollegeFeeStructure.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });

    if (courseType)            doc.courseType   = courseType;
    if (academicYear)          doc.academicYear = academicYear;
    if (Array.isArray(items))  doc.items        = items;
    if (isActive !== undefined) doc.isActive    = isActive;
    if (updatedBy)             doc.updatedBy    = updatedBy;

    await doc.save();
    return res.json({
      success: true,
      message: 'Updated successfully',
      structure: withDerived(doc),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


/* ─────────────────────────────────────────────────────────────
   PATCH /api/fee-structure/:id/item
   Update a single fee item within the structure.
   Body: { itemId, field, value }  OR  { item: { id, name, section, s } }
───────────────────────────────────────────────────────────── */
exports.updateFeeItem = async (req, res) => {
  try {
    const doc = await CollegeFeeStructure.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });

    const { itemId, name, section, s, updatedBy } = req.body;
    const idx = doc.items.findIndex(i => i.id === itemId);
    if (idx === -1) return res.status(404).json({ success: false, message: `Item '${itemId}' not found` });

    if (name    !== undefined) doc.items[idx].name    = name;
    if (section !== undefined) doc.items[idx].section = section;
    if (Array.isArray(s))      doc.items[idx].s       = s;
    if (updatedBy)             doc.updatedBy          = updatedBy;

    doc.markModified('items');
    await doc.save();

    return res.json({
      success: true,
      message: 'Item updated',
      structure: withDerived(doc),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


/* ─────────────────────────────────────────────────────────────
   POST /api/fee-structure/:id/item
   Add a new fee item.
───────────────────────────────────────────────────────────── */
exports.addFeeItem = async (req, res) => {
  try {
    const doc = await CollegeFeeStructure.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });

    const { name, section, s, updatedBy } = req.body;
    if (!name || !section) {
      return res.status(400).json({ success: false, message: 'name and section required' });
    }

    // Auto-generate id
    const prefix = doc.courseType.toLowerCase().replace(/[^a-z]/g, '');
    const newId  = `${prefix}_custom_${Date.now()}`;
    const newItem = {
      id:      newId,
      name:    name.trim(),
      section: section,
      s:       Array.isArray(s) ? s : [0,0,0,0,0,0],
    };

    doc.items.push(newItem);
    if (updatedBy) doc.updatedBy = updatedBy;
    doc.markModified('items');
    await doc.save();

    return res.status(201).json({
      success: true,
      message: 'Fee item added',
      newItem,
      structure: withDerived(doc),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


/* ─────────────────────────────────────────────────────────────
   DELETE /api/fee-structure/:id/item/:itemId
   Remove a single fee item from the structure.
───────────────────────────────────────────────────────────── */
exports.deleteFeeItem = async (req, res) => {
  try {
    const doc = await CollegeFeeStructure.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });

    const before = doc.items.length;
    doc.items = doc.items.filter(i => i.id !== req.params.itemId);
    if (doc.items.length === before) {
      return res.status(404).json({ success: false, message: `Item '${req.params.itemId}' not found` });
    }

    doc.markModified('items');
    await doc.save();

    return res.json({
      success: true,
      message: 'Item deleted',
      structure: withDerived(doc),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


/* ─────────────────────────────────────────────────────────────
   DELETE /api/fee-structure/:id
   Soft-delete (set isActive: false).
───────────────────────────────────────────────────────────── */
exports.deleteFeeStructure = async (req, res) => {
  try {
    const doc = await CollegeFeeStructure.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, message: 'Fee structure deactivated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


/* ─────────────────────────────────────────────────────────────
   POST /api/fee-structure/seed-defaults
   One-time: seeds the 2025-26 fee structure from hardcoded Excel data.
   Safe to call multiple times — skips if already exists.
───────────────────────────────────────────────────────────── */
exports.seedDefaults = async (req, res) => {
  try {
    const { academicYear = '2025-26', createdBy = 'Seed' } = req.body;

    const DEFAULT_STRUCTURES = [
      {
        courseType: 'B.Sc.',
        items: [
          { id:'bsc_s1',  name:'Sports Fee',                      section:'University', s:[250,0,250,0,250,0] },
          { id:'bsc_s2',  name:'Students Development Fee',        section:'University', s:[225,0,225,0,225,0] },
          { id:'bsc_s3',  name:'Students Diary Fee',              section:'University', s:[50,0,50,0,50,0] },
          { id:'bsc_s4',  name:'CHETNA Fee',                      section:'University', s:[20,0,0,0,0,0] },
          { id:'bsc_s5',  name:'Library Fee (Database)',          section:'University', s:[100,0,100,0,100,0] },
          { id:'bsc_s6',  name:'E-Suvidha Fee',                   section:'University', s:[100,0,100,0,100,0] },
          { id:'bsc_s7',  name:'Disaster Management Fee',         section:'University', s:[10,0,10,0,10,0] },
          { id:'bsc_s8',  name:'Ashwamedh & Avishkar Fees',       section:'University', s:[30,0,30,0,30,0] },
          { id:'bsc_s9',  name:'Swami Vivekanand Yuva Suraksha',  section:'University', s:[62,0,62,0,62,0] },
          { id:'bsc_s10', name:'Eligibility Fee',                 section:'University', s:[400,0,0,0,0,0] },
          { id:'bsc_s11', name:'Enrollment Fee',                  section:'University', s:[400,0,0,0,0,0] },
          { id:'bsc_s12', name:'Examination Fee',                 section:'University', s:[750,750,750,750,750,750] },
          { id:'bsc_s13', name:'Practical Exam Fee',              section:'University', s:[250,250,250,250,250,250] },
          { id:'bsc_s14', name:'Central Information Access',      section:'University', s:[120,0,120,0,120,0] },
          { id:'bsc_s15', name:'University Development Fund',     section:'University', s:[120,0,120,0,120,0] },
          { id:'bsc_s16', name:'Passing Certificate Fee',         section:'University', s:[0,0,0,0,0,200] },
          { id:'bsc_s17', name:'Convocation Fee',                 section:'University', s:[0,0,0,0,0,700] },
          { id:'bsc_s18', name:'Alumni Fee (University)',         section:'University', s:[0,0,0,0,0,100] },
          { id:'bsc_c1',  name:'Admission Fee',                   section:'College',    s:[550,0,550,0,550,0] },
          { id:'bsc_c2',  name:'Tuition Fee',                     section:'College',    s:[16500,0,16500,0,16500,0] },
          { id:'bsc_c3',  name:'Gymkhana Fee',                    section:'College',    s:[700,0,700,0,700,0] },
          { id:'bsc_c4',  name:'Laboratory Fee',                  section:'College',    s:[5250,0,5250,0,5250,0] },
          { id:'bsc_c5',  name:'Development Fee',                 section:'College',    s:[500,0,500,0,500,0] },
          { id:'bsc_c6',  name:'Medical Fee',                     section:'College',    s:[100,0,100,0,100,0] },
          { id:'bsc_c7',  name:'Identity Card Fee',               section:'College',    s:[100,0,100,0,100,0] },
          { id:'bsc_c8',  name:'Annual Miscellaneous Fee',        section:'College',    s:[250,0,250,0,250,0] },
          { id:'bsc_c9',  name:'Magazine Fee',                    section:'College',    s:[75,0,75,0,75,0] },
          { id:'bsc_c10', name:'Placement Fee',                   section:'College',    s:[0,0,0,0,0,500] },
          { id:'bsc_c11', name:'Library Fee',                     section:'College',    s:[1000,0,1000,0,1000,0] },
          { id:'bsc_c12', name:'Internship Fee/OJT',              section:'College',    s:[0,0,0,0,0,500] },
          { id:'bsc_c13', name:'Alumni Fee (College)',            section:'College',    s:[0,0,0,0,0,100] },
          { id:'bsc_c14', name:'Extra-Curricular Activity Fee',   section:'College',    s:[365,0,365,0,0,0] },
          { id:'bsc_c15', name:'Computer Training Fees',          section:'College',    s:[300,0,300,0,300,0] },
          { id:'bsc_c16', name:'Subject Association Fee',         section:'College',    s:[200,0,200,0,200,0] },
          { id:'bsc_c17', name:'Laboratory Deposit',              section:'College',    s:[300,0,0,0,0,0] },
          { id:'bsc_c18', name:'Caution Money Deposit',           section:'College',    s:[100,0,0,0,0,0] },
          { id:'bsc_c19', name:'Library Deposit',                 section:'College',    s:[500,0,0,0,0,0] },
        ],
      },
      {
        courseType: 'B.A.',
        items: [
          { id:'ba_s1',  name:'Sports Fee',                        section:'University', s:[250,0,250,0,250,0] },
          { id:'ba_s2',  name:'Students Development Fee',          section:'University', s:[225,0,225,0,225,0] },
          { id:'ba_s3',  name:'Students Diary Fee',                section:'University', s:[50,0,50,0,50,0] },
          { id:'ba_s4',  name:'CHETNA Fee',                        section:'University', s:[20,0,0,0,0,0] },
          { id:'ba_s5',  name:'Library Fee (Database)',            section:'University', s:[100,0,100,0,100,0] },
          { id:'ba_s6',  name:'E-Suvidha Fee',                     section:'University', s:[100,0,100,0,100,0] },
          { id:'ba_s7',  name:'Disaster Management Fee',           section:'University', s:[10,0,10,0,10,0] },
          { id:'ba_s8',  name:'Ashwamedh & Avishkar Fees',         section:'University', s:[30,0,30,0,30,0] },
          { id:'ba_s9',  name:'Swami Vivekanand Yuva Suraksha',    section:'University', s:[62,0,62,0,62,0] },
          { id:'ba_s10', name:'Eligibility Fee',                   section:'University', s:[400,0,0,0,0,0] },
          { id:'ba_s11', name:'Enrollment Fee',                    section:'University', s:[400,0,0,0,0,0] },
          { id:'ba_s12', name:'Examination Fee',                   section:'University', s:[750,750,750,750,750,750] },
          { id:'ba_s13', name:'Practical Exam Fee (Geo/Psy)',      section:'University', s:[0,0,0,0,500,500] },
          { id:'ba_s14', name:'Central Information Access',        section:'University', s:[120,0,120,0,120,0] },
          { id:'ba_s15', name:'University Development Fund',       section:'University', s:[120,0,120,0,120,0] },
          { id:'ba_s16', name:'Passing Certificate Fee',           section:'University', s:[0,0,0,0,0,200] },
          { id:'ba_s17', name:'Convocation Fee',                   section:'University', s:[0,0,0,0,0,700] },
          { id:'ba_s18', name:'Alumni Fee (University)',           section:'University', s:[0,0,0,0,0,100] },
          { id:'ba_c1',  name:'Admission Fee',                     section:'College',    s:[550,0,550,0,550,0] },
          { id:'ba_c2',  name:'Tuition Fee',                       section:'College',    s:[5500,0,5500,0,5500,0] },
          { id:'ba_c3',  name:'Gymkhana Fee',                      section:'College',    s:[700,0,700,0,700,0] },
          { id:'ba_c4',  name:'Laboratory Fee (Psy/Geo)',          section:'College',    s:[300,0,300,0,300,0] },
          { id:'ba_c5',  name:'Development Fee',                   section:'College',    s:[500,0,500,0,500,0] },
          { id:'ba_c6',  name:'Medical Fee',                       section:'College',    s:[100,0,100,0,100,0] },
          { id:'ba_c7',  name:'Identity Card Fee',                 section:'College',    s:[100,0,100,0,100,0] },
          { id:'ba_c8',  name:'Annual Miscellaneous Fee',          section:'College',    s:[250,0,250,0,250,0] },
          { id:'ba_c9',  name:'Magazine Fee',                      section:'College',    s:[75,0,75,0,75,0] },
          { id:'ba_c10', name:'Placement Fee',                     section:'College',    s:[0,0,0,0,0,50] },
          { id:'ba_c11', name:'Library Fee',                       section:'College',    s:[1000,0,1000,0,1000,0] },
          { id:'ba_c12', name:'Internship Fee',                    section:'College',    s:[0,0,0,0,0,50] },
          { id:'ba_c13', name:'Computer Training Fee',             section:'College',    s:[500,0,500,0,500,0] },
          { id:'ba_c14', name:'Alumni Fee (College)',              section:'College',    s:[0,0,0,0,0,100] },
          { id:'ba_c15', name:'Extra-Curricular Activity Fee',     section:'College',    s:[365,0,365,0,0,0] },
          { id:'ba_c16', name:'Subject Association Fee',           section:'College',    s:[200,0,200,0,200,0] },
          { id:'ba_c17', name:'Laboratory Deposit',                section:'College',    s:[500,0,0,0,0,0] },
          { id:'ba_c18', name:'Caution Money Deposit',             section:'College',    s:[100,0,0,0,0,0] },
          { id:'ba_c19', name:'Library Deposit',                   section:'College',    s:[500,0,0,0,0,0] },
        ],
      },
    ];

    const results = [];
    for (const def of DEFAULT_STRUCTURES) {
      const existing = await CollegeFeeStructure.findOne({
        courseType:   def.courseType,
        academicYear,
      });
      if (existing) {
        results.push({ course: def.courseType, status: 'already_exists' });
      } else {
        await CollegeFeeStructure.create({ ...def, academicYear, createdBy, isActive: true });
        results.push({ course: def.courseType, status: 'created' });
      }
    }

    return res.json({ success: true, results });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
