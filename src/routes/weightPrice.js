// routes/weightPriceRoutes.js
const express = require('express');
const WeightPrice = require('../models/WeightPrice');
const auth = require('../middleware/auth');
const router = express.Router();

// Créer un prix-poids
router.post('/', auth(['superadmin', 'service_client']), async (req, res) => {
    try {
        const { minWeight, maxWeight, price } = req.body;
        const newWeightPrice = new WeightPrice({ minWeight, maxWeight, price });
        await newWeightPrice.save();
        res.status(201).json(newWeightPrice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Lire tous les prix-poids
router.get('/', auth(['superadmin', 'service_client']), async (req, res) => {
    try {
        const weightPrices = await WeightPrice.find();
        res.json(weightPrices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Lire un prix-poids par son ID
router.get('/:id', auth(['superadmin', 'service_client']), async (req, res) => {
    try {
        const weightPrice = await WeightPrice.findById(req.params.id);
        if (!weightPrice) return res.status(404).json({ message: 'Prix-poids non trouvé' });
        res.json(weightPrice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour un prix-poids
router.patch('/:id', auth(['superadmin', 'service_client']), async (req, res) => {
    try {
        const updatedWeightPrice = await WeightPrice.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedWeightPrice) return res.status(404).json({ message: 'Prix-poids non trouvé' });
        res.json(updatedWeightPrice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer un prix-poids
router.delete('/:id', auth(['superadmin', 'service_client']), async (req, res) => {
    try {
        const deletedWeightPrice = await WeightPrice.findByIdAndDelete(req.params.id);
        if (!deletedWeightPrice) return res.status(404).json({ message: 'Prix-poids non trouvé' });
        res.json({ message: 'Prix-poids supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;