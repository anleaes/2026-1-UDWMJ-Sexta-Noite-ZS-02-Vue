<template>
  <div class="cid-card-container">
    <div class="form-secao">
      <h3>{{ modeloCid.id ? 'Atualizar CID' : 'Cadastrar Novo CID' }}</h3>
      
      <form @submit.prevent="submeterFormulario">
        <div class="form-grupo">
          <input v-model="modeloCid.cod_cid" placeholder="Código CID (Ex: I10, E11)" required />
          <input v-model="modeloCid.tipo" placeholder="Tipo/Categoria da Doença" required />
        </div>
        
        <input v-model="modeloCid.descricao" placeholder="Descrição/Nome da Patologia" required />
        
        <div class="campo-textarea">
          <label>Sintomas Comuns:</label>
          <textarea v-model="modeloCid.sintomas" rows="3" placeholder="Descreva os sintomas associados a este CID..." required></textarea>
        </div>

        <div class="campo-checkbox">
          <label>
            <input v-model="modeloCid.status_ativo" type="checkbox" /> CID Ativo para Uso
          </label>
        </div>

        <div class="form-botoes">
          <button type="submit" class="btn-salvar">
            {{ modeloCid.id ? 'Salvar Alterações' : 'Cadastrar' }}
          </button>
          <button v-if="modeloCid.id" type="button" @click="cancelarAcao" class="btn-cancelar">
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

const modeloCid = computed({
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
.cid-card-container { width: 100%; }
.form-secao { background: #f4f6f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
form { display: flex; flex-direction: column; gap: 12px; max-width: 600px; }
.form-grupo { display: flex; gap: 10px; }
.form-grupo input { flex: 1; }
form input, form textarea { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; background-color: #fff; font-family: sans-serif; }
form input:focus, form textarea:focus { border-color: #2196f3; outline: none; }
.campo-textarea { display: flex; flex-direction: column; gap: 4px; width: 100%; }
.campo-textarea label { font-size: 12px; color: #666; font-weight: bold; }
form textarea { resize: vertical; }
.campo-checkbox { display: flex; align-items: center; margin: 5px 0; }
.campo-checkbox label { font-size: 14px; font-weight: bold; color: #333; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.form-botoes { display: flex; gap: 10px; margin-top: 5px; }
.btn-salvar { background: #2196f3; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-salvar:hover { background: #1e88e5; }
.btn-cancelar { background: #9e9e9e; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
.btn-cancelar:hover { background: #757575; }
</style>