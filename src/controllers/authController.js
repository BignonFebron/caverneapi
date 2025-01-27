const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.loginSuperAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérification des identifiants superadmin
    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Génération d'un token JWT
    const token = jwt.sign(
      { role: 'superadmin', email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
