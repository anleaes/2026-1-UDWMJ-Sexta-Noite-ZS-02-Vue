<template>
  <div class="atestado-card-container">
    <div class="form-secao">
      <h3>{{ modeloAtestado.id ? 'Atualizar Dados do Atestado' : 'Emitir Novo Atestado Médico' }}</h3>
      
      <form @submit.prevent="submeterFormulario">
        <div class="form-grupo">
          <div class="campo-seletor">
            <label>Consulta de Origem:</label>
            <select v-model="modeloAtestado.consulta" required>
              <option value="" disabled selected>Selecione a Consulta vinculada...</option>
              <option v-for="c in listaConsultas" :key="c.id" :value="c.id">
                Consulta #{{ c.id }} | Paciente: {{ obterTextoConsulta(c) }}
              </option>
            </select>
          </div>

          <div class="campo-seletor">
            <label>Tipo de Atestado:</label>
            <select v-model="modeloAtestado.tipo_atestado" required>
              <option value="MEDICO">Médico</option>
              <option value="ODONTO">Odontológico</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>
        </div>

        <hr class="form-divisor" />

        <div class="form-grupo">
          <input v-model="modeloAtestado.codigo_autenticacao" placeholder="Código de Autenticação Único" required />
          
          <div class="campo-seletor">
            <label>Início do Afastamento:</label>
            <input v-model="modeloAtestado.data_inicio_afastamento" type="date" required />
          </div>

          <input v-model.number="modeloAtestado.quantidade_dias" type="number" min="1" placeholder="Quantidade de Dias" required />
        </div>

        <hr class="form-divisor" />

        <div class="campo-seletor">
          <label>CIDs Vinculados (Segure Ctrl no teclado para selecionar mais de um):</label>
          <select v-model="modeloAtestado.cid" multiple class="seletor-multiplo" required>
            <option v-for="item in listaCids" :key="item.id" :value="item.id">
              {{ item.cod_cid }} - {{ item.descricao }}
            </option>
          </select>
          <small class="ajuda-texto">* CIDs atualmente selecionados: {{ modeloAtestado.cid?.length || 0 }}</small>
        </div>

        <div class="form-botoes">
          <button type="submit" class="btn-salvar">
            {{ modeloAtestado.id ? 'Salvar Alterações' : 'Emitir Atestado' }}
          </button>
          <button v-if="modeloAtestado.id" type="button" @click="cancelarAcao" class="btn-cancelar">
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
  listaCids: {
    type: Array,
    required: true
  },
  obterNomePaciente: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'salvar', 'cancelar']);

const modeloAtestado = computed({
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
.atestado-card-container { width: 100%; }
.form-secao { background: #f4f6f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
form { display: flex; flex-direction: column; gap: 12px; max-width: 700px; }
.form-grupo { display: flex; gap: 10px; align-items: flex-end; }
.form-grupo input, .form-grupo select { flex: 1; }
.campo-seletor { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.campo-seletor label { font-size: 12px; color: #666; font-weight: bold; }
form select, form input { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; background-color: #fff; font-family: sans-serif; }
form select:focus, form input:focus { border-color: #2196f3; outline: none; }
.seletor-multiplo { min-height: 90px; padding: 5px !important; }
.ajuda-texto { font-size: 11px; color: #7f8c8d; font-style: italic; margin-top: 2px; }
.form-divisor { border: 0; border-top: 1px dashed #ccc; margin: 5px 0; }
.form-botoes { display: flex; gap: 10px; margin-top: 5px; }
.btn-salvar { background: #2196f3; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-salvar:hover { background: #1e88e5; }
.btn-cancelar { background: #9e9e9e; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-cancelar:hover { background: #757575; }
</style>