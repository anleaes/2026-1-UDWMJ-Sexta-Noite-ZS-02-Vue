<template>
  <div class="anamnese-item">
    <div class="info">
      <h4>
        Paciente: {{ nomePaciente }}
        <span class="meta-data-topo">| Dr(a). {{ nomeMedico }}</span>
      </h4>
      <p class="data-registro"><strong>Data do Registro:</strong> {{ formatarDataHora(anamnese.data_criacao) }}</p>
      
      <div class="bloco-clinico">
        <p><strong>Queixa Principal:</strong> {{ anamnese.queixa_principal }}</p>
        <p><strong>Alergias:</strong> <span class="destaque-alergia">{{ anamnese.alergias }}</span></p>
        <p><strong>Medicamentos em Uso:</strong> {{ anamnese.medicamentos }}</p>
      </div>

      <div class="bloco-habitos">
        <span class="badge-habito">
          <strong>Álcool:</strong> {{ traduzirChoices(anamnese.alcool) }}
        </span>
        <span class="badge-habito">
          <strong>Fumante:</strong> {{ traduzirChoices(anamnese.fumante) }}
        </span>
      </div>
    </div>
    
    <div class="acoes">
      <button @click="$emit('editar', anamnese)" class="btn-edit">Editar</button>
      <button @click="$emit('deletar', anamnese.id)" class="btn-delete">Excluir</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  anamnese: {
    type: Object,
    required: true
  },
  nomePaciente: {
    type: String,
    default: 'Carregando paciente...'
  },
  nomeMedico: {
    type: String,
    default: 'Carregando médico...'
  }
});

defineEmits(['editar', 'deletar']);

const formatarDataHora = (dataStr) => {
  if (!dataStr) return '';
  const data = new Date(dataStr);
  return data.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
};

const traduzirChoices = (opcao) => {
  const m = {
    'NAO': 'Não consome',
    'EVE': 'Eventual',
    'DIA': 'Diário'
  };
  return m[opcao] || opcao;
};
</script>

<style scoped>
.anamnese-item { border: 1px solid #e0e0e0; padding: 18px; margin-bottom: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 5px solid #2196f3; }
.info h4 { margin: 0 0 4px 0; color: #2c3e50; font-size: 17px; }
.meta-data-topo { color: #555; font-weight: normal; font-size: 15px; margin-left: 5px; }
.data-registro { margin: 0 0 12px 0; font-size: 12px; color: #7f8c8d; font-style: italic; }
.bloco-clinico p { margin: 6px 0; color: #444; font-size: 14px; line-height: 1.4; }
.destaque-alergia { color: #c0392b; font-weight: bold; }
.bloco-habitos { margin-top: 12px; display: flex; gap: 10px; }
.badge-habito { background: #eef2f7; color: #34495e; padding: 4px 10px; border-radius: 4px; font-size: 12px; border: 1px solid #d6e0ea; }
.acoes button { margin-left: 8px; padding: 8px 16px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold; }
.btn-edit { background-color: #f39c12; color: #fff; }
.btn-edit:hover { background-color: #e67e22; }
.btn-delete { background-color: #c0392b; color: #fff; }
.btn-delete:hover { background-color: #a62c20; }
</style>