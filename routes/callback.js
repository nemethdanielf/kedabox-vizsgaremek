const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Új visszahívási kérés fogadása (nyilvános)
router.post('/', async (req, res) => {
  const { name, phone, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: 'Név és telefonszám kötelező' });
  }

  try {
    await db.query(
      'INSERT INTO callback_requests (name, phone, message) VALUES (?, ?, ?)',
      [name, phone, message]
    );

    res.status(201).json({ message: 'Kérés sikeresen mentve' });
  } catch (err) {
    console.error('Hiba beszúráskor:', err.message);
    res.status(500).json({ message: 'Szerverhiba a mentés során' });
  }
});

// ⬇️ Visszahívási kérések lekérése (csak adminnak)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM callback_requests ORDER BY created_at DESC');

    // Fontos: JSON választ adunk vissza
    res.status(200).json(rows);
  } catch (err) {
    console.error('Lekérési hiba:', err.message);
    res.status(500).json({ message: 'Szerverhiba: nem sikerült lekérni a visszahívásokat.' });
  }
});

// Admin: visszahívási kérés törlése
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const id = req.params.id;

  try {
    const [result] = await db.query('DELETE FROM callback_requests WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Nincs ilyen bejegyzés' });
    }

    res.json({ message: 'Sikeresen törölve' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Szerverhiba a törlés során' });
  }
});


module.exports = router;
