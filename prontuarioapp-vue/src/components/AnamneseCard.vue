<template>
  <div class="anamnese-card-container">
    <div class="form-secao">
      <h3>{{ modeloAnamnese.id ? 'Atualizar Dados da Anamnese' : 'Registrar Nova Anamnese' }}</h3>
      
      <form @submit.prevent="submeterFormulario">
        <div class="form-grupo">
          <div class="campo-seletor">
            <label>Paciente:</label>
            <select v-model="modeloAnamnese.paciente" required>
              <option value="" disabled selected>Selecione o Paciente...</option>
              <option v-for="p in listaPacientes" :key="p.id" :value="p.id">
                {{ p.nome }} {{ p.sobrenome }} (CPF: {{ formatarCPF(p.cpf) }})
              </option>
            </select>
          </div>
          
          <div class="campo-seletor">
            <label>Médico Responsável:</label>
            <select v-model="modeloAnamnese.medico" required>
              <option value="" disabled selected>Selecione o Médico...</option>
              <option v-for="m in listaMedicos" :key="m.id" :value="m.id">
                Dr(a). {{ m.nome }} {{ m.sobrenome }} (CRM: {{ m.crm }})
              </option>
            </select>
          </div>
        </div>
        
        <hr class="form-divisor" />
        
        <div class="campo-textarea">
          <label>Queixa Principal:</label>
          <textarea v-model="modeloAnamnese.queixa_principal" rows="3" placeholder="Relato detalhado dos sintomas..." required></textarea>
        </div>

        <div class="campo-textarea">
          <label>Alergias Conocidas:</label>
          <textarea v-model="modeloAnamnese.alergias" rows="2" placeholder="Descreva alergias a medicamentos, alimentos ou substâncias..." required></textarea>
        </div>

        <div class="campo-textarea">
          <label>Medicamentos em Uso:</label>
          <textarea v-model="modeloAnamnese.medicamentos" rows="2" placeholder="Listar nomes, dosagens e frequências atuais..." required></textarea>
        </div>

        <hr class="form-divisor" />

        <div class="form-grupo">
          <div class="campo-seletor">
            <label>Consumo de Álcool:</label>
            <select v-model="modeloAnamnese.alcool" required>
              <option value="NAO">Não consome</option>
              <option value="EVE">Eventual</option>
              <option value="DIA">Diário</option>
            </select>
          </div>

          <div class="campo-seletor">
            <label>Fumante:</label>
            <select v-model="modeloAnamnese.fumante" required>
              <option value="NAO">Não consome</option>
              <option value="EVE">Eventual</option>
              <option value="DIA">Diário</option>
            </select>
          </div>
        </div>

        <div class="form-botoes">
          <button type="submit" class="btn-salvar">
            {{ modeloAnamnese.id ? 'Salvar Alterações' : 'Gravar Anamnese' }}
          </button>
          <button v-if="modeloAnamnese.id" type="button" @click="cancelarAcao" class="btn-cancelar">
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
  listaPacientes: {
    type: Array,
    required: true
  },
  listaMedicos: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'salvar', 'cancelar']);

const modeloAnamnese = computed({
  get: () => props.modelValue,
  set: (valoresAtualizados) => emit('update:modelValue', valoresAtualizados)
});

const submeterFormulario = () => {
  emit('salvar');
};

const cancelarAcao = () => {
  emit('cancelar');
};

const formatarCPF = (cpf) => {
  if (!cpf || cpf.length !== 11) return cpf;
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};
</script>

<style scoped>
.anamnese-card-container { width: 100%; }
.form-secao { background: #f4f6f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
form { display: flex; flex-direction: column; gap: 12px; max-width: 700px; }
.form-grupo { display: flex; gap: 15px; }
.campo-seletor { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.campo-seletor label, .campo-textarea label { font-size: 12px; color: #666; font-weight: bold; }
form select, form textarea { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; background-color: #fff; font-family: sans-serif; }
form select:focus, form textarea:focus { border-color: #2196f3; outline: none; }
.campo-textarea { display: flex; flex-direction: column; gap: 4px; width: 100%; }
form textarea { resize: vertical; }
.form-divisor { border: 0; border-top: 1px dashed #ccc; margin: 5px 0; }
.form-botoes { display: flex; gap: 10px; margin-top: 5px; }
.btn-salvar { background: #2196f3; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-salvar:hover { background: #1e88e5; }
.btn-cancelar { background: #9e9e9e; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-cancelar:hover { background: #757575; }
</style>