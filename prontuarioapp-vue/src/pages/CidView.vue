<template>
  <div class="cid-view">
    <h1>Catálogo de Classificação de Doenças (CID)</h1>

    <CidCard 
      v-model="form" 
      @salvar="salvarCid" 
      @cancelar="cancelarEdicao" 
    />

    <hr />

    <div class="busca-container">
      <h3>Buscar no Catálogo</h3>
      <div class="busca-input-grupo">
        <input 
          v-model="termoBusca" 
          placeholder="Buscar por código CID ou descrição da doença..." 
          class="input-busca"
        />
        <button v-if="termoBusca" @click="limparBusca" class="btn-limpar-busca">Limpar</button>
      </div>
    </div>

    <div class="lista-secao">
      <h3>CIDs Cadastrados</h3>
      <div v-if="carregando">Buscando registros no servidor Django...</div>
      <div v-else>
        <p v-if="cidsFiltrados.length === 0">Nenhum CID encontrado na base de dados.</p>
        
        <CidItem 
          v-for="cid in cidsFiltrados" 
          :key="cid.id" 
          :cid="cid"
          @editar="prepararEdicao"
          @deletar="deletarCid"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api.js';
import CidCard from '../components/CidCard.vue';
import CidItem from '../components/CidItem.vue';

const cids = ref([]);
const carregando = ref(true);
const termoBusca = ref('');

const estadoInicialForm = () => ({
  id: null,
  cod_cid: '',
  descricao: '',
  sintomas: '',
  tipo: '',
  status_ativo: true
});

const form = ref(estadoInicialForm());

// 1. GET - Listar CIDs
const buscarCids = async () => {
  carregando.value = true;
  try {
    const response = await api.get('cid/api/');
    cids.value = response.data;
  } catch (error) {
    console.error("Erro ao carregar CIDs do Django:", error);
  } finally {
    carregando.value = false;
  }
};

// 2. POST / PATCH - Criar ou Editar CID
const salvarCid = async () => {
  try {
    if (form.value.id) {
      await api.patch(`cid/api/${form.value.id}/`, form.value);
      alert("CID atualizado com sucesso!");
    } else {
      await api.post('cid/api/', form.value);
      alert("CID cadastrado com sucesso!");
    }
    form.value = estadoInicialForm();
    buscarCids();
  } catch (error) {
    console.error("Erro ao salvar CID no Django:", error.response?.data || error);
    alert("Falha ao salvar. Verifique se o código informado já não está cadastrado.");
  }
};

// 3. DELETE - Remover registro
const deletarCid = async (id) => {
  if (confirm("Tem certeza que deseja remover este CID definitivamente do catálogo?")) {
    try {
      await api.delete(`cid/api/${id}/`);
      buscarCids();
    } catch (error) {
      console.error("Erro ao deletar registro do Django:", error);
    }
  }
};

const prepararEdicao = (cid) => {
  form.value = { ...cid };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelarEdicao = () => {
  form.value = estadoInicialForm();
};

// Filtro computado combinando código e descrição (idêntico ao Q do Django)
const cidsFiltrados = computed(() => {
  if (!termoBusca.value) {
    return cids.value;
  }
  const termo = termoBusca.value.toLowerCase();
  return cids.value.filter(cid => {
    const codigo = cid.cod_cid.toLowerCase();
    const desc = cid.descricao.toLowerCase();
    return codigo.includes(termo) || desc.includes(termo);
  });
});

const limparBusca = () => {
  termoBusca.value = '';
};

onMounted(() => {
  buscarCids();
});
</script>

<style scoped>
.cid-view { padding: 20px; font-family: sans-serif; }
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