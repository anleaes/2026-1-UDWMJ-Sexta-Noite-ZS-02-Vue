<template>
  <div class="medicamento-view">
    <h1>Farmácia - Catálogo de Medicamentos</h1>

    <MedicamentoCard 
      v-model="form" 
      @salvar="salvarMedicamento" 
      @cancelar="cancelarEdicao" 
    />

    <hr />

    <div class="busca-container">
      <h3>Buscar no Catálogo</h3>
      <div class="busca-input-grupo">
        <input 
          v-model="termoBusca" 
          placeholder="Buscar por nome de referência ou princípio ativo..." 
          class="input-busca"
        />
        <button v-if="termoBusca" @click="limparBusca" class="btn-limpar-busca">Limpar</button>
      </div>
    </div>

    <div class="lista-secao">
      <h3>Medicamentos Cadastrados</h3>
      <div v-if="carregando">Buscando registros no servidor Django...</div>
      <div v-else>
        <p v-if="medicamentosFiltrados.length === 0">Nenhum medicamento encontrado na base de dados.</p>
        
        <MedicamentoItem 
          v-for="medicamento in medicamentosFiltrados" 
          :key="medicamento.id" 
          :medicamento="medicamento"
          @editar="prepararEdicao"
          @deletar="deletarMedicamento"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api.js';
import MedicamentoCard from '../components/MedicamentoCard.vue';
import MedicamentoItem from '../components/MedicamentoItem.vue';

const medicamentos = ref([]);
const carregando = ref(true);
const termoBusca = ref('');

const estadoInicialForm = () => ({
  id: null,
  nome_referencia: '',
  principio_ativo: '',
  categoria: '',
  e_controlado: false,
  tem_generico: true
});

const form = ref(estadoInicialForm());

// 1. GET - Listar Medicamentos
const buscarMedicamentos = async () => {
  carregando.value = true;
  try {
    const response = await api.get('medicamento/api/');
    medicamentos.value = response.data;
  } catch (error) {
    console.error("Erro ao carregar medicamentos do Django:", error);
  } finally {
    carregando.value = false;
  }
};

// 2. POST / PATCH - Criar ou Editar Medicamento
const salvarMedicamento = async () => {
  try {
    if (form.value.id) {
      await api.patch(`medicamento/api/${form.value.id}/`, form.value);
      alert("Medicamento atualizado com sucesso!");
    } else {
      await api.post('medicamento/api/', form.value);
      alert("Medicamento cadastrado com sucesso!");
    }
    form.value = estadoInicialForm();
    buscarMedicamentos();
  } catch (error) {
    console.error("Erro ao salvar medicamento no Django:", error.response?.data || error);
    alert("Falha ao salvar. Verifique os campos preenchidos.");
  }
};

// 3. DELETE - Remover registro com tratamento de erro nativo do Vue (PROTECT do Django)
const deletarMedicamento = async (id) => {
  if (confirm("Tem certeza que deseja remover este medicamento definitivamente do catálogo?")) {
    try {
      await api.delete(`medicamento/api/${id}/`);
      alert("Medicamento excluído com sucesso!");
      buscarMedicamentos(); // Atualiza a lista caso o banco tenha permitido a remoção
    } catch (error) {
      console.error("Erro ao tentar deletar do Django:", error);
      
      // Captura o erro do banco (normalmente status 400 ou 500 dependendo da configuração da API)
      if (error.response) {
        alert("Não é possível excluir este medicamento. Motivo: Ele possui dependências de histórico clínico (está vinculado a uma ou mais receitas ativas).");
      } else {
        alert("Falha na comunicação com a API. Verifique a sua conexão.");
      }
    }
  }
};

const prepararEdicao = (medicamento) => {
  form.value = { ...medicamento };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelarEdicao = () => {
  form.value = estadoInicialForm();
};

// Filtro computado combinando nome de referência e princípio ativo (idêntico ao Q do Django)
const medicamentosFiltrados = computed(() => {
  if (!termoBusca.value) {
    return medicamentos.value;
  }
  const termo = termoBusca.value.toLowerCase();
  return medicamentos.value.filter(med => {
    const ref = med.nome_referencia.toLowerCase();
    const ativo = med.principio_ativo.toLowerCase();
    return ref.includes(termo) || ativo.includes(termo);
  });
});

const limparBusca = () => {
  termoBusca.value = '';
};

onMounted(() => {
  buscarMedicamentos();
});
</script>

<style scoped>
.medicamento-view { padding: 20px; font-family: sans-serif; }
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