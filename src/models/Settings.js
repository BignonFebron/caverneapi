// models/Settings.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  refundRate: {
    type: Number,
    required: true,
    min: 0,  // On s'assure que c'est un pourcentage valide
    max: 100,
  },
  refundDelay: {
    type: Number,
    required: true,
    min: 1,  // Délai minimum de 1 jour
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
