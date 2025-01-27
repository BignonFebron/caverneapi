// routes/settings.js
const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Récupérer les configurations actuelles
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.findOne(); // On suppose qu'il y a une seule entrée
    if (!settings) {
      return res.status(404).json({ message: 'Aucune configuration trouvée. Veuillez ajouter les paramètres.' });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

// Ajouter ou mettre à jour les configurations
router.post('/', async (req, res) => {
  const { refundRate, refundDelay } = req.body;

  // Validation des valeurs
  if (refundRate < 0 || refundRate > 100 || refundDelay < 1) {
    return res.status(400).json({ message: 'Valeurs invalides pour le taux de remboursement ou le délai.' });
  }

  try {
    let settings = await Settings.findOne({refundDelay, refundRate});
    
    if (!settings) {
      // Si aucune configuration n'existe, on en crée une nouvelle
      if (!refundRate || !refundDelay) {
        return res.status(400).json({ message: 'Bad Request.' });
      }
      settings = new Settings({ refundRate, refundDelay });
      await settings.save();
      return res.status(201).json({ message: 'Paramètres ajoutés avec succès.' });
    } else {
      // Sinon, on met à jour les configurations existantes
      if (refundRate) settings.refundRate = refundRate;
      if (refundDelay) settings.refundDelay = refundDelay;
      await settings.save();
      return res.json({ message: 'Paramètres mis à jour avec succès.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur interne lors de l\'ajout des paramètres.' });
  }
});

module.exports = router;
