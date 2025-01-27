// routes/cartRoutes.js
const express = require('express');
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');
const router = express.Router();

// Ajouter un produit au panier
router.post('/add/cart', async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        // Vérifier si le panier existe déjà pour l'utilisateur
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // Créer un nouveau panier si aucun n'existe
            cart = new Cart({ userId, products: [] });
        }

        // Vérifier si le produit est déjà dans le panier
        const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);

        if (productIndex !== -1) {
            // Mettre à jour la quantité si le produit est déjà dans le panier
            cart.products[productIndex].quantity += quantity;
        } else {
            // Ajouter le produit au panier
            cart.products.push({ productId, quantity });
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;