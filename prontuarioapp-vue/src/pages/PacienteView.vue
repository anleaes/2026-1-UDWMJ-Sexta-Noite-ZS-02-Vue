<template>
  <div class="paciente-view">
    <h1>Controle de Pacientes</h1>

    <PacienteCard 
      v-model="form" 
      @salvar="salvarPaciente" 
      @cancelar="cancelarEdicao" 
    />

    <hr />

    <div class="busca-container">
      <h3>Buscar Paciente</h3>
      <div class="busca-input-grupo">
        <input 
          v-model="termoBusca" 
          placeholder="Buscar por nome ou CPF..." 
          class="input-busca"
        />
        <button v-if="termoBusca" @click="limparBusca" class="btn-limpar-busca">Limpar</button>
      </div>
    </div>

    <div class="lista-secao">
      <h3>Pacientes Cadastrados</h3>
      <div v-if="carregando">Buscando registros no servidor Django...</div>
      <div v-else>
        <p v-if="pacientesFiltrados.length === 0">Nenhum paciente encontrado na base de dados.</p>
        
        <PacienteItem 
          v-for="paciente in pacientesFiltrados" 
          :key="paciente.id" 
          :paciente="paciente"
          @editar="prepararEdicao"
          @deletar="deletarPaciente"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api.js';
import PacienteCard from '../components/PacienteCard.vue';
import PacienteItem from '../components/PacienteItem.vue';

const pacientes = ref([]);
const carregando = ref(true);
const termoBusca = ref('');

const estadoInicialForm = () => ({
  id: null,
  nome: '',
  sobrenome: '',
  cpf: '',
  telefone: '',
  email: '',
  data_nascimento: '',
  peso: '',
  altura: '',
  endereco: ''
});

const form = ref(estadoInicialForm());

const buscarPacientes = async () => {
  carregando.value = true;
  try {
    const response = await api.get('paciente/api/');
    pacientes.value = response.data;
  } catch (error) {
    console.error("Erro ao carregar pacientes do Django:", error);
  } finally {
    carregando.value = false;
  }
};

const salvarPaciente = async () => {
  try {
    if (form.value.id) {
      await api.patch(`paciente/api/${form.value.id}/`, form.value);
      alert("Paciente updated com sucesso!");
    } else {
      await api.post('paciente/api/', form.value);
      alert("Paciente cadastrado com sucesso!");
    }
    form.value = estadoInicialForm();
    buscarPacientes();
  } catch (error) {
    console.error("Erro ao enviar dados para a API:", error.response?.data || error);
    alert("Falha ao salvar. Revise os campos preenchidos.");
  }
};

const deletarPaciente = async (id) => {
  if (confirm("Tem certeza que deseja excluir em definitivo este paciente?")) {
    try {
      await api.delete(`paciente/api/${id}/`);
      buscarPacientes();
    } catch (error) {
      console.error("Erro ao deletar registro do Django:", error);
    }
  }
};

const prepararEdicao = (paciente) => {
  form.value = { ...paciente };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelarEdicao = () => {
  form.value = estadoInicialForm();
};

const pacientesFiltrados = computed(() => {
  if (!termoBusca.value) {
    return pacientes.value;
  }
  const termo = termoBusca.value.toLowerCase();
  return pacientes.value.filter(paciente => {
    const nomeCompleto = `${paciente.nome} ${paciente.sobrenome}`.toLowerCase();
    return nomeCompleto.includes(termo) || paciente.cpf.includes(termo);
  });
});

const limparBusca = () => {
  termoBusca.value = '';
};

onMounted(() => {
  buscarPacientes();
});
</script>

<style scoped>
.paciente-view { padding: 20px; font-family: sans-serif; }
.lista-secao { margin-top: 20px; }
hr { border: 0; border-top: 1px solid #eee; margin: 30px 0; }

.busca-container { margin-bottom: 25px; background: #fdfdfd; padding: 15px; border-radius: 6px; border: 1px solid #eaeaea; }
.busca-container h3 { margin-top: 0; margin-bottom: 10px; color: #333; }
.busca-input-grupo { display: flex; gap: 10px; max-width: 600px; }
.input-busca { flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; }
.input-busca:focus { border-color: #2196f3; outline: none; }
.btn-limpar-busca { padding: 10px 15px; background-color: #e0e0e0; border: none; border-radius: 4px; cursor: pointer; }
.btn-limpar-busca:hover { background-color: #d5d5d5; }
</style>