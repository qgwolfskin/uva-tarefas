const Appointment = require('../models/Appointment');
const ExternalApi = require('../services/ExternalApiService');

module.exports = {
    async store(req, res) {
        const { dataHora, especialidade, cep } = req.body;
        const pacienteId = req.userId; // Vem do middleware de JWT

        try {
            // 1. Verificar se o horário já está ocupado
            const conflito = await Appointment.findOne({ dataHora });
            if (conflito) {
                return res.status(400).json({ error: 'Este horário já está preenchido.' });
            }

            // 2. Buscar endereço automaticamente pelo CEP
            const addressData = await ExternalApi.getAddressByCep(cep);
            if (!addressData) {
                return res.status(400).json({ error: 'CEP inválido ou não encontrado.' });
            }

            // 3. Buscar clima para a cidade do agendamento
            const weatherData = await ExternalApi.getWeatherData(addressData.localidade);

            // 4. Criar o agendamento no banco
            const appointment = await Appointment.create({
                paciente: pacienteId,
                dataHora,
                especialidade,
                endereco: {
                    cep: addressData.cep,
                    logradouro: addressData.logradouro,
                    bairro: addressData.bairro,
                    cidade: addressData.localidade
                },
                previsaoClima: {
                    descricao: weatherData.descricao,
                    alertaChuva: weatherData.alertaChuva
                }
            });

            return res.status(201).json(appointment);

        } catch (err) {
            return res.status(500).json({ error: 'Erro ao processar agendamento.' });
        }
    },

    // Listagem para o Painel (Filtra se for Paciente ou mostra tudo se for Secretário)
    async index(req, res) {
        try {
            let appointments;
            
            if (req.userRole === 'secretario') {
                // Secretário vê tudo e traz os dados do paciente (populate)
                appointments = await Appointment.find().populate('paciente', 'nome email');
            } else {
                // Paciente vê apenas os seus
                appointments = await Appointment.find({ paciente: req.userId });
            }

            return res.json(appointments);
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao buscar agendamentos.' });
        }
    }
};
