const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const placesRouter = require('./route/places');
const gamesRouter = require('./route/games');
const path = require('path');

const app = express();

const PORT = process.argv[2] || 8080;

// MongoDB - Verbindung
mongoose.connect('mongodb://localhost:27017/petanque', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Mit MongoDB verbunden'))
  .catch(err => console.error('Fehler beim Verbinden mit MongoDB:', err.message));

app.use(cors());

// Middleware zum Parsen von JSON-Anfragen
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/places', placesRouter);
app.use('/api/games', gamesRouter);

// Starte den Server
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
