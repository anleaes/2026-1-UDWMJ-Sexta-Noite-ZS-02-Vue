<template>
  <div class="consulta-view">
    <h1>Gerenciamento de Consultas</h1>

    <ConsultaCard 
      v-model="form" 
      :listaPacientes="pacientes"
      :listaMedicos="medicos"
      @salvar="salvarConsulta"
      @cancelar="cancelarEdicao" 
    />

    <hr />

    <div class="busca-container">
      <h3>Buscar Consultas</h3>
      <div class="busca-input-grupo">
        <input 
          v-model="termoBusca" 
          placeholder="Buscar por paciente, médico ou motivo..." 
          class="input-busca"
        />
        <button v-if="termoBusca" @click="limparBusca" class="btn-limpar-busca">Limpar</button>
      </div>
    </div>

    <div class="lista-secao">
      <h3>Consultas Registradas</h3>
      <div v-if="carregando">Buscando agenda no servidor Django...</div>
      <div v-else>
        <p v-if="consultasFiltradas.length === 0">Nenhuma consulta encontrada na base de dados.</p>
        
        <ConsultaItem 
          v-for="consulta in consultasFiltradas" 
          :key="consulta.id" 
          :consulta="consulta"
          :nomePaciente="obterNomePaciente(consulta.paciente)"
          :nomeMedico="obterNomeMedico(consulta.medico)"
          @editar="prepararEdicao"
          @deletar="deletarConsulta"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api.js';
import ConsultaCard from '../components/ConsultaCard.vue';
import ConsultaItem from '../components/ConsultaItem.vue';

const consultas = ref([]);
const pacientes = ref([]);
const medicos = ref([]);
const carregando = ref(true);
const termoBusca = ref('');

const estadoInicialForm = () => ({
  id: null,
  paciente: '',
  medico: '',
  data_agendada: '',
  status: 'AG',
  nivel_prioridade: 'N',
  motivo: ''
});

const form = ref(estadoInicialForm());

const carregarDadosDoSistema = async () => {
  carregando.value = true;
  try {
    const [resConsultas, resPacientes, resMedicos] = await Promise.all([
      api.get('consulta/api/'),
      api.get('paciente/api/'),
      api.get('medico/api/')
    ]);
    consultas.value = resConsultas.data;
    pacientes.value = resPacientes.data;
    medicos.value = resMedicos.data;
  } catch (error) {
    console.error("Erro na carga de dados da agenda:", error);
  } finally {
    carregando.value = false;
  }
};

const salvarConsulta = async () => {
  try {
    const payload = { ...form.value };
    if (payload.id) {
      await api.patch(`consulta/api/${payload.id}/`, payload);
      alert("Consulta atualizada com sucesso!");
    } else {
      await api.post('consulta/api/', payload);
      alert("Consulta agendada com sucesso!");
    }
    form.value = estadoInicialForm();
    carregarDadosDoSistema();
  } catch (error) {
    console.error("Erro ao agendar consulta no Django:", error.response?.data || error);
    alert("Falha ao salvar. Revise a consistência de data e seleções.");
  }
};

const deletarConsulta = async (id) => {
  if (confirm("Tem certeza que deseja remover esta consulta definitivamente?")) {
    try {
      await api.delete(`consulta/api/${id}/`);
      carregarDadosDoSistema();
    } catch (error) {
      console.error("Erro ao deletar da API Django:", error);
    }
  }
};

const obterNomePaciente = (idPaciente) => {
  const p = pacientes.value.find(item => item.id === idPaciente);
  return p ? `${p.nome} ${p.sobrenome}` : 'Paciente não localizado';
};

const obterNomeMedico = (idMedico) => {
  const m = medicos.value.find(item => item.id === idMedico);
  return m ? `${m.nome} ${m.sobrenome}` : 'Médico não localizado';
};

const prepararEdicao = (consulta) => {
  const copia = { ...consulta };
  if (copia.data_agendada) {
    copia.data_agendada = copia.data_agendada.substring(0, 16);
  }
  form.value = copia;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelarEdicao = () => {
  form.value = estadoInicialForm();
};

const consultasFiltradas = computed(() => {
  const listaOrdenada = [...consultas.value].sort((a, b) => new Date(b.data_agendada) - new Date(a.data_agendada));
  
  if (!termoBusca.value) {
    return listaOrdenada;
  }
  const termo = termoBusca.value.toLowerCase();
  return listaOrdenada.filter(c => {
    const pNome = obterNomePaciente(c.paciente).toLowerCase();
    const mNome = obterNomeMedico(c.medico).toLowerCase();
    const motivo = c.motivo.toLowerCase();
    return pNome.includes(termo) || mNome.includes(termo) || motivo.includes(termo);
  });
});

const limparBusca = () => {
  termoBusca.value = '';
};

onMounted(() => {
  carregarDadosDoSistema();
});
</script>

<style scoped>
.consulta-view { padding: 20px; font-family: sans-serif; }
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