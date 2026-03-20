<template>
  <div id="app" class="container">
    <h1>🏥 Sistema de Agendamento Inteligente</h1>

    <!-- TELA DE LOGIN (Se não estiver logado) -->
    <div v-if="!token" class="card">
      <h2>Login</h2>
      <input v-model="login.email" placeholder="E-mail" type="email">
      <input v-model="login.senha" placeholder="Senha" type="password">
      <button @click="fazerLogin">Entrar</button>
    </div>

    <!-- PAINEL DE AGENDAMENTO (Se estiver logado) -->
    <div v-else class="card">
      <p>Bem-vindo! <button @click="logout">Sair</button></p>
      
      <h2>Novo Agendamento</h2>
      <input v-model="agenda.dataHora" type="datetime-local">
      <input v-model="agenda.especialidade" placeholder="Especialidade (Ex: Cardiologia)">
      
      <div class="cep-group">
        <input v-model="agenda.cep" @blur="buscarEndereco" placeholder="Digite o CEP">
        <small v-if="loadingCep">Buscando endereço...</small>
      </div>

      <div v-if="endereco">
        <p>📍 {{ endereco.logradouro }}, {{ endereco.bairro }} - {{ endereco.localidade }}</p>
      </div>

      <button @click="salvarAgendamento">Confirmar Consulta</button>

      <!-- LISTA DE CONSULTAS -->
      <hr>
      <h3>Meus Agendamentos</h3>
      <ul>
        <li v-for="item in consultas" :key="item._id">
          {{ new Date(item.dataHora).toLocaleString() }} - {{ item.especialidade }}
          <br> ☁️ Clima: {{ item.previsaoClima.descricao }} 
          <strong v-if="item.previsaoClima.alertaChuva" style="color: red;">(⚠️ Alerta de Chuva)</strong>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3000' }); // Ajuste para a porta do seu backend

export default {
  data() {
    return {
      token: localStorage.getItem('token') || '',
      login: { email: '', senha: '' },
      agenda: { dataHora: '', especialidade: '', cep: '' },
      endereco: null,
      consultas: [],
      loadingCep: false
    }
  },
  methods: {
    async fazerLogin() {
      try {
        const res = await api.post('/auth/login', this.login);
        this.token = res.data.token;
        localStorage.setItem('token', this.token);
        this.listarConsultas();
      } catch (e) { alert('Erro no login!'); }
    },
    async buscarEndereco() {
      if (this.agenda.cep.length === 8) {
        this.loadingCep = true;
        const res = await axios.get(`https://viacep.com.br{this.agenda.cep}/json/`);
        this.endereco = res.data;
        this.loadingCep = false;
      }
    },
    async salvarAgendamento() {
      try {
        await api.post('/appointments', this.agenda, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        alert('Agendado com sucesso!');
        this.listarConsultas();
      } catch (e) { alert('Erro: ' + e.response.data.error); }
    },
    async listarConsultas() {
      const res = await api.get('/appointments', {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      this.consultas = res.data;
    },
    logout() {
      this.token = '';
      localStorage.removeItem('token');
    }
  },
  mounted() {
    if (this.token) this.listarConsultas();
  }
}
</script>

<style>
.container { max-width: 500px; margin: 50px auto; font-family: sans-serif; }
.card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
input { display: block; width: 100%; margin-bottom: 10px; padding: 8px; }
button { width: 100%; padding: 10px; background: #2ecc71; color: white; border: none; cursor: pointer; }
</style>
