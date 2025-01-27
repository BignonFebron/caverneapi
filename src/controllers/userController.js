const User = require('../models/User');

exports.createUser = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    const newUser = new User({ firstName, lastName, email, password, role });
    await newUser.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ message: 'Utilisateur mis à jour', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
