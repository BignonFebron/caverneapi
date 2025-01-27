const express = require('express');
const { createUser, getUsers, updateUser, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

// Middleware pour protéger les routes
router.use(authMiddleware);

// CRUD Utilisateurs
router.post('/', createUser); // Créer un utilisateur
router.get('/', getUsers); // Récupérer la liste des utilisateurs
router.patch('/:id', updateUser); // Modifier un utilisateur
router.delete('/:id', deleteUser); // Supprimer un utilisateur

module.exports = router;
