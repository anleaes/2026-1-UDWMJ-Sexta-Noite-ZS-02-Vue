<template>
  <div class="receita-card-container">
    <div class="form-secao">
      <h3>{{ modeloReceita.id ? 'Atualizar Dados da Receita' : 'Emitir Nova Receita Médica' }}</h3>
      
      <form @submit.prevent="submeterFormulario">
        <div class="campo-seletor">
          <label>Consulta de Origem:</label>
          <select v-model="modeloReceita.consulta" :disabled="modeloReceita.id ? true : false" required>
            <option value="" disabled selected>Selecione a Consulta...</option>
            <option v-for="c in listaConsultas" :key="c.id" :value="c.id">
              Consulta #{{ c.id }} | Paciente: {{ obterTextoConsulta(c) }}
            </option>
          </select>
        </div>

        <hr class="form-divisor" />

        <div class="form-grupo">
          <div class="campo-seletor">
            <label>Data de Emissão:</label>
            <input v-model="modeloReceita.data_emissao" type="date" required />
          </div>

          <div class="campo-seletor">
            <label>Validade da Receita:</label>
            <input v-model="modeloReceita.validade" type="date" required />
          </div>

          <div class="campo-checkbox">
            <label>
              <input v-model="modeloReceita.e_digital" type="checkbox" /> Receita Digital
            </label>
          </div>
        </div>

        <hr class="form-divisor" />

        <div class="secao-medicamentos-tabela">
          <h4>Medicamentos e Posologia</h4>
          
          <div v-if="!modeloReceita.id" class="barra-inclusao-med">
            <select v-model="medicamentoSelecionado">
              <option value="" disabled selected>Escolha um medicamento para adicionar...</option>
              <option v-for="med in listaMedicamentos" :key="med.id" :value="med">
                {{ med.nome_referencia }} ({{ med.principio_ativo }})
              </option>
            </select>
            <button type="button" @click="adicionarMedicamentoNaLista" class="btn-adicionar-med">
              + Adicionar
            </button>
          </div>

          <table class="tabela-prescricao" v-if="modeloReceita.itensMedicamentos?.length > 0">
            <thead>
              <tr>
                <th>Medicamento</th>
                <th>Concentração</th>
                <th>Dose</th>
                <th>Frequência</th>
                <th>Duração (Dias)</th>
                <th v-if="!modeloReceita.id">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in modeloReceita.itensMedicamentos" :key="index">
                <td class="nome-med-col"><strong>{{ item.nome_referencia }}</strong></td>
                <td>
                  <input v-model="item.concentracao" placeholder="Ex: 500mg" required />
                </td>
                <td>
                  <input v-model="item.dose" placeholder="Ex: 1 comp." required />
                </td>
                <td>
                  <input v-model="item.frequencia" placeholder="Ex: 8h em 8h" required />
                </td>
                <td>
                  <input v-model.number="item.duracao_dias" type="number" min="1" placeholder="Dias" required class="input-dias" />
                </td>
                <td v-if="!modeloReceita.id">
                  <button type="button" @click="removerMedicamentoDaLista(index)" class="btn-remover-linha">Remover</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="aviso-vazio">Nenhum medicamento adicionado a esta receita ainda.</p>
        </div>

        <hr class="form-divisor" />

        <div class="campo-textarea">
          <label>Instruções Gerais de Uso (Opcional):</label>
          <textarea v-model="modeloReceita.instrucoes" rows="2" placeholder="Observações gerais do prontuário..."></textarea>
        </div>

        <div class="form-botoes">
          <button type="submit" class="btn-salvar">
            {{ modeloReceita.id ? 'Salvar Alterações' : 'Emitir Receita' }}
          </button>
          <button type="button" @click="cancelarAcao" class="btn-cancelar">
            {{ modeloReceita.id ? 'Cancelar' : 'Limpar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  listaConsultas: {
    type: Array,
    required: true
  },
  listaMedicamentos: {
    type: Array,
    required: true
  },
  obterNomePaciente: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'salvar', 'cancelar']);

const modeloReceita = computed({
  get: () => props.modelValue,
  set: (valoresAtualizados) => emit('update:modelValue', valoresAtualizados)
});

const medicamentoSelecionado = ref('');

