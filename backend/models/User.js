const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'conductor'], default: 'conductor' },
  email: { type: String, required: true, unique: true },
  telefono: { type: String },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
