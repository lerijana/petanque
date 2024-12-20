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

const Place = mongoose.model('Place', placeSchema);

module.exports = Place;
