<template>
  <div class="exame-card-container">
    <div class="form-secao">
      <h3>{{ modeloExame.id ? 'Atualizar Solicitação de Exame' : 'Solicitar Novo Exame' }}</h3>
      
      <form @submit.prevent="submeterFormulario">
        <div class="campo-seletor">
          <label>Consulta de Origem:</label>
          <select v-model="modeloExame.consulta" required>
            <option value="" disabled selected>Selecione a Consulta...</option>
            <option v-for="c in listaConsultas" :key="c.id" :value="c.id">
              Consulta #{{ c.id }} | Paciente: {{ obterTextoConsulta(c) }}
            </option>
          </select>
        </div>

        <hr class="form-divisor" />

        <input v-model="modeloExame.nome_exame" placeholder="Nome do Exame (Ex: Hemograma Completo, Raio-X de Tórax)" required />

        <div class="campo-textarea">
          <label>Descrição / Objetivo do Exame:</label>
          <textarea v-model="modeloExame.descricao" rows="2" placeholder="Descreva brevemente a indicação clínica do exame..." required></textarea>
        </div>

        <div class="campo-textarea">
          <label>Instruções de Preparo do Paciente:</label>
          <textarea v-model="modeloExame.preparo" rows="2" placeholder="Instruções como repouso, suspensão de medicamentos, etc..." required></textarea>
        </div>

        <div class="campo-checkbox">
          <label>
            <input v-model="modeloExame.exige_jejum" type="checkbox" /> Exige Jejum Obrigatório
          </label>
        </div>

        <div class="form-botoes">
          <button type="submit" class="btn-salvar">
            {{ modeloExame.id ? 'Salvar Alterações' : 'Registrar Solicitação' }}
          </button>
          <button v-if="modeloExame.id" type="button" @click="cancelarAcao" class="btn-cancelar">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  listaConsultas: {
    type: Array,
    required: true
  },
  obterNomePaciente: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'salvar', 'cancelar']);

const modeloExame = computed({
  get: () => props.modelValue,
  set: (valoresAtualizados) => emit('update:modelValue', valoresAtualizados)
});

const submeterFormulario = () => {
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
.exame-card-container { width: 100%; }
.form-secao { background: #f4f6f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
form { display: flex; flex-direction: column; gap: 12px; max-width: 600px; }
.campo-seletor { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.campo-seletor label, .campo-textarea label { font-size: 12px; color: #666; font-weight: bold; }
form select, form input, form textarea { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; background-color: #fff; font-family: sans-serif; }
form select:focus, form input:focus, form textarea:focus { border-color: #2196f3; outline: none; }
.campo-textarea { display: flex; flex-direction: column; gap: 4px; width: 100%; }
form textarea { resize: vertical; }
.campo-checkbox { display: flex; align-items: center; margin: 5px 0; }
.campo-checkbox label { font-size: 14px; font-weight: bold; color: #333; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.form-divisor { border: 0; border-top: 1px dashed #ccc; margin: 5px 0; }
.form-botoes { display: flex; gap: 10px; margin-top: 5px; }
.btn-salvar { background: #2196f3; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-salvar:hover { background: #1e88e5; }
.btn-cancelar { background: #9e9e9e; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-cancelar:hover { background: #757575; }
</style>