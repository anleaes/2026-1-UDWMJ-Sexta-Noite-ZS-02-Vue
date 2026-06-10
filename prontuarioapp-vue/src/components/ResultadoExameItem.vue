<template>
  <div class="resultado-item">
    <div class="info">
      <h4>
        Laudo: {{ nomeExame }}
        <span class="metrica-destaque">
          {{ resultado.valor }} {{ resultado.unidade_medida }}
        </span>
      </h4>
      <p class="meta-dados"><strong>Data do Laudo:</strong> {{ formatarData(resultado.data_resultado) }}</p>
      
      <div class="bloco-laudo">
        <strong>Conclusões Clínicas:</strong>
        <p>{{ resultado.conclusoes }}</p>
      </div>
    </div>
    
    <div class="acoes">
      <button @click="$emit('editar', resultado)" class="btn-edit">Editar</button>
      <button @click="$emit('deletar', resultado.id)" class="btn-delete">Excluir</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  resultado: {
    type: Object,
    required: true
  },
  nomeExame: {
    type: String,
    default: 'Carregando exame...'
  }
});

defineEmits(['editar', 'deletar']);

const formatarData = (dataStr) => {
  if (!dataStr) return '';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
};
</script>

<style scoped>
.resultado-item { border: 1px solid #e0e0e0; padding: 16px; margin-bottom: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 5px solid #2196f3; }
.info h4 { margin: 0 0 6px 0; color: #2c3e50; font-size: 18px; display: flex; align-items: center; gap: 12px; }
.metrica-destaque { background-color: #e3f2fd; color: #1e88e5; border: 1px solid #bbdefb; font-size: 13px; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
.info p { margin: 4px 0; color: #555; font-size: 14px; }
.meta-dados { color: #1e88e5 !important; font-weight: 500; }
.bloco-laudo { margin-top: 10px; background: #f8f9fa; padding: 8px 12px; border-radius: 4px; border-left: 3px solid #1e88e5; font-size: 13px; }
.bloco-laudo strong { color: #34495e; }
.bloco-laudo p { margin: 4px 0 0 0; color: #444; line-height: 1.4; }
.acoes button { margin-left: 8px; padding: 8px 16px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold; }
.btn-edit { background-color: #f39c12; color: #fff; }
.btn-edit:hover { background-color: #e67e22; }
.btn-delete { background-color: #c0392b; color: #fff; }
.btn-delete:hover { background-color: #a62c20; }
</style>