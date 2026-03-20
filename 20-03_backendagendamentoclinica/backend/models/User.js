const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    senha: { type: String, required: true, select: false }, // 'select: false' para não vir no GET comum
    role: { type: String, enum: ['paciente', 'secretario'], default: 'paciente' },
    createdAt: { type: Date, default: Date.now }
});

// Criptografar senha antes de salvar
UserSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.senha, 10);
    this.senha = hash;
    next();
});

module.exports = mongoose.model('User', UserSchema);
