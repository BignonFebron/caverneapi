// models/Order.js
const mongoose = require('mongoose');
const { orderStatus } = require('../utils/enums');

const orderSchema = new mongoose.Schema({
    commandNumber: { type: Number, unique: true, required: true }, // Numéro de commande chronologique
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Référence à l'utilisateur
    products: [{
        productCode: { type: String, required: true }, // Code du produit
        typePrice: { type: String, required: true }, // Type de prix
    }],
    status: { type: String,required:true, default: orderStatus.Placed }, // Statut de la commande
    lotWeek: { type: String, required: true }, // Lot de la semaine (ex: "30/12/24-05/01/25")
    lotNumber: { type: Number, required: true }, // Numéro de lot chronologique pour la semaine
    toBeDelivered: { type: Boolean, default: true }, // Livraison souhaitée
    sector: { type: String }, // Secteur de livraison
    photos: [{ type: String }], // Liste des URLs des photos 
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;