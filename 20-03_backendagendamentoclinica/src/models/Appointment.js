const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dataHora: { type: Date, required: true },
    especialidade: { type: String, required: true },
    endereco: {
        cep: String,
        logradouro: String,
        bairro: String,
        cidade: String
    },
    previsaoClima: {
        descricao: String, // ex: "Chuva leve"
        alertaChuva: { type: Boolean, default: false }
    },
    status: { type: String, enum: ['agendado', 'concluido', 'cancelado'], default: 'agendado' }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
