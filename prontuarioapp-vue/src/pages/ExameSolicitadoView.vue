<template>
  <div class="exame-view">
    <h1>Controle de Exames Solicitados</h1>

    <ExameSolicitadoCard 
      v-model="form" 
      :listaConsultas="consultas"
      :obterNomePaciente="obterNomePacientePorId"
      @salvar="salvarExame" 
      @cancelar="cancelarEdicao" 
    />

    <hr />

    <div class="busca-container">
      <h3>Buscar Exames</h3>
      <div class="busca-input-grupo">
        <input 
          v-model="termoBusca" 
          placeholder="Buscar por nome do exame ou paciente..." 
          class="input-busca"
        />
        <button v-if="termoBusca" @click="limparBusca" class="btn-limpar-busca">Limpar</button>
      </div>
    </div>

    <div class="lista-secao">
      <h3>Pedidos de Exames Registrados</h3>
      <div v-if="carregando">Buscando registros no servidor Django...</div>
      <div v-else>
        <p v-if="examesFiltrados.length === 0">Nenhum exame solicitado encontrado.</p>
        
        <ExameSolicitadoItem 
          v-for="exame in examesFiltrados" 
          :key="exame.id" 
          :exame="exame"
          :nomePaciente="obterNomePacientePorConsulta(exame.consulta)"
          :nomeMedico="obterNomeMedicoPorConsulta(exame.consulta)"
          @editar="prepararEdicao"
          @deletar="deletarExame"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api.js';
import ExameSolicitadoCard from '../components/ExameSolicitadoCard.vue';
import ExameSolicitadoItem from '../components/ExameSolicitadoItem.vue';

const exames = ref([]);
const consultas = ref([]);
const pacientes = ref([]);
const medicos = ref([]);
const carregando = ref(true);
const termoBusca = ref('');

const estadoInicialForm = () => ({
  id: null,
  nome_exame: '',
  descricao: '',
  preparo: '',
  exige_jejum: false,
  consulta: ''
});

const form = ref(estadoInicialForm());

const carregarDadosDoSistema = async () => {
  carregando.value = true;
  try {
    const carregarTabela = async (url) => {
      try {
        const res = await api.get(url);
        return res.data;
      } catch (err) {
        console.warn(`Aviso: Rota [${url}] falhou no carregamento local.`);
        return [];
      }
    };

    consultas.value = await carregarTabela('consulta/api/');
    pacientes.value = await carregarTabela('paciente/api/');
    medicos.value = await carregarTabela('medico/api/');

    // Tenta carregar exames combinando as variações comuns de rota
    let dadosExames = await carregarTabela('exameSolicitado/api/');
    if (dadosExames.length === 0) {
      dadosExames = await carregarTabela('examesolicitado/api/');
    }
    exames.value = dadosExames;

  } catch (error) {
    console.error("Erro geral no carregamento de exames:", error);
  } finally {
    carregando.value = false;
  }
};

const salvarExame = async () => {
  try {
    // Tenta salvar usando o endpoint mapeado na caixa alta do Django
    if (form.value.id) {
      try {
        await api.patch(`exameSolicitado/api/${form.value.id}/`, form.value);
      } catch {
        await api.patch(`examesolicitado/api/${form.value.id}/`, form.value);
      }
      alert("Solicitação de exame atualizada!");
    } else {
      try {
        await api.post('exameSolicitado/api/', form.value);
      } catch {
        await api.post('examesolicitado/api/', form.value);
      }
      alert("Exame solicitado com sucesso!");
    }
    form.value = estadoInicialForm();
    carregarDadosDoSistema();
  } catch (error) {
    console.error("Erro ao salvar exame:", error);
    alert("Falha ao salvar o exame. Revise os campos obrigatórios.");
  }
};

const deletarExame = async (id) => {
  if (confirm("Deseja realmente remover esta solicitação de exame?")) {
    try {
      try {
        await api.delete(`exameSolicitado/api/${id}/`);
      } catch {
        await api.delete(`examesolicitado/api/${id}/`);
      }
      carregarDadosDoSistema();
    } catch (error) {
      console.error("Erro ao deletar registro:", error);
    }
  }
};

// Auxiliares relacionais de cruzamento de dados
const obterNomePacientePorId = (idPac) => {
  const p = pacientes.value.find(item => item.id === idPac);
  return p ? `${p.nome} ${p.sobrenome}` : 'Carregando...';
};

const obterNomePacientePorConsulta = (idConsulta) => {
  const c = consultas.value.find(item => item.id === idConsulta);
  return c ? obterNomePacientePorId(c.paciente) : 'Não localizado';
};

const obterNomeMedicoPorConsulta = (idConsulta) => {
  const c = consultas.value.find(item => item.id === idConsulta);
  if (!c) return 'Não localizado';
  const m = medicos.value.find(item => item.id === c.medico);
  return m ? `${m.nome} ${m.sobrenome}` : 'Não localizado';
};

const prepararEdicao = (exame) => {
  form.value = { ...exame };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelarEdicao = () => {
  form.value = estadoInicialForm();
};

const examesFiltrados = computed(() => {
  if (!termoBusca.value) {
    return exames.value;
  }
  const termo = termoBusca.value.toLowerCase();
  return exames.value.filter(ex => {
    const nomeEx = ex.nome_exame.toLowerCase();
    const nomePac = obterNomePacientePorConsulta(ex.consulta).toLowerCase();
    return nomeEx.includes(termo) || nomePac.includes(termo);
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
.exame-view { padding: 20px; font-family: sans-serif; }
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