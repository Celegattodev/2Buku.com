const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  description: String,
  image: String, // URL da imagem
  // outros campos
});

module.exports = mongoose.model('User', userSchema);