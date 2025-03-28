const express = require('express');
const router = express.Router(); // 👈 EZ KELL!
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

// 🔐 REGISTER
router.post('/register', async (req, res) => {
  const { username, fullname, email, password } = req.body;
  try {
    const [existing] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Felhasználónév vagy e-mail már létezik' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (username, fullname, email, password) VALUES (?, ?, ?, ?)',
      [username, fullname, email, hashedPassword]
    );

    res.status(201).json({ message: 'Sikeres regisztráció' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Hiba történt a regisztráció során' });
  }
});

// 🔑 LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) return res.status(401).json({ message: 'Hibás felhasználónév vagy jelszó' });

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: 'Hibás felhasználónév vagy jelszó' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({ token, username: user.username, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Hiba történt a bejelentkezés során' });
  }
});



// 🔐 Jelszó módosítása
router.post('/change-password', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Nincs token megadva' });

  const token = authHeader.split(' ')[1];
  let userId;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
  } catch (err) {
    return res.status(401).json({ message: 'Érvénytelen token' });
  }

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Hiányzó mezők' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = users[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Hibás régi jelszó' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);

    res.json({ message: 'Jelszó sikeresen frissítve' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Szerverhiba történt' });
  }
});

module.exports = router;