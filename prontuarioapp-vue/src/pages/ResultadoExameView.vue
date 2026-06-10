<template>
  <div class="resultado-view">
    <h1>Resultados e Laudos de Exames</h1>

    <ResultadoExameCard 
      v-model="form" 
      :listaExames="exames"
      @salvar="salvarResultado" 
      @cancelar="cancelarEdicao" 
    />

    <hr />

    <div class="busca-container">
      <h3>Filtrar Laudos</h3>
      <div class="busca-input-grupo">
        <input 
          v-model="termoBusca" 
          placeholder="Buscar por conclusões ou nome do exame..." 
          class="input-busca"
        />
        <button v-if="termoBusca" @click="limparBusca" class="btn-limpar-busca">Limpar</button>
      </div>
    </div>

    <div class="lista-secao">
      <h3>Laudos Registrados</h3>
      <div v-if="carregando">Buscando laudos laboratoriais no servidor Django...</div>
      <div v-else>
        <p v-if="resultadosFiltrados.length === 0">Nenhum laudo de exame localizado.</p>
        
        <ResultadoExameItem 
          v-for="resultado in resultadosFiltrados" 
          :key="resultado.id" 
          :resultado="resultado"
          :nomeExame="obterNomeExame(resultado.exame_solicitado)"
          @editar="prepararEdicao"
          @deletar="deletarResultado"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api.js';
import ResultadoExameCard from '../components/ResultadoExameCard.vue';
import ResultadoExameItem from '../components/ResultadoExameItem.vue';

const resultados = ref([]);
const exames = ref([]);
const carregando = ref(true);
const termoBusca = ref('');

const estadoInicialForm = () => ({
  id: null,
  data_resultado: '',
  conclusoes: '',
  valor: '',
  unidade_medida: '',
  exame_solicitado: ''
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
        console.warn(`Aviso: Falha sutil ao tentar mapear endpoint [${url}].`);
        return [];
      }
    };

    // Carrega a tabela base de exames solicitados (tentando as duas rotas comuns)
    let dadosExames = await carregarTabela('exameSolicitado/api/');
    if (dadosExames.length === 0) {
      dadosExames = await carregarTabela('examesolicitado/api/');
    }
    exames.value = dadosExames;

    // Carrega a tabela de resultados do laudo
    resultados.value = await carregarTabela('resultadoexame/api/');

  } catch (error) {
    console.error("Erro geral no carregamento de laudos:", error);
  } finally {
    carregando.value = false;
  }
};

const salvarResultado = async () => {
  try {
    if (form.value.id) {
      await api.put(`resultadoexame/api/${form.value.id}/`, form.value);
      alert("Laudo de resultado atualizado!");
    } else {
      await api.post('resultadoexame/api/', form.value);
      alert("Laudo de exame lançado com sucesso!");
    }
    form.value = estadoInicialForm();
    carregarDadosDoSistema();
  } catch (error) {
    console.error("Erro ao salvar resultado de exame:", error);
    alert("Falha ao salvar. Verifique se os dados numéricos e campos textuais foram preenchidos.");
  }
};

const deletarResultado = async (id) => {
  if (confirm("Tem certeza de que deseja excluir permanentemente este laudo?")) {
    try {
      await api.delete(`resultadoexame/api/${id}/`);
      carregarDadosDoSistema();
    } catch (error) {
      console.error("Erro ao deletar registro:", error);
    }
  }
};

const obterNomeExame = (idExame) => {
  const ex = exames.value.find(item => item.id === idExame);
  return ex ? ex.nome_exame : 'Exame não identificado';
};

const prepararEdicao = (resultado) => {
  form.value = { ...resultado };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelarEdicao = () => {
  form.value = estadoInicialForm();
};

const resultadosFiltrados = computed(() => {
  if (!termoBusca.value) {
    return resultados.value;
  }
  const termo = termoBusca.value.toLowerCase();
  return resultados.value.filter(res => {
    const conc = res.conclusoes.toLowerCase();
    const exNome = obterNomeExame(res.exame_solicitado).toLowerCase();
    return conc.includes(termo) || exNome.includes(termo);
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
.resultado-view { padding: 20px; font-family: sans-serif; }
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