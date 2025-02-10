// Importiere das Express-Paket und die Routen
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const placesRouter = require('./route/places');
const gamesRouter = require('./route/games');
const path = require('path');

// Erstelle eine Express-Anwendung
const app = express();

// Setze den Port, auf dem der Server laufen soll (über Kommandozeilenargument oder Standardwert)
const PORT = process.argv[2] || 8080;

// Verbinde mit MongoDB
mongoose.connect('mongodb://localhost:27017/petanque', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Mit MongoDB verbunden'))
  .catch(err => console.error('Fehler beim Verbinden mit MongoDB:', err.message));

app.use(cors());

// Middleware zum Parsen von JSON-Anfragen
app.use(express.json());

// Liefere statische Dateien aus dem Ordner "src/public"
app.use(express.static(path.join(__dirname, '../public')));

// Verwende den Router für /api/places
app.use('/api/places', placesRouter);
app.use('/api/games', gamesRouter);

// Starte den Server
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
