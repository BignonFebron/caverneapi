const express = require('express');
const { loginSuperAdmin } = require('../controllers/authController');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');


// Route pour le login du superadmin
router.post('/superadmin/login', loginSuperAdmin);
// Connexion product manager et service client
router.post('/login', async (req, res) => {
    const { email, password } = req.body;  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
      }
  
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Mot de passe incorrect' });
      }
      console.log('-------------------',user)

      // Génération du token JWT
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
      res.json({ token, role: user.role });
    } catch (error) {
      console.log('###############"',error)
      res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
  });
  
  // Middleware pour vérifier le token
  const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Accès non autorisé' });
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Token invalide' });
    }
  };

module.exports = router;
