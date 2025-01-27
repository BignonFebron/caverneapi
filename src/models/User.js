const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['product_manager', 'controller', 'client', 'service_client'], 
    default: 'client' 
  },
  createdAt: { type: Date, default: Date.now },
});

// Hachage du mot de passe avant sauvegarde
/*UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});*/

// Méthode pour comparer le mot de passe (haché à clair)
UserSchema.methods.comparePassword = async function (password) {
  //return bcrypt.compare(password, this.password);
  return password === this.password
};

module.exports = mongoose.model('User', UserSchema);
