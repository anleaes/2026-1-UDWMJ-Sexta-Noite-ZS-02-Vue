<template>
  <div class="medicamento-card-container">
    <div class="form-secao">
      <h3>{{ modeloMedicamento.id ? 'Atualizar Medicamento' : 'Cadastrar Novo Medicamento' }}</h3>
      
      <form @submit.prevent="submeterFormulario">
        <div class="form-grupo">
          <input v-model="modeloMedicamento.nome_referencia" placeholder="Nome de Referência (Ex: Novalgina)" required />
          <input v-model="modeloMedicamento.principio_ativo" placeholder="Princípio Ativo (Ex: Dipirona)" required />
        </div>
        
        <input v-model="modeloMedicamento.categoria" placeholder="Categoria Farmacêutica (Ex: Analgésico, Antibiótico)" required />
        
        <hr class="form-divisor" />

        <div class="form-grupo checkboxes">
          <div class="campo-checkbox">
            <label>
              <input v-model="modeloMedicamento.e_controlado" type="checkbox" /> 
              <span>Medicamento Controlado (Retenção de Receita)</span>
            </label>
          </div>

          <div class="campo-checkbox">
            <label>
              <input v-model="modeloMedicamento.tem_generico" type="checkbox" /> 
              <span>Possui Equivalente Genérico</span>
            </label>
          </div>
        </div>

        <div class="form-botoes">
          <button type="submit" class="btn-salvar">
            {{ modeloMedicamento.id ? 'Salvar Alterações' : 'Cadastrar' }}
          </button>
          <button v-if="modeloMedicamento.id" type="button" @click="cancelarAcao" class="btn-cancelar">
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
  }
});

const emit = defineEmits(['update:modelValue', 'salvar', 'cancelar']);

const modeloMedicamento = computed({
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
.medicamento-card-container { width: 100%; }
.form-secao { background: #f4f6f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
form { display: flex; flex-direction: column; gap: 12px; max-width: 600px; }
.form-grupo { display: flex; gap: 10px; }
.form-grupo input { flex: 1; }
form input { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; background-color: #fff; font-family: sans-serif; }
form input:focus { border-color: #2196f3; outline: none; }
.form-divisor { border: 0; border-top: 1px dashed #ccc; margin: 5px 0; }
.checkboxes { flex-direction: column; gap: 8px; }
.campo-checkbox { display: flex; align-items: center; }
.campo-checkbox label { font-size: 14px; font-weight: bold; color: #333; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.form-botoes { display: flex; gap: 10px; margin-top: 5px; }
.btn-salvar { background: #2196f3; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-salvar:hover { background: #1e88e5; }
.btn-cancelar { background: #9e9e9e; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-cancelar:hover { background: #757575; }
</style>