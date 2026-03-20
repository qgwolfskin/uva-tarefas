const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth'); // Importa o arquivo que você criou
const AppointmentController = require('../controllers/AppointmentController');

// Todas as rotas abaixo desta linha exigirão o Token JWT no cabeçalho (Header)
router.use(authMiddleware);

router.post('/agendar', AppointmentController.store);
router.get('/meus-agendamentos', AppointmentController.index);

module.exports = router;
