<template>
  <div class="atestado-view">
    <h1>Emissão e Controle de Atestados</h1>

    <AtestadoCard 
      v-model="form" 
      :listaConsultas="consultas"
      :listaCids="cids"
      :obterNomePaciente="obterNomePacientePorId"
      @salvar="salvarAtestado"
      @cancelar="cancelarEdicao" 
    />

    <hr />

    <div class="busca-container">
      <h3>Buscar Atestados Emitidos</h3>
      <div class="busca-input-grupo">
        <input 
          v-model="termoBusca" 
          placeholder="Buscar por código de autenticação, paciente, médico ou código CID..." 
          class="input-busca"
        />
        <button v-if="termoBusca" @click="limparBusca" class="btn-limpar-busca">Limpar</button>
      </div>
    </div>

    <div class="lista-secao">
      <h3>Histórico de Documentos Emitidos</h3>
      <div v-if="carregando">Buscando atestados no servidor Django...</div>
      <div v-else>
        <p v-if="atestadosFiltrados.length === 0">Nenhum atestado localizado no sistema.</p>
        
        <AtestadoItem 
          v-for="atestado in atestadosFiltrados" 
          :key="atestado.id" 
          :atestado="atestado"
          :nomePaciente="obterNomePacientePorConsulta(atestado.consulta)"
          :nomeMedico="obterNomeMedicoPorConsulta(atestado.consulta)"
          :cidsDoAtestado="mapearCidsDoAtestado(atestado.cid)"
          @editar="prepararEdicao"
          @deletar="deletarAtestado"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api.js';
import AtestadoCard from '../components/AtestadoCard.vue';
import AtestadoItem from '../components/AtestadoItem.vue';

const atestados = ref([]);
const consultas = ref([]);
const pacientes = ref([]);
const medicos = ref([]);
const cids = ref([]);
const carregando = ref(true);
const termoBusca = ref('');

const estadoInicialForm = () => ({
  id: null,
  codigo_autenticacao: '',
  data_inicio_afastamento: '',
  quantidade_dias: '',
  tipo_atestado: 'MEDICO',
  consulta: '',
  cid: [] // Array mapeado para receber múltiplos IDs de CID (ManyToMany)
});

const form = ref(estadoInicialForm());

const carregarDadosDoSistema = async () => {
  carregando.value = true;
  try {
    const [resAtestados, resConsultas, resPacientes, resMedicos, resCids] = await Promise.all([
      api.get('atestado/api/'),
      api.get('consulta/api/'),
      api.get('paciente/api/'),
      api.get('medico/api/'),
      api.get('cid/api/')
    ]);
    atestados.value = resAtestados.data;
    consultas.value = resConsultas.data;
    pacientes.value = resPacientes.data;
    medicos.value = resMedicos.data;
    cids.value = resCids.data;
  } catch (error) {
    console.error("Erro na carga de dados estruturais:", error);
  } finally {
    carregando.value = false;
  }
};

const salvarAtestado = async () => {
  try {
    if (form.value.id) {
      await api.patch(`atestado/api/${form.value.id}/`, form.value);
      alert("Atestado atualizado com sucesso!");
    } else {
      await api.post('atestado/api/', form.value);
      alert("Atestado emitido com sucesso!");
    }
    form.value = estadoInicialForm();
    carregarDadosDoSistema();
  } catch (error) {
    console.error("Erro ao processar envio no Django:", error.response?.data || error);
    alert("Falha ao salvar. Verifique se o código de autenticação já não existe ou se há campos em branco.");
  }
};

const deletarAtestado = async (id) => {
  if (confirm("Tem certeza que deseja revogar/deletar permanentemente este atestado?")) {
    try {
      await api.delete(`atestado/api/${id}/`);
      carregarDadosDoSistema();
    } catch (error) {
      console.error("Erro ao deletar registro do Django:", error);
    }
  }
};

// Auxiliares de Cruzamento de IDs para montagem das Views
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

const mapearCidsDoAtestado = (arrayIdsCids) => {
  if (!arrayIdsCids) return [];
  return cids.value.filter(c => arrayIdsCids.includes(c.id));
};

const prepararEdicao = (atestado) => {
  form.value = { ...atestado };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelarEdicao = () => {
  form.value = estadoInicialForm();
};

// Filtro Reativo Cruzado de Busca (Fidelidade total ao Q do back-end)
const atestadosFiltrados = computed(() => {
  if (!termoBusca.value) {
    return atestados.value;
  }
  const termo = termoBusca.value.toLowerCase();
  return atestados.value.filter(a => {
    const codAut = a.codigo_autenticacao.toLowerCase();
    const pNome = obterNomePacientePorConsulta(a.consulta).toLowerCase();
    const mNome = obterNomeMedicoPorConsulta(a.consulta).toLowerCase();
    
    // Varre a lista de objetos CIDs internos para ver se o termo bate com o código do CID
    const possuiCidFiltrado = mapearCidsDoAtestado(a.cid).some(c => 
      c.cod_cid.toLowerCase().includes(termo) || c.descricao.toLowerCase().includes(termo)
    );

    return codAut.includes(termo) || pNome.includes(termo) || mNome.includes(termo) || possuiCidFiltrado;
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
.atestado-view { padding: 20px; font-family: sans-serif; }
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