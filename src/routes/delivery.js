// routes/deliveryZoneRoutes.js
const express = require('express');
const DeliveryZone = require('../models/DeliveryZone');
const auth = require('../middleware/auth');
const router = express.Router();

// Créer une zone de livraison
router.post('/', auth(['superadmin', 'service_client']), async (req, res) => {
    try {
        const { name, description, sectors, price } = req.body;
        const newDeliveryZone = new DeliveryZone({ name, description, sectors, price });
        await newDeliveryZone.save();
        res.status(201).json(newDeliveryZone);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Lire toutes les zones de livraison
router.get('/', auth(['superadmin', 'service_client']), async (req, res) => {
    try {
        const deliveryZones = await DeliveryZone.find();
        res.json(deliveryZones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Lire une zone de livraison par son ID
router.get('/:id', auth(['superadmin', 'service_client']), async (req, res) => {
    try {
        const deliveryZone = await DeliveryZone.findById(req.params.id);
        if (!deliveryZone) return res.status(404).json({ message: 'Zone de livraison non trouvée' });
        res.json(deliveryZone);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour une zone de livraison
router.patch('/:id', auth(['superadmin', 'service_client']), async (req, res) => {
    try {
        const updatedDeliveryZone = await DeliveryZone.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedDeliveryZone) return res.status(404).json({ message: 'Zone de livraison non trouvée' });
        res.json(updatedDeliveryZone);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer une zone de livraison
router.delete('/:id', auth(['superadmin', 'service_client']), async (req, res) => {
    try {
        const deletedDeliveryZone = await DeliveryZone.findByIdAndDelete(req.params.id);
        if (!deletedDeliveryZone) return res.status(404).json({ message: 'Zone de livraison non trouvée' });
        res.json({ message: 'Zone de livraison supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Récupérer la zone de livraison d'un secteur
router.get('/sector/:sector', auth(['superadmin', 'service_client']), async (req, res) => {
    try {
        const { sector } = req.params; // Secteur à rechercher

        // Trouver la zone de livraison qui contient ce secteur
        const deliveryZone = await DeliveryZone.findOne({ sectors: sector });

        if (!deliveryZone) {
            return res.status(404).json({ message: 'Aucune zone de livraison trouvée pour ce secteur' });
        }

        res.json(deliveryZone);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;