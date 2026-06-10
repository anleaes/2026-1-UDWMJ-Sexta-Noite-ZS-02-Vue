<template>
  <div class="exame-item">
    <div class="info">
      <h4>
        {{ exame.nome_exame }}
        <span class="badge-jejum" :class="exame.exige_jejum ? 'com-jejum' : 'sem-jejum'">
          {{ exame.exige_jejum ? 'Exige Jejum' : 'Sem Jejum' }}
        </span>
      </h4>
      <p class="meta-dados">
        <strong>Paciente:</strong> {{ nomePaciente }} | 
        <strong>Médico Solicitante:</strong> {{ nomeMedico }}
      </p>
      <div class="bloco-detalhes">
        <p><strong>Descrição:</strong> {{ exame.descricao }}</p>
        <p class="preparo-texto"><strong>Preparo Exigido:</strong> {{ exame.preparo }}</p>
      </div>
    </div>
    <div class="acoes">
      <button @click="$emit('editar', exame)" class="btn-edit">Editar</button>
      <button @click="$emit('deletar', exame.id)" class="btn-delete">Excluir</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  exame: {
    type: Object,
    required: true
  },
  nomePaciente: {
    type: String,
    default: 'Carregando...'
  },
  nomeMedico: {
    type: String,
    default: 'Carregando...'
  }
});

defineEmits(['editar', 'deletar']);
</script>

<style scoped>
.exame-item { border: 1px solid #e0e0e0; padding: 16px; margin-bottom: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 5px solid #2196f3; }
.info h4 { margin: 0 0 6px 0; color: #2c3e50; font-size: 18px; display: flex; align-items: center; gap: 10px; }
.badge-jejum { font-size: 11px; padding: 2px 6px; border-radius: 12px; font-weight: bold; color: white; }
.badge-jejum.com-jejum { background-color: #f39c12; }
.badge-jejum.sem-jejum { background-color: #95a5a6; }
.info p { margin: 4px 0; color: #555; font-size: 14px; }
.meta-dados { color: #1e88e5 !important; font-weight: 500; }
.bloco-detalhes { margin-top: 8px; background: #fdfdfd; padding: 6px 10px; border-radius: 4px; border: 1px solid #f0f0f0; }
.preparo-texto { font-style: italic; color: #e67e22 !important; }
.acoes button { margin-left: 8px; padding: 8px 16px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold; }
.btn-edit { background-color: #f39c12; color: #fff; }
.btn-edit:hover { background-color: #e67e22; }
.btn-delete { background-color: #c0392b; color: #fff; }
.btn-delete:hover { background-color: #a62c20; }
</style>