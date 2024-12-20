// Importiere das Express-Paket und die Routen
const express = require('express');
const placesRouter = require('./route/places');
console.log(placesRouter);

// Erstelle eine Express-Anwendung
const app = express();

// Setze den Port, auf dem der Server laufen soll (mit Fallback auf 8080)
const PORT = process.env.PORT || 8080;

// Middleware zum Parsen von JSON-Anfragen
app.use(express.json());

// Liefere statische Dateien aus dem Ordner "src/public"
app.use(express.static('src/public'));

// Verwende den Router für /api/places
app.use('/api/places', placesRouter);

// Starte den Server
console.log("Starte den Server...");
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

