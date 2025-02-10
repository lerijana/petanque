const express = require('express');
const router = express.Router();
const { Place } = require('../database');

// GET /places - Alle Plätze abrufen
router.get('/', async (req, res) => {
  try {
    const places = await Place.find();
    res.json({ places });
  } catch (err) {
    console.error('Fehler in GET /api/places:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /places/:id - Einzelnen Platz abrufen
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const place = await Place.findById(id);
        
        if (!place) {
            return res.status(404).json({ error: 'Platz nicht gefunden' });
        }
        
        res.json(place);
    } catch (err) {
        console.error('Fehler beim Abrufen des Platzes:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /places - Neuen Platz hinzufügen
router.post('/', async (req, res) => {
  console.log('Empfangener Body:', req.body); // Debugging: Eingehender Body
  const { name, access, type, field_count, latitude, longitude, notes } = req.body;

  try {
    // Validierung: Sicherstellen, dass die wichtigsten Felder vorhanden sind
    if (!name || !latitude || !longitude) {
      return res.status(400).json({ error: 'Name, Latitude und Longitude sind erforderlich.' });
    }

    const newPlace = await Place.create({
      name,
      access,
      type,
      field_count,
      latitude,
      longitude,
      notes,
    });

    res.status(201).json(newPlace); // Erfolgreiche Antwort mit den gespeicherten Daten
  } catch (err) {
    console.error('Fehler in POST /api/places:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// PUT /places/:id - Bestehenden Platz aktualisieren
router.put('/:id', async (req, res) => {
  const { id } = req.params; // ID aus der URL
  const { name, access, type, field_count, latitude, longitude, notes } = req.body; // Daten aus dem Body

  try {
    const updatedPlace = await Place.findByIdAndUpdate(
      id, // Die ID des Platzes
      { name, access, type, field_count, latitude, longitude, notes }, // Neue Daten
      { new: true } // Gibt die aktualisierten Daten zurück
    );

    if (!updatedPlace) {
      return res.status(404).json({ error: 'Platz nicht gefunden' }); // Platz nicht gefunden
    }

    res.json({ message: 'Platz erfolgreich aktualisiert', updatedPlace });
  } catch (err) {
    console.error('Fehler in PUT /api/places/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /places/:id - Platz löschen
router.delete('/:id', async (req, res) => {
  const { id } = req.params; // ID aus der URL

  try {
    const deletedPlace = await Place.findByIdAndDelete(id); // Löscht den Platz

    if (!deletedPlace) {
      return res.status(404).json({ error: 'Platz nicht gefunden' }); // Platz nicht gefunden
    }

    res.json({ message: 'Platz erfolgreich gelöscht' });
  } catch (err) {
    console.error('Fehler in DELETE /api/places/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
