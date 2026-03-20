const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Função para gerar o Token (válido por 1 dia)
function generateToken(params = {}) {
    return jwt.sign(params, process.env.JWT_SECRET || 'secret_key_da_clinica', {
        expiresIn: 86400,
    });
}

module.exports = {
    // Registro de Novo Usuário
    async register(req, res) {
        const { email } = req.body;
        try {
            if (await User.findOne({ email })) {
                return res.status(400).send({ error: 'Usuário já existe' });
            }

            const user = await User.create(req.body);
            user.senha = undefined; // Não retornar a senha no JSON

            return res.send({ 
                user, 
                token: generateToken({ id: user.id, role: user.role }) 
            });
        } catch (err) {
            return res.status(400).send({ error: 'Falha no registro' });
        }
    },

    // Login de Usuário
    async authenticate(req, res) {
        const { email, senha } = req.body;

        const user = await User.findOne({ email }).select('+senha');

        if (!user) {
            return res.status(400).send({ error: 'Usuário não encontrado' });
        }

        if (!await bcrypt.compare(senha, user.senha)) {
            return res.status(400).send({ error: 'Senha inválida' });
        }

        user.senha = undefined;

        res.send({ 
            user, 
            token: generateToken({ id: user.id, role: user.role }) 
        });
    }
};
