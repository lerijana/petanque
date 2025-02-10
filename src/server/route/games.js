const express = require('express');
const router = express.Router();
const { Spiel } = require('../database');

// GET /api/games - Alle Spiele abrufen
router.get('/', async (req, res) => {
    try {
        const { status, page = 1, limit = 6 } = req.query;
        const skip = (page - 1) * limit;
        
        let query = {};
        if (status === 'laufend') {
            query.status = 'laufend';
        } else if (status === 'beendet') {
            query.status = 'beendet';
        }

        console.log('Query:', query); // Для отладки

        // Получаем общее количество игр для пагинации
        const total = await Spiel.countDocuments(query);
        
        // Получаем игры с пагинацией
        const spiele = await Spiel.find(query)
            .sort({ endZeit: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('platz');

        console.log('Found games:', spiele.length); // Для отладки

        res.json({
            spiele,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Fehler beim Abrufen der Spiele:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

// GET /api/games/finished - Beendete Spiele abrufen
router.get('/finished', async (req, res) => {
    try {
        const games = await Spiel.find({ status: 'beendet' })
            .populate('platz')
            .sort({ endZeit: -1 }) // Sortiere nach Endzeit, neueste zuerst
            .limit(10); // Begrenze auf die letzten 10 Spiele
        
        res.json({ games });
    } catch (err) {
        console.error('Fehler beim Abrufen der beendeten Spiele:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/games - Neues Spiel erstellen
router.post('/', async (req, res) => {
    try {
        const { teams, platz } = req.body;
        
        const spiel = new Spiel({
            teams,
            platz,
            punkteVerlauf: [{
                runde: 1,
                mannschaft1Punkte: 0,
                mannschaft2Punkte: 0
            }],
            startZeit: new Date(),
            status: 'laufend'
        });

        const savedSpiel = await spiel.save();
        const populatedSpiel = await Spiel.findById(savedSpiel._id).populate('platz');
        res.status(201).json(populatedSpiel);
    } catch (error) {
        console.error('Fehler beim Erstellen des Spiels:', error);
        res.status(400).json({ message: error.message });
    }
});

// POST /api/games/:id/score - Punktestand aktualisieren
router.post('/:id/score', async (req, res) => {
    try {
        const { id } = req.params;
        const { team, change } = req.body;
        
        const spiel = await Spiel.findById(id);
        if (!spiel) {
            return res.status(404).json({ message: 'Spiel nicht gefunden' });
        }

        if (spiel.status !== 'laufend') {
            return res.status(400).json({ message: 'Spiel ist bereits beendet' });
        }

        // Letzte Runde finden
        const currentRound = spiel.punkteVerlauf[spiel.punkteVerlauf.length - 1];
        const newRound = spiel.punkteVerlauf.length + 1;

        // Neue Punkte berechnen
        let mannschaft1Punkte = currentRound.mannschaft1Punkte;
        let mannschaft2Punkte = currentRound.mannschaft2Punkte;

        if (team === 1) {
            mannschaft1Punkte = Math.max(0, mannschaft1Punkte + change);
        } else {
            mannschaft2Punkte = Math.max(0, mannschaft2Punkte + change);
        }

        // Neue Runde hinzufügen
        spiel.punkteVerlauf.push({
            runde: newRound,
            mannschaft1Punkte,
            mannschaft2Punkte
        });

        await spiel.save();
        res.json(spiel);
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Punkte:', error);
        res.status(400).json({ message: error.message });
    }
});

// PATCH /api/games/:id/score - Punktestand aktualisieren
router.patch('/:id/score', async (req, res) => {
    try {
        const { id } = req.params;
        const { team, change } = req.body;
        
        const spiel = await Spiel.findById(id);
        if (!spiel) {
            return res.status(404).json({ message: 'Spiel nicht gefunden' });
        }

        if (spiel.status !== 'laufend') {
            return res.status(400).json({ message: 'Spiel ist bereits beendet' });
        }

        // Letzte Runde finden
        const currentRound = spiel.punkteVerlauf[spiel.punkteVerlauf.length - 1];
        const newRound = spiel.punkteVerlauf.length + 1;

        // Neue Punkte berechnen
        let mannschaft1Punkte = currentRound.mannschaft1Punkte;
        let mannschaft2Punkte = currentRound.mannschaft2Punkte;

        if (team === 1) {
            mannschaft1Punkte = Math.max(0, mannschaft1Punkte + change);
        } else {
            mannschaft2Punkte = Math.max(0, mannschaft2Punkte + change);
        }

        // Neue Runde hinzufügen
        spiel.punkteVerlauf.push({
            runde: newRound,
            mannschaft1Punkte,
            mannschaft2Punkte
        });

        await spiel.save();
        res.json(spiel);
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Punkte:', error);
        res.status(400).json({ message: error.message });
    }
});

// PATCH /api/games/:id/end - Spiel beenden
router.patch('/:id/end', async (req, res) => {
    try {
        const { id } = req.params;
        
        const spiel = await Spiel.findById(id);
        if (!spiel) {
            return res.status(404).json({ message: 'Spiel nicht gefunden' });
        }

        spiel.status = 'beendet';
        spiel.endZeit = new Date();

        await spiel.save();
        res.json(spiel);
    } catch (error) {
        console.error('Fehler beim Beenden des Spiels:', error);
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/games/:id - Spiel löschen
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const spiel = await Spiel.findByIdAndDelete(id);
        if (!spiel) {
            return res.status(404).json({ message: 'Spiel nicht gefunden' });
        }

        res.json({ message: 'Spiel erfolgreich gelöscht' });
    } catch (error) {
        console.error('Fehler beim Löschen des Spiels:', error);
        res.status(400).json({ message: error.message });
    }
});

// PUT /api/games/:id - Обновить игру
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const spiel = await Spiel.findById(id);
        if (!spiel) {
            return res.status(404).json({ message: 'Spiel nicht gefunden' });
        }

        // Обновляем только разрешенные поля
        if (updates.punkteVerlauf) {
            spiel.punkteVerlauf = updates.punkteVerlauf;
        }
        if (updates.status) {
            spiel.status = updates.status;
        }
        if (updates.endZeit) {
            spiel.endZeit = updates.endZeit;
        }

        await spiel.save();
        res.json(spiel);
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Spiels:', error);
        res.status(400).json({ message: error.message });
    }
});

// PATCH /api/games/:id - Spiel aktualisieren
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const spiel = await Spiel.findById(id);
        if (!spiel) {
            return res.status(404).json({ message: 'Spiel nicht gefunden' });
        }

        // Обновляем статус и время окончания
        if (updates.status) {
            spiel.status = updates.status;
        }
        if (updates.endZeit) {
            spiel.endZeit = updates.endZeit;
        }

        await spiel.save();
        res.json(spiel);
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Spiels:', error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;