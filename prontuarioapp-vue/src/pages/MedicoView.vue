<template>
  <div class="medico-view">
    <h1>Controle de Médicos</h1>

    <MedicoCard 
      v-model="form" 
      @salvar="salvarMedico" 
      @cancelar="cancelarEdicao" 
    />

    <hr />

    <div class="busca-container">
      <h3>Buscar Médico</h3>
      <div class="busca-input-grupo">
        <input 
          v-model="termoBusca" 
          placeholder="Buscar por nome ou especialidade..." 
          class="input-busca"
        />
        <button v-if="termoBusca" @click="limparBusca" class="btn-limpar-busca">Limpar</button>
      </div>
    </div>

    <div class="lista-secao">
      <h3>Médicos Cadastrados</h3>
      <div v-if="carregando">Buscando registros no servidor Django...</div>
      <div v-else>
        <p v-if="medicosFiltrados.length === 0">Nenhum médico encontrado.</p>
        
        <MedicoItem 
          v-for="medico in medicosFiltrados" 
          :key="medico.id" 
          :medico="medico"
          @editar="prepararEdicao"
          @deletar="deletarMedico"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api.js';
import MedicoCard from '../components/MedicoCard.vue';
import MedicoItem from '../components/MedicoItem.vue';

// Estados reativos
const medicos = ref([]);
const carregando = ref(true);
const termoBusca = ref('');

// Estado inicial espelhando os campos do MedicoSerializer do Django
const estadoInicialForm = () => ({
  id: null,
  nome: '',
  sobrenome: '',
  cpf: '',
  telefone: '',
  email: '',
  crm: '',
  especialidade: 'Clínico Geral',
  matricula: '',
  data_contratacao: '',
  cargo: '',
  esta_ativo: true
});

const form = ref(estadoInicialForm());

// 1. GET - Listar Médicos
const buscarMedicos = async () => {
  carregando.value = true;
  try {
    const response = await api.get('medico/api/');
    medicos.value = response.data;
  } catch (error) {
    console.error("Erro ao carregar médicos do Django:", error);
  } finally {
    carregando.value = false;
  }
};

// 2. POST / PATCH - Criar ou Editar Médico
const salvarMedico = async () => {
  try {
    if (form.value.id) {
      await api.patch(`medico/api/${form.value.id}/`, form.value);
      alert("Médico atualizado com sucesso!");
    } else {
      await api.post('medico/api/', form.value);
      alert("Médico cadastrado com sucesso!");
    }
    form.value = estadoInicialForm();
    buscarMedicos();
  } catch (error) {
    console.error("Erro ao salvar médico no Django:", error.response?.data || error);
    alert("Falha ao salvar médico. Verifique os campos preenchidos.");
  }
};

// 3. DELETE - Remover Médico
const deletarMedico = async (id) => {
  if (confirm("Tem certeza que deseja excluir em definitivo este médico?")) {
    try {
      await api.delete(`medico/api/${id}/`);
      buscarMedicos();
    } catch (error) {
      console.error("Erro ao deletar médico do Django:", error);
    }
  }
};

// Lógica de Edição: preenche o form com os dados da linha
const prepararEdicao = (medico) => {
  form.value = { ...medico };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelarEdicao = () => {
  form.value = estadoInicialForm();
};

// Filtro reativo que replica o Q(nome__icontains) | Q(especialidade__icontains) do Django
const medicosFiltrados = computed(() => {
  if (!termoBusca.value) {
    return medicos.value;
  }
  const termo = termoBusca.value.toLowerCase();
  return medicos.value.filter(medico => {
    const nomeCompleto = `${medico.nome} ${medico.sobrenome}`.toLowerCase();
    const esp = medico.especialidade.toLowerCase();
    return nomeCompleto.includes(termo) || esp.includes(termo);
  });
});

const limparBusca = () => {
  termoBusca.value = '';
};

// Gatilho de carregamento inicial
onMounted(() => {
  buscarMedicos();
});
</script>

<style scoped>
.medico-view { padding: 20px; font-family: sans-serif; }
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