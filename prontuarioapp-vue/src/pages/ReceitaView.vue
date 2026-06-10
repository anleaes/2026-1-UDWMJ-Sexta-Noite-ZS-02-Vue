<template>
  <div class="receita-view">
    <h1>Emissão e Controle de Receitas</h1>

    <ReceitaCard 
      v-model="form" 
      :listaConsultas="consultas"
      :listaMedicamentos="medicamentos"
      :obterNomePaciente="obterNomePacientePorId"
      @salvar="salvarReceita"
      @cancelar="cancelarEdicao" 
    />

    <hr />

    <div class="busca-container">
      <h3>Buscar Receitas Emitidas</h3>
      <div class="busca-input-grupo">
        <input 
          v-model="termoBusca" 
          placeholder="Buscar por paciente, médico ou instruções..." 
          class="input-busca"
        />
        <button v-if="termoBusca" @click="limparBusca" class="btn-limpar-busca">Limpar</button>
      </div>
    </div>

    <div class="lista-secao">
      <h3>Histórico de Prescrições</h3>
      <div v-if="carregando">Buscando receitas no servidor Django...</div>
      <div v-else>
        <p v-if="receitasFiltrados.length === 0">Nenhuma receita localizada no sistema.</p>
        
        <ReceitaItem 
          v-for="receita in receitasFiltrados" 
          :key="receita.id" 
          :receita="receita"
          :nomePaciente="obterNomePacientePorConsulta(receita.consulta)"
          :nomeMedico="obterNomeMedicoPorConsulta(receita.consulta)"
          :medsDaReceita="obterMedsPosologiaDaReceita(receita.id)"
          @editar="prepararEdicao"
          @deletar="deletarReceita"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api.js';
import ReceitaCard from '../components/ReceitaCard.vue';
import ReceitaItem from '../components/ReceitaItem.vue';

const receitas = ref([]);
const consultas = ref([]);
const pacientes = ref([]);
const medicos = ref([]);
const medicamentos = ref([]);
const intermediariosReceitaMed = ref([]); 
const carregando = ref(true);
const termoBusca = ref('');

const estadoInicialForm = () => ({
  id: null,
  consulta: '',
  data_emissao: '',
  validade: '',
  instrucoes: '',
  e_digital: true,
  itensMedicamentos: [] 
});

const form = ref(estadoInicialForm());

const carregarDadosDoSistema = async () => {
  carregando.value = true;
  try {
    // Função auxiliar para carregar cada API individualmente de forma segura
    const carregarTabela = async (url) => {
      try {
        const res = await api.get(url);
        return res.data;
      } catch (err) {
        console.warn(`Aviso: Rota [${url}] não respondeu corretamente. Retornando dados vazios.`);
        return [];
      }
    };

    // Puxa as tabelas base (as 5 que já funcionavam antes)
    receitas.value = await carregarTabela('receita/api/');
    consultas.value = await carregarTabela('consulta/api/');
    pacientes.value = await carregarTabela('paciente/api/');
    medicos.value = await carregarTabela('medico/api/');
    medicamentos.value = await carregarTabela('medicamento/api/');
    
    // Tenta puxar a intermediária de duas formas comuns (com e sem maiúscula) para não travar a tela
    let dadosIntermediarios = await carregarTabela('receitamedicamento/api/');
    if (dadosIntermediarios.length === 0) {
      dadosIntermediarios = await carregarTabela('receitaMedicamento/api/');
    }
    intermediariosReceitaMed.value = dadosIntermediarios;

  } catch (error) {
    console.error("Erro geral no carregamento:", error);
  } finally {
    carregando.value = false;
  }
};

const salvarReceita = async () => {
  try {
    const payloadBase = {
      consulta: form.value.consulta,
      data_emissao: form.value.data_emissao,
      validade: form.value.validade,
      instrucoes: form.value.instrucoes,
      e_digital: form.value.e_digital
    };

    if (form.value.id) {
      await api.patch(`receita/api/${form.value.id}/`, payloadBase);
      alert("Receita atualizada com sucesso!");
    } else {
      // 1. Salva a receita pai
      const resNovaReceita = await api.post('receita/api/', payloadBase);
      const idReceitaGerada = resNovaReceita.data.id;

      // 2. Tenta salvar os medicamentos na tabela através dos endpoints possíveis
      const listaPromises = form.value.itensMedicamentos.map(item => {
        const dadosLinha = {
          receita: idReceitaGerada,
          medicamento: item.medicamento,
          concentracao: item.concentracao,
          dose: item.dose,
          frequencia: item.frequencia,
          duracao_dias: item.duracao_dias
        };
        
        // Tenta enviar para a rota padrão
        return api.post('receitamedicamento/api/', dadosLinha).catch(() => {
          // Se falhar (por conta de maiúscula), tenta a outra variação
          return api.post('receitaMedicamento/api/', dadosLinha);
        });
      });

      await Promise.all(listaPromises);
      alert("Receita emitida com sucesso!");
    }
    
    form.value = estadoInicialForm();
    carregarDadosDoSistema();
  } catch (error) {
    console.error("Erro ao salvar receita:", error);
    alert("Falha ao salvar. Verifique os campos preenchidos.");
  }
};

const deletarReceita = async (id) => {
  if (confirm("Tem certeza que deseja deletar esta receita?")) {
    try {
      await api.delete(`receita/api/${id}/`);
      carregarDadosDoSistema();
    } catch (error) {
      console.error("Erro ao deletar registro:", error);
    }
  }
};

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

const obterMedsPosologiaDaReceita = (idReceita) => {
  const relacoes = intermediariosReceitaMed.value.filter(r => r.receita === idReceita);
  return relacoes.map(r => {
    const medInfo = medicamentos.value.find(m => m.id === r.medicamento);
    return {
      ...r,
      nome_referencia: medInfo ? medInfo.nome_referencia : 'Medicamento'
    };
  });
};

const prepararEdicao = (receita) => {
  const copia = { ...receita };
  copia.itensMedicamentos = obterMedsPosologiaDaReceita(receita.id);
  form.value = copia;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelarEdicao = () => {
  form.value = estadoInicialForm();
};

const receitasFiltrados = computed(() => {
  if (!termoBusca.value) {
    return receitas.value;
  }
  const termo = termoBusca.value.toLowerCase();
  return receitas.value.filter(r => {
    const pNome = obterNomePacientePorConsulta(r.consulta).toLowerCase();
    const mNome = obterNomeMedicoPorConsulta(r.consulta).toLowerCase();
    return pNome.includes(termo) || mNome.includes(termo);
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
.receita-view { padding: 20px; font-family: sans-serif; }
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