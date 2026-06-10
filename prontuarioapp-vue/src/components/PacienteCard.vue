<template>
  <div class="paciente-card-container">
    <div class="form-secao">
      <h3>{{ modeloPaciente.id ? 'Atualizar Dados do Paciente' : 'Cadastrar Novo Paciente' }}</h3>
      
      <form @submit.prevent="submeterFormulario">
        <div class="form-grupo">
          <input v-model="modeloPaciente.nome" placeholder="Nome" required />
          <input v-model="modeloPaciente.sobrenome" placeholder="Sobrenome" required />
        </div>
        
        <div class="form-grupo">
          <input v-model="modeloPaciente.cpf" placeholder="CPF (somente números)" maxlength="11" required />
          <input v-model="modeloPaciente.telefone" placeholder="Telefone celular" required />
        </div>
        
        <input v-model="modeloPaciente.email" type="email" placeholder="E-mail" required />
        
        <hr class="form-divisor" />
        
        <div class="form-grupo">
          <div class="campo-data">
            <label>Data de Nascimento:</label>
            <input v-model="modeloPaciente.data_nascimento" type="date" required />
          </div>
        </div>

        <div class="form-grupo">
          <input v-model.number="modeloPaciente.peso" type="number" step="0.1" placeholder="Peso (kg)" required />
          <input v-model.number="modeloPaciente.altura" type="number" step="0.01" placeholder="Altura (m)" required />
        </div>

        <input v-model="modeloPaciente.endereco" placeholder="Endereço Completo" required />

        <div class="form-botoes">
          <button type="submit" class="btn-salvar">
            {{ modeloPaciente.id ? 'Salvar Alterações' : 'Cadastrar' }}
          </button>
          <button v-if="modeloPaciente.id" type="button" @click="cancelarAcao" class="btn-cancelar">
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

const modeloPaciente = computed({
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
.paciente-card-container { width: 100%; }
.form-secao { background: #f4f6f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
form { display: flex; flex-direction: column; gap: 12px; max-width: 600px; }
.form-grupo { display: flex; gap: 10px; }
.form-grupo input { flex: 1; }
form input { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; background-color: #fff; }
form input:focus { border-color: #2196f3; outline: none; }
.form-divisor { border: 0; border-top: 1px dashed #ccc; margin: 5px 0; }
.campo-data { display: flex; flex-direction: column; gap: 4px; width: 100%; }
.campo-data label { font-size: 12px; color: #666; font-weight: bold; }
.form-botoes { display: flex; gap: 10px; margin-top: 5px; }
.btn-salvar { background: #2196f3; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-salvar:hover { background: #1e88e5; }
.btn-cancelar { background: #9e9e9e; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-cancelar:hover { background: #757575; }
</style>