<template>
  <div class="atestado-item">
    <div class="info">
      <h4>
        Atestado {{ atestado.codigo_autenticacao }}
        <span class="badge-tipo">Tipo: {{ traduzirTipo(atestado.tipo_atestado) }}</span>
      </h4>
      <p class="meta-dados">
        <strong>Paciente:</strong> {{ nomePaciente }} | 
        <strong>Médico Emissor:</strong> {{ nomeMedico }}
      </p>
      <p>
        <strong>Período de Afastamento:</strong> {{ formatarData(atestado.data_inicio_afastamento) }} 
        por <strong>{{ atestado.quantidade_dias }} dias</strong>
      </p>
      
      <div class="cids-container">
        <strong>CIDs Associados:</strong>
        <div class="tags-grupo">
          <span v-for="c in cidsDoAtestado" :key="c.id" class="tag-cid" :title="c.descricao">
            {{ c.cod_cid }}
          </span>
          <span v-if="cidsDoAtestado.length === 0" class="sem-cid">Nenhum CID anexado</span>
        </div>
      </div>
    </div>
    
    <div class="acoes">
      <button @click="$emit('editar', atestado)" class="btn-edit">Editar</button>
      <button @click="$emit('deletar', atestado.id)" class="btn-delete">Excluir</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  atestado: {
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
  },
  cidsDoAtestado: {
    type: Array,
    default: () => []
  }
});

defineEmits(['editar', 'deletar']);

const formatarData = (dataStr) => {
  if (!dataStr) return '';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
};

const traduzirTipo = (tipo) => {
  const m = { 'MEDICO': 'Médico', 'ODONTO': 'Odontológico', 'OUTRO': 'Outro' };
  return m[tipo] || tipo;
};
</script>

<style scoped>
.atestado-item { border: 1px solid #e0e0e0; padding: 16px; margin-bottom: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 5px solid #2196f3; }
.info h4 { margin: 0 0 6px 0; color: #2c3e50; font-size: 18px; display: flex; align-items: center; gap: 10px; }
.badge-tipo { font-size: 11px; padding: 2px 8px; background-color: #eef2f7; border: 1px solid #d6e0ea; color: #34495e; border-radius: 4px; font-weight: bold; }
.info p { margin: 4px 0; color: #555; font-size: 14px; }
.meta-dados { color: #1e88e5 !important; font-weight: 500; }
.cids-container { margin-top: 8px; display: flex; align-items: center; gap: 8px; font-size: 13px; }
.tags-grupo { display: flex; gap: 6px; flex-wrap: wrap; }
.tag-cid { background-color: #2196f3; color: white; font-weight: bold; font-size: 11px; padding: 2px 6px; border-radius: 3px; cursor: help; }
.sem-cid { font-style: italic; color: #999; }
.acoes button { margin-left: 8px; padding: 8px 16px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold; }
.btn-edit { background-color: #f39c12; color: #fff; }
.btn-edit:hover { background-color: #e67e22; }
.btn-delete { background-color: #c0392b; color: #fff; }
.btn-delete:hover { background-color: #a62c20; }
</style>