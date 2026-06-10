<template>
  <div class="cid-item" :class="{ 'inativo': !cid.status_ativo }">
    <div class="info">
      <h4>
        <span class="codigo-destaque">{{ cid.cod_cid }}</span> - {{ cid.descricao }}
        <span class="badge-status" :class="cid.status_ativo ? 'ativo' : 'inativo'">
          {{ cid.status_ativo ? 'Ativo' : 'Inativo' }}
        </span>
      </h4>
      <p class="meta-dados"><strong>Categoria/Tipo:</strong> {{ cid.tipo }}</p>
      <p class="sintomas-texto"><strong>Sintomas Relacionados:</strong> {{ cid.sintomas }}</p>
    </div>
    <div class="acoes">
      <button @click="$emit('editar', cid)" class="btn-edit">Editar</button>
      <button @click="$emit('deletar', cid.id)" class="btn-delete">Excluir</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  cid: {
    type: Object,
    required: true
  }
});

defineEmits(['editar', 'deletar']);
</script>

<style scoped>
.cid-item { border: 1px solid #e0e0e0; padding: 16px; margin-bottom: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 5px solid #2196f3; }
.cid-item.inativo { border-left-color: #9e9e9e; background-color: #fafafa; opacity: 0.8; }
.info h4 { margin: 0 0 6px 0; color: #2c3e50; font-size: 18px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.codigo-destaque { color: #1e88e5; font-weight: bold; }
.badge-status { font-size: 11px; padding: 2px 6px; border-radius: 12px; font-weight: bold; color: white; }
.badge-status.ativo { background-color: #4caf50; }
.badge-status.inativo { background-color: #9e9e9e; }
.info p { margin: 4px 0; color: #555; font-size: 14px; }
.meta-dados { color: #1e88e5 !important; font-weight: 500; }
.sintomas-texto { font-style: italic; color: #666; line-height: 1.4; }
.acoes button { margin-left: 8px; padding: 8px 16px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold; }
.btn-edit { background-color: #f39c12; color: #fff; }
.btn-edit:hover { background-color: #e67e22; }
.btn-delete { background-color: #c0392b; color: #fff; }
.btn-delete:hover { background-color: #a62c20; }
</style>