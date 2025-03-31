const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

// Új foglalás létrehozása
router.post('/', authenticateToken, async (req, res) => {
  const { training_type, training_date, training_time } = req.body;
  const userId = req.user.id;

  if (!training_type || !training_date || !training_time) {
    return res.status(400).json({ message: 'Minden mező kitöltése kötelező!' });
  }

  try {
    await db.query(
      'INSERT INTO bookings (user_id, training_type, training_date, training_time) VALUES (?, ?, ?, ?)',
      [userId, training_type, training_date, training_time]
    );

    res.status(201).json({ message: '✅ Edzés lefoglalva!' });
  } catch (err) {
    console.error('Foglalás hiba:', err);
    res.status(500).json({ message: '❌ Szerverhiba a foglalás során.' });
  }
});

// Saját foglalások lekérése
router.get('/mine', authenticateToken, async (req, res) => {
    const userId = req.user.id;
  
    try {
      const [rows] = await db.query(
        'SELECT id, training_type, training_date, training_time, created_at FROM bookings WHERE user_id = ? ORDER BY training_date, training_time',
        [userId]
      );
  
      res.json(rows); // ⬅️ Ezt kell visszakapni
    } catch (err) {
      console.error('Foglalások lekérési hiba:', err);
      res.status(500).json({ message: '❌ Nem sikerült lekérni a foglalásaidat.' });
    }
  });

// Foglalás törlése saját felhasználónak
router.delete('/:id', authenticateToken, async (req, res) => {
    const bookingId = req.params.id;
    const userId = req.user.id;
  
    try {
      const [result] = await db.query(
        'DELETE FROM bookings WHERE id = ? AND user_id = ?',
        [bookingId, userId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Nem található foglalás vagy nincs jogosultság.' });
      }
  
      res.json({ message: 'Foglalás sikeresen törölve.' });
    } catch (err) {
      console.error('Törlési hiba:', err);
      res.status(500).json({ message: 'Szerverhiba törlés közben.' });
    }
  });
  

module.exports = router;
