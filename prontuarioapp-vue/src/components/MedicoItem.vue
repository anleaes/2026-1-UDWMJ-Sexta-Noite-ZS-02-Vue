<template>
  <div class="medico-item" :class="{ 'inativo': !medico.esta_ativo }">
    <div class="info">
      <h4>
        Dr(a). {{ medico.nome }} {{ medico.sobrenome }}
        <span class="badge-status" :class="medico.esta_ativo ? 'ativo' : 'inativo'">
          {{ medico.esta_ativo ? 'Ativo' : 'Inativo' }}
        </span>
      </h4>
      <p class="meta-dados">
        <strong>CRM:</strong> {{ medico.crm }} | 
        <strong>Especialidade:</strong> {{ medico.especialidade }}
      </p>
      <p><strong>Matrícula:</strong> {{ medico.matricula }} | <strong>Cargo:</strong> {{ medico.cargo }}</p>
      <p><strong>Contato:</strong> {{ medico.telefone }} | <strong>E-mail:</strong> {{ medico.email }}</p>
      <p class="data-contrato"><strong>Contratação:</strong> {{ formatarData(medico.data_contratacao) }}</p>
    </div>
    <div class="acoes">
      <button @click="$emit('editar', medico)" class="btn-edit">Editar</button>
      <button @click="$emit('deletar', medico.id)" class="btn-delete">Excluir</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  medico: {
    type: Object,
    required: true
  }
});

defineEmits(['editar', 'deletar']);

// Converte a data do Django (AAAA-MM-DD) para o formato brasileiro (DD/MM/AAAA)
const formatarData = (dataStr) => {
  if (!dataStr) return '';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
};
</script>

<style scoped>
.medico-item { border: 1px solid #e0e0e0; padding: 16px; margin-bottom: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 5px solid #2196f3; }
.medico-item.inativo { border-left-color: #9e9e9e; background-color: #fafafa; opacity: 0.8; }
.info h4 { margin: 0 0 6px 0; color: #2c3e50; font-size: 18px; display: flex; align-items: center; gap: 10px; }
.badge-status { font-size: 11px; padding: 2px 6px; border-radius: 12px; font-weight: bold; color: white; }
.badge-status.ativo { background-color: #4caf50; }
.badge-status.inativo { background-color: #9e9e9e; }
.info p { margin: 4px 0; color: #555; font-size: 14px; }
.meta-dados { color: #1e88e5 !important; font-weight: 500; }
.data-contrato { font-style: italic; color: #7f8c8d !important; }
.acoes button { margin-left: 8px; padding: 8px 16px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold; }
.btn-edit { background-color: #f39c12; color: #fff; }
.btn-edit:hover { background-color: #e67e22; }
.btn-delete { background-color: #c0392b; color: #fff; }
.btn-delete:hover { background-color: #a62c20; }
</style>