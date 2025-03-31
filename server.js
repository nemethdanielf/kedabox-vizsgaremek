const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./db'); // 💾 MySQL adatbázis kapcsolat

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Köztes middleware-ek
app.use(cors());
app.use(express.json());

// ========== API-k bekötése ==========

// Auth (login, register, jelszóváltás)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Admin callback-kezelés (státusz, törlés, export)
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Callback request (visszahívás kérések)
const callbackRoutes = require('./routes/callback');
app.use('/api/callback', callbackRoutes);

// Bookings (edzésfoglalás)
const bookingRoutes = require('./routes/bookings');
app.use('/api/bookings', bookingRoutes);

// ========== Statikus fájlok kiszolgálása (frontend) ==========
app.use(express.static(path.join(__dirname, 'client')));

// ❗️FONTOS: Ez legyen a legvégén, hogy ne nyomja el az API-kat
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// ========== Adatbázis kapcsolat tesztelése ==========
async function testDbConnection() {
  try {
    const [rows] = await db.query('SELECT 1');
    console.log('✅ Sikeres adatbázis kapcsolat!');
  } catch (err) {
    console.error('❌ Adatbázis kapcsolat hiba:', err);
  }
}
testDbConnection();

// ========== Szerver indítása ==========
app.listen(PORT, () => {
  console.log(`🚀 A szerver fut a ${PORT}-es porton`);
});
