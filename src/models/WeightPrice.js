// models/WeightPrice.js
const mongoose = require('mongoose');

const weightPriceSchema = new mongoose.Schema({
    minWeight: { type: Number, required: true }, // Poids minimum (en kg)
    maxWeight: { type: Number, required: true }, // Poids maximum (en kg)
    price: { type: Number, required: true }, // Prix pour cette tranche de poids
}, { timestamps: true });

const WeightPrice = mongoose.model('WeightPrice', weightPriceSchema);
module.exports = WeightPrice;