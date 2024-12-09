const express = require('express');
const router = express.Router();
const db = require('../database'); // Für SQLite oder MongoDB-Modell einfügen

// GET /places - Alle Plätze abrufen
router.get('/', (req, res) => {
    db.all(`SELECT * FROM places`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ places: rows });
    });
});

// POST /places - Neuen Platz hinzufügen
router.post('/', (req, res) => {
    const { name, access, type, field_count, latitude, longitude, notes } = req.body;
    db.run(`INSERT INTO places (name, access, type, field_count, latitude, longitude, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)`, [name, access, type, field_count, latitude, longitude, notes],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        });
});

// Weitere CRUD-Routen für Update und Delete hinzufügen

module.exports = router;