<template>
  <div class="medico-card-container">
    <div class="form-secao">
      <h3>{{ modeloMedico.id ? 'Atualizar Dados do Médico' : 'Cadastrar Novo Médico' }}</h3>
      
      <form @submit.prevent="submeterFormulario">
        <div class="form-grupo">
          <input v-model="modeloMedico.nome" placeholder="Nome" required />
          <input v-model="modeloMedico.sobrenome" placeholder="Sobrenome" required />
        </div>
        
        <div class="form-grupo">
          <input v-model="modeloMedico.cpf" placeholder="CPF (somente números)" maxlength="11" required />
          <input v-model="modeloMedico.telefone" placeholder="Telefone celular" required />
        </div>
        
        <input v-model="modeloMedico.email" type="email" placeholder="E-mail" required />
        
        <hr class="form-divisor" />
        
        <div class="form-grupo">
          <input v-model="modeloMedico.crm" placeholder="CRM" required />
          <input v-model="modeloMedico.matricula" placeholder="Matrícula" required />
        </div>

        <div class="form-grupo">
          <input v-model="modeloMedico.especialidade" placeholder="Especialidade (ex: Clínico Geral)" required />
          <input v-model="modeloMedico.cargo" placeholder="Cargo" required />
        </div>

        <div class="form-grupo flex-alinhado">
          <div class="campo-data">
            <label>Data de Contratação:</label>
            <input v-model="modeloMedico.data_contratacao" type="date" required />
          </div>
          <div class="campo-checkbox">
            <label>
              <input v-model="modeloMedico.esta_ativo" type="checkbox" /> Médico Ativo
            </label>
          </div>
        </div>

        <div class="form-botoes">
          <button type="submit" class="btn-salvar">
            {{ modeloMedico.id ? 'Salvar Alterações' : 'Cadastrar' }}
          </button>
          <button v-if="modeloMedico.id" type="button" @click="cancelarAcao" class="btn-cancelar">
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

const modeloMedico = computed({
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
.medico-card-container { width: 100%; }
.form-secao { background: #f4f6f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
form { display: flex; flex-direction: column; gap: 12px; max-width: 600px; }
.form-grupo { display: flex; gap: 10px; }
.form-grupo input { flex: 1; }
form input[type="text"], form input[type="email"], form input[type="date"] { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; background-color: #fff; }
form input:focus { border-color: #2196f3; outline: none; }
.form-divisor { border: 0; border-top: 1px dashed #ccc; margin: 5px 0; }
.flex-alinhado { align-items: center; justify-content: space-between; }
.campo-data { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.campo-data label { font-size: 12px; color: #666; font-weight: bold; }
.campo-checkbox { padding-top: 15px; flex: 1; display: flex; justify-content: flex-end; }
.campo-checkbox label { font-size: 14px; font-weight: bold; color: #333; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.form-botoes { display: flex; gap: 10px; margin-top: 5px; }
.btn-salvar { background: #2196f3; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-salvar:hover { background: #1e88e5; }
.btn-cancelar { background: #9e9e9e; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-cancelar:hover { background: #757575; }
</style>