// Insere o medicamento na tabela interna simulando a tabela intermediária do Django
const adicionarMedicamentoNaLista = () => {
  if (!medicamentoSelecionado.value) return;
  
  // Valida se o remédio já foi colocado para evitar unique_together crash
  const jaExiste = modeloReceita.value.itensMedicamentos.some(
    m => m.medicamento === medicamentoSelecionado.value.id
  );
  
  if (jaExiste) {
    alert("Este medicamento já foi adicionado a esta receita.");
    return;
  }

  modeloReceita.value.itensMedicamentos.push({
    medicamento: medicamentoSelecionado.value.id,
    nome_referencia: medicamentoSelecionado.value.name_referencia || medicamentoSelecionado.value.nome_referencia,
    concentracao: '',
    dose: '',
    frequencia: '',
    duracao_dias: ''
  });

  medicamentoSelecionado.value = '';
};

const removerMedicamentoDaLista = (index) => {
  modeloReceita.value.itensMedicamentos.splice(index, 1);
};

const submeterFormulario = () => {
  if (modeloReceita.value.itensMedicamentos.length === 0) {
    alert("Adicione pelo menos um medicamento com posologia para emitir a receita.");
    return;
  }
  emit('salvar');
};

const cancelarAcao = () => {
  emit('cancelar');
};

const obterTextoConsulta = (consulta) => {
  const nomePac = props.obterNomePaciente(consulta.paciente);
  const dataForm = new Date(consulta.data_agendada).toLocaleDateString('pt-BR');
  return `${nomePac} (${dataForm})`;
};
</script>

<style scoped>
.receita-card-container { width: 100%; }
.form-secao { background: #f4f6f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
form { display: flex; flex-direction: column; gap: 12px; max-width: 850px; }
.form-grupo { display: flex; gap: 15px; align-items: flex-end; }
.campo-seletor { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.campo-seletor label, .campo-textarea label { font-size: 12px; color: #666; font-weight: bold; }
form select, form input, form textarea { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; background-color: #fff; font-family: sans-serif; }
form select:focus, form input:focus, form textarea:focus { border-color: #2196f3; outline: none; }
.campo-checkbox { display: flex; align-items: center; padding-bottom: 12px; }
.campo-checkbox label { font-size: 14px; font-weight: bold; color: #333; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.campo-textarea { display: flex; flex-direction: column; gap: 4px; width: 100%; }
form textarea { resize: vertical; }
.form-divisor { border: 0; border-top: 1px dashed #ccc; margin: 5px 0; }

/* Estilização da tabela de medicamentos */
.secao-medicamentos-tabela { background: #fff; padding: 15px; border-radius: 6px; border: 1px solid #e0e0e0; margin: 5px 0; }
.secao-medicamentos-tabela h4 { margin: 0 0 12px 0; color: #2c3e50; }
.barra-inclusao-med { display: flex; gap: 10px; margin-bottom: 15px; }
.barra-inclusao-med select { flex: 1; }
.btn-adicionar-med { background: #2196f3; color: white; border: none; padding: 0 20px; border-radius: 4px; font-weight: bold; cursor: pointer; }
.btn-adicionar-med:hover { background: #1e88e5; }
.tabela-prescricao { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
.tabela-prescricao th { background: #f8f9fa; color: #333; text-align: left; padding: 8px; border-bottom: 2px solid #e0e0e0; font-weight: bold; }
.tabela-prescricao td { padding: 6px 8px; border-bottom: 1px solid #eee; vertical-align: middle; }
.tabela-prescricao input { padding: 6px !important; font-size: 13px !important; width: 100%; box-sizing: border-box; }
.input-dias { text-align: center; }
.nome-med-col { color: #1e88e5; }
.btn-remover-linha { background: #c0392b; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: bold; }
.btn-remover-linha:hover { background: #a62c20; }
.aviso-vazio { font-style: italic; color: #888; font-size: 14px; margin: 10px 0; text-align: center; }

.form-botoes { display: flex; gap: 10px; margin-top: 5px; }
.btn-salvar { background: #2196f3; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-salvar:hover { background: #1e88e5; }
.btn-cancelar { background: #9e9e9e; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-cancelar:hover { background: #757575; }
</style>