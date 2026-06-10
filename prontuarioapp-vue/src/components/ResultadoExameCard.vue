<template>
  <div class="resultado-card-container">
    <div class="form-secao">
      <h3>{{ modeloResultado.id ? 'Atualizar Laudo de Resultado' : 'Lançar Resultado de Exame' }}</h3>
      
      <form @submit.prevent="submeterFormulario">
        <div class="campo-seletor">
          <label>Exame Solicitado Relacionado:</label>
          <select v-model="modeloResultado.exame_solicitado" required>
            <option value="" disabled selected>Selecione o pedido de exame correspondente...</option>
            <option v-for="e in listaExames" :key="e.id" :value="e.id">
              ID #{{ e.id }} — Exame: {{ e.nome_exame }} (Ref. Consulta #{{ e.consulta }})
            </option>
          </select>
        </div>

        <hr class="form-divisor" />

        <div class="form-grupo">
          <div class="campo-seletor">
            <label>Data do Resultado:</label>
            <input v-model="modeloResultado.data_resultado" type="date" required />
          </div>

          <div class="campo-seletor">
            <label>Valor Encontrado:</label>
            <input v-model.number="modeloResultado.valor" type="number" step="0.01" placeholder="Ex: 12.5" required />
          </div>

          <div class="campo-seletor">
            <label>Unidade de Medida:</label>
            <input v-model="modeloResultado.unidade_medida" placeholder="Ex: mg/dL, g/L, mm" required />
          </div>
        </div>

        <hr class="form-divisor" />

        <div class="campo-textarea">
          <label>Conclusões do Laudo / Observações Clínicas:</label>
          <textarea v-model="modeloResultado.conclusoes" rows="3" placeholder="Insira o parecer laboratorial ou conclusões sobre o resultado encontrado..." required></textarea>
        </div>

        <div class="form-botoes">
          <button type="submit" class="btn-salvar">
            {{ modeloResultado.id ? 'Salvar Alterações' : 'Lançar Laudo' }}
          </button>
          <button v-if="modeloResultado.id" type="button" @click="cancelarAcao" class="btn-cancelar">
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
  listaExames: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'salvar', 'cancelar']);

const modeloResultado = computed({
  get: () => props.modelValue,
  set: (valoresAtualizados) => emit('update:modelValue', valoresAtualizados)
});

const submeterFormulario = () => {
  emit('salvar');
};

const cancelarAcao = () => {
  emit('cancelar');
};
</script>

<style scoped>
.resultado-card-container { width: 100%; }
.form-secao { background: #f4f6f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
form { display: flex; flex-direction: column; gap: 12px; max-width: 700px; }
.form-grupo { display: flex; gap: 10px; }
.form-grupo input { flex: 1; }
.campo-seletor { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.campo-seletor label, .campo-textarea label { font-size: 12px; color: #666; font-weight: bold; }
form select, form input, form textarea { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; background-color: #fff; font-family: sans-serif; }
form select:focus, form input:focus, form textarea:focus { border-color: #2196f3; outline: none; }
.campo-textarea { display: flex; flex-direction: column; gap: 4px; width: 100%; }
form textarea { resize: vertical; }
.form-divisor { border: 0; border-top: 1px dashed #ccc; margin: 5px 0; }
.form-botoes { display: flex; gap: 10px; margin-top: 5px; }
.btn-salvar { background: #2196f3; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-salvar:hover { background: #1e88e5; }
.btn-cancelar { background: #9e9e9e; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-cancelar:hover { background: #757575; }
</style>