/const axios = require('axios');

class ExternalApiService {
    // Busca endereço pelo CEP (ViaCEP - Gratuito e sem chave)
    async getAddressByCep(cep) {
        try {
            const response = await axios.get(`https://viacep.com.br{cep}/json/`);
            if (response.data.erro) throw new Error('CEP não encontrado');
            return response.data;
        } catch (error) {
            return null;
        }
    }

    // Busca clima (OpenWeatherMap - Precisa de uma API KEY gratuita)
    async getWeatherData(cidade) {
        const API_KEY = process.env.OPENWEATHER_KEY || 'SUA_CHAVE_AQUI';
        try {
            // Unidades em metric (Celsius) e linguagem pt_br
            const url = `https://api.openweathermap.org{cidade},br&appid=${API_KEY}&units=metric&lang=pt_br`;
            const response = await axios.get(url);
            
            const clima = response.data.weather[0].main.toLowerCase();
            const descricao = response.data.weather[0].description;

            return {
                descricao: descricao,
                alertaChuva: clima.includes('rain') || clima.includes('drizzle')
            };
        } catch (error) {
            console.error("Erro ao buscar clima:", error.message);
            return { descricao: "Clima indisponível", alertaChuva: false };
        }
    }
}

module.exports = new ExternalApiService();
