<template>
  <div class="medicamento-item">
    <div class="info">
      <h4>
        {{ medicamento.nome_referencia }}
        <span class="badge-status controlado" v-if="medicamento.e_controlado">
          Controlado
        </span>
      </h4>
      <p class="meta-dados"><strong>Princípio Ativo:</strong> {{ medicamento.principio_ativo }}</p>
      <p><strong>Categoria:</strong> {{ medicamento.categoria }}</p>
      <p class="generico-texto">
        <strong>Genérico Equivalente:</strong> {{ medicamento.tem_generico ? 'Disponível' : 'Não disponível' }}
      </p>
    </div>
    <div class="acoes">
      <button @click="$emit('editar', medicamento)" class="btn-edit">Editar</button>
      <button @click="$emit('deletar', medicamento.id)" class="btn-delete">Excluir</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  medicamento: {
    type: Object,
    required: true
  }
});

defineEmits(['editar', 'deletar']);
</script>

<style scoped>
.medicamento-item { border: 1px solid #e0e0e0; padding: 16px; margin-bottom: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 5px solid #2196f3; }
.info h4 { margin: 0 0 6px 0; color: #2c3e50; font-size: 18px; display: flex; align-items: center; gap: 10px; }
.badge-status { font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: bold; color: white; }
.badge-status.controlado { background-color: #f39c12; } /* Laranja para alertar, mantendo a harmonia */
.info p { margin: 4px 0; color: #555; font-size: 14px; }
.meta-dados { color: #1e88e5 !important; font-weight: 500; }
.generico-texto { font-style: italic; color: #7f8c8d; }
.acoes button { margin-left: 8px; padding: 8px 16px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold; }
.btn-edit { background-color: #f39c12; color: #fff; }
.btn-edit:hover { background-color: #e67e22; }
.btn-delete { background-color: #c0392b; color: #fff; }
.btn-delete:hover { background-color: #a62c20; }
</style>