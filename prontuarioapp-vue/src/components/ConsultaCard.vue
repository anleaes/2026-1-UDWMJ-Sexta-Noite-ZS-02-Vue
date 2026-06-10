<template>
  <div class="consulta-card-container">
    <div class="form-secao">
      <h3>{{ modeloConsulta.id ? 'Atualizar Dados da Consulta' : 'Agendar Nova Consulta' }}</h3>
      
      <form @submit.prevent="submeterFormulario">
        <div class="form-grupo">
          <div class="campo-seletor">
            <label>Paciente:</label>
            <select v-model="modeloConsulta.paciente" required>
              <option value="" disabled selected>Selecione o Paciente...</option>
              <option v-for="p in listaPacientes" :key="p.id" :value="p.id">
                {{ p.nome }} {{ p.sobrenome }} (CPF: {{ formatarCPF(p.cpf) }})
              </option>
            </select>
          </div>
          
          <div class="campo-seletor">
            <label>Médico Responsável:</label>
            <select v-model="modeloConsulta.medico" required>
              <option value="" disabled selected>Selecione o Médico...</option>
              <option v-for="m in listaMedicos" :key="m.id" :value="m.id">
                Dr(a). {{ m.nome }} {{ m.sobrenome }} (CRM: {{ m.crm }})
              </option>
            </select>
          </div>
        </div>
        
        <hr class="form-divisor" />
        
        <div class="form-grupo">
          <div class="campo-seletor">
            <label>Data e Hora Agendada:</label>
            <input v-model="modeloConsulta.data_agendada" type="datetime-local" required />
          </div>

          <div class="campo-seletor">
            <label>Status:</label>
            <select v-model="modeloConsulta.status" required>
              <option value="AG">Agendada</option>
              <option value="RE">Realizada</option>
              <option value="CA">Cancelada</option>
            </select>
          </div>

          <div class="campo-seletor">
            <label>Nível de Prioridade:</label>
            <select v-model="modeloConsulta.nivel_prioridade" required>
              <option value="B">Baixa</option>
              <option value="N">Normal</option>
              <option value="A">Alta</option>
              <option value="U">Urgência</option>
            </select>
          </div>
        </div>

        <hr class="form-divisor" />
        
        <div class="campo-textarea">
          <label>Motivo da Consulta:</label>
          <textarea v-model="modeloConsulta.motivo" rows="3" placeholder="Descreva os sintomas iniciais ou motivo do agendamento..." required></textarea>
        </div>

        <div class="form-botoes">
          <button type="submit" class="btn-salvar">
            {{ modeloConsulta.id ? 'Salvar Alterações' : 'Agendar Consulta' }}
          </button>
          <button v-if="modeloConsulta.id" type="button" @click="cancelarAcao" class="btn-cancelar">
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

const modeloConsulta = computed({
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
.consulta-card-container { width: 100%; }
.form-secao { background: #f4f6f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
form { display: flex; flex-direction: column; gap: 12px; max-width: 600px; }
.form-grupo { display: flex; gap: 10px; }
.campo-seletor { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.campo-seletor label, .campo-textarea label { font-size: 12px; color: #666; font-weight: bold; }
form select, form textarea, form input { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; background-color: #fff; font-family: sans-serif; }
form select:focus, form textarea:focus, form input:focus { border-color: #2196f3; outline: none; }
.campo-textarea { display: flex; flex-direction: column; gap: 4px; width: 100%; }
form textarea { resize: vertical; }
.form-divisor { border: 0; border-top: 1px dashed #ccc; margin: 5px 0; }
.form-botoes { display: flex; gap: 10px; margin-top: 5px; }
.btn-salvar { background: #2196f3; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-salvar:hover { background: #1e88e5; }
.btn-cancelar { background: #9e9e9e; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-cancelar:hover { background: #757575; }
</style>