const express = require('express');
const router = express.Router();

// GET /api/achievements
router.get('/', (req, res) => {
  res.json([
    {
      id: 1,
      title: 'University Rank Holders',
      description: 'Students secured top ranks in university examinations.'
    },
    {
      id: 2,
      title: 'NAAC Accreditation',
      description: 'College is accredited by NAAC.'
    }
  ]);
});

module.exports = router;
