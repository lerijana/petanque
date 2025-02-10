const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/petanque', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const placeSchema = new mongoose.Schema({
  name: String,
  access: String,
  type: String,
  field_count: Number,
  latitude: Number,
  longitude: Number,
  notes: String
});

const spielSchema = new mongoose.Schema({
  teams: [String],
  punkteVerlauf: [{
    runde: Number,
    mannschaft1Punkte: Number,
    mannschaft2Punkte: Number
  }],
  startZeit: {
    type: Date,
    default: Date.now
  },
  endZeit: Date,
  status: {
    type: String,
    enum: ['laufend', 'beendet'],
    default: 'laufend'
  },
  platz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
    required: false
  }
}, {
  timestamps: true
});

const Place = mongoose.model('Place', placeSchema);
const Spiel = mongoose.model('Spiel', spielSchema);

module.exports = { Place, Spiel };
