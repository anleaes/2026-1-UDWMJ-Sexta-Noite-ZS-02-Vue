<template>
  <div class="consulta-item">
    <div class="info">
      <h4>
        Paciente: {{ nomePaciente }}
        <span class="meta-data-topo">| Dr(a). {{ nomeMedico }}</span>
      </h4>
      <p class="meta-dados">
        <strong>Horário:</strong> {{ formatarDataHora(consulta.data_agendada) }}
      </p>
      <p><strong>Motivo:</strong> {{ consulta.motivo }}</p>
      <p>
        <strong>Status:</strong> {{ traduzirStatus(consulta.status) }} | 
        <strong>Prioridade:</strong> {{ traduzirPrioridade(consulta.nivel_prioridade) }}
      </p>
    </div>
    <div class="acoes">
      <button @click="$emit('editar', consulta)" class="btn-edit">Editar</button>
      <button @click="$emit('deletar', consulta.id)" class="btn-delete">Excluir</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  consulta: {
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
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
};

const traduzirStatus = (st) => {
  const m = { 'AG': 'Agendada', 'RE': 'Realizada', 'CA': 'Cancelada' };
  return m[st] || st;
};

const traduzirPrioridade = (pr) => {
  const m = { 'B': 'Baixa', 'N': 'Normal', 'A': 'Alta', 'U': 'Urgência' };
  return m[pr] || pr;
};
</script>

<style scoped>
.consulta-item { border: 1px solid #e0e0e0; padding: 16px; margin-bottom: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 5px solid #2196f3; }
.info h4 { margin: 0 0 6px 0; color: #2c3e50; font-size: 18px; }
.meta-data-topo { color: #555; font-weight: normal; font-size: 15px; margin-left: 5px; }
.info p { margin: 4px 0; color: #555; font-size: 14px; }
.meta-dados { color: #1e88e5 !important; font-weight: 500; }
.acoes button { margin-left: 8px; padding: 8px 16px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold; }
.btn-edit { background-color: #f39c12; color: #fff; }
.btn-edit:hover { background-color: #e67e22; }
.btn-delete { background-color: #c0392b; color: #fff; }
.btn-delete:hover { background-color: #a62c20; }
</style>