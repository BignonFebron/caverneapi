// models/Cart.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Référence à l'utilisateur
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Référence au produit
        quantity: { type: Number, required: true, min: 1 }, // Quantité du produit
    }],
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;