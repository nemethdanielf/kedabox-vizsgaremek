const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Csak bejelentkezett admin láthatja
router.get('/callbacks', authenticateToken, requireAdmin, async (req, res) => {
  // Itt jönne az adatbázis lekérés pl.
  res.json({ message: 'Itt vannak az admin callback kérések' });
});

module.exports = router;
