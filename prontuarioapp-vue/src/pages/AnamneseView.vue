<template>
  <div class="anamnese-view">
    <h1>Histórico Clínico - Anamneses</h1>

    <AnamneseCard 
      v-model="form" 
      :listaPacientes="pacientes"
      :listaMedicos="medicos"
      @salvar="salvarAnamnese"
      @cancelar="cancelarEdicao" 
    />

    <hr />

    <div class="busca-container">
      <h3>Buscar por Prontuários</h3>
      <div class="busca-input-grupo">
        <input 
          v-model="termoBusca" 
          placeholder="Buscar por nome do paciente, médico ou sintomas..." 
          class="input-busca"
        />
        <button v-if="termoBusca" @click="limparBusca" class="btn-limpar-busca">Limpar</button>
      </div>
    </div>

    <div class="lista-secao">
      <h3>Registros Clinicos Recentes</h3>
      <div v-if="carregando">Buscando prontuários de anamnese no servidor Django...</div>
      <div v-else>
        <p v-if="anamnesesFiltradas.length === 0">Nenhum registro clínico encontrado.</p>
        
        <AnamneseItem 
          v-for="anamnese in anamnesesFiltradas" 
          :key="anamnese.id" 
          :anamnese="anamnese"
          :nomePaciente="obterNomePaciente(anamnese.paciente)"
          :nomeMedico="obterNomeMedico(anamnese.medico)"
          @editar="prepararEdicao"
          @deletar="deletarAnamnese"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api.js';
import AnamneseCard from '../components/AnamneseCard.vue';
import AnamneseItem from '../components/AnamneseItem.vue';

// Estados locais das tabelas relacionadas
const anamneses = ref([]);
const pacientes = ref([]);
const medicos = ref([]);
const carregando = ref(true);
const termoBusca = ref('');

const estadoInicialForm = () => ({
  id: null,
  paciente: '',
  medico: '',
  queixa_principal: '',
  alergias: '',
  medicamentos: '',
  alcool: 'NAO',
  fumante: 'NAO'
});

const form = ref(estadoInicialForm());

// Carregamento multi-tabelas simultâneo (Carga Relacional)
const carregarDadosDoSistema = async () => {
  carregando.value = true;
  try {
    const [resAnamneses, resPacientes, resMedicos] = await Promise.all([
      api.get('anamnese/api/'),
      api.get('paciente/api/'),
      api.get('medico/api/')
    ]);
    anamneses.value = resAnamneses.data;
    pacientes.value = resPacientes.data;
    medicos.value = resMedicos.data;
  } catch (error) {
    console.error("Erro na carga de dados relacionais:", error);
  } finally {
    carregando.value = false;
  }
};

// POST / PATCH
const salvarAnamnese = async () => {
  try {
    if (form.value.id) {
      await api.patch(`anamnese/api/${form.value.id}/`, form.value);
      alert("Anamnese atualizada com sucesso!");
    } else {
      await api.post('anamnese/api/', form.value);
      alert("Anamnese registrada com sucesso!");
    }
    form.value = estadoInicialForm();
    carregarDadosDoSistema();
  } catch (error) {
    console.error("Erro ao salvar anamnese no Django:", error.response?.data || error);
    alert("Falha ao salvar o prontuário. Revise as seleções e os campos.");
  }
};

// DELETE
const deletarAnamnese = async (id) => {
  if (confirm("Tem certeza que deseja remover esta anamnese definitivamente?")) {
    try {
      await api.delete(`anamnese/api/${id}/`);
      carregarDadosDoSistema();
    } catch (error) {
      console.error("Erro ao deletar do Django:", error);
    }
  }
};

// Auxiliares de Cruzamento de chaves para resolução de IDs em Texto Legível
const obterNomePaciente = (idPaciente) => {
  const p = pacientes.value.find(item => item.id === idPaciente);
  return p ? `${p.nome} ${p.sobrenome}` : 'Paciente não localizado';
};

const obterNomeMedico = (idMedico) => {
  const m = medicos.value.find(item => item.id === idMedico);
  return m ? `${m.nome} ${m.sobrenome}` : 'Médico não localizado';
};

const prepararEdicao = (anamnese) => {
  form.value = { ...anamnese };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelarEdicao = () => {
  form.value = estadoInicialForm();
};

// Filtro Reativo Cruzado de Busca por Nome de Paciente, Médico ou Sintomas
const anamnesesFiltradas = computed(() => {
  if (!termoBusca.value) {
    return anamneses.value;
  }
  const termo = termoBusca.value.toLowerCase();
  return anamneses.value.filter(a => {
    const pNome = obterNomePaciente(a.paciente).toLowerCase();
    const mNome = obterNomeMedico(a.medico).toLowerCase();
    const queixa = a.queixa_principal.toLowerCase();
    return pNome.includes(termo) || mNome.includes(termo) || queixa.includes(termo);
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
.anamnese-view { padding: 20px; font-family: sans-serif; }
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