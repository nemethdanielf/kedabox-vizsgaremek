const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./db'); // 💾 MySQL adatbázis kapcsolat

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ========== API-k bekötése (később jönnek) ==========
// Példa: app.use('/api/auth', require('./auth'));

app.use('/api/callback', require('./routes/callback'));

// ========== Statikus fájlok kiszolgálása ==========
// A "client" mappa tartalmazza az összes frontend fájlt (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'client')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// ========== Adatbázis kapcsolat tesztelése ==========
// Ez segít hibakereséskor, hogy a MySQL működik-e
async function testDbConnection() {
  try {
    const [rows] = await db.query('SELECT 1');
    console.log('✅ Sikeres adatbázis kapcsolat!');
  } catch (err) {
    console.error('❌ Adatbázis kapcsolat hiba:', err);
  }
}
testDbConnection();

const authRoutes = require('./routes/auth'); // 🔗 Auth API bekötése
app.use('/api/auth', authRoutes); // ⬅️ Auth route használata

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const callbackRoutes = require('./routes/callback');
app.use('/api/callback', callbackRoutes);



// ========== Szerver indítása ==========
app.listen(PORT, () => {
  console.log(`🚀 A szerver fut a ${PORT}-es porton`);
});
