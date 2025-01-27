// models/DeliveryZone.js
const mongoose = require('mongoose');

const deliveryZoneSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Nom de la zone
    description: { type: String }, // Description de la zone
    sectors: [{ type: String, required: true }], // Liste des secteurs
    price: { type: Number, required: true }, // Prix de livraison
}, { timestamps: true });

const DeliveryZone = mongoose.model('DeliveryZone', deliveryZoneSchema);
module.exports = DeliveryZone;