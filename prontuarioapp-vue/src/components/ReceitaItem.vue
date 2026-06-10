<template>
  <div class="receita-item">
    <div class="info">
      <h4>
        Receita Médica #{{ receita.id }}
        <span class="badge-tipo" :class="{ 'digital': receita.e_digital }">
          {{ receita.e_digital ? 'Assinatura Digital' : 'Impressa' }}
        </span>
      </h4>
      <p class="meta-dados">
        <strong>Paciente:</strong> {{ nomePaciente }} | 
        <strong>Médico:</strong> {{ nomeMedico }}
      </p>
      <p class="datas-linha">
        <strong>Emissão:</strong> {{ formatarData(receita.data_emissao) }} | 
        <strong>Validade até:</strong> {{ formatarData(receita.validade) }}
      </p>
      
      <div class="medicamentos-prescritos-bloco">
        <h5>Medicamentos Prescritos e Posologia:</h5>
        <div v-if="medsDaReceita?.length > 0" class="linhas-prescricao">
          <div v-for="(m, i) in medsDaReceita" :key="i" class="item-prescrito-linha">
            <span class="nome-remedio-tag">{{ m.nome_referencia }}</span>
            <span class="posologia-detalhe">
              {{ m.concentracao }} — {{ m.dose }} — {{ m.frequencia }} por {{ m.duracao_dias }} dias.
            </span>
          </div>
        </div>
        <span v-else class="sem-med">Nenhum medicamento com posologia vinculado</span>
      </div>

      <div v-if="receita.instrucoes" class="bloco-instrucoes">
        <strong>Instruções Gerais:</strong>
        <p>{{ receita.instrucoes }}</p>
      </div>
    </div>
    
    <div class="acoes">
      <button @click="$emit('editar', receita)" class="btn-edit">Editar</button>
      <button @click="$emit('deletar', receita.id)" class="btn-delete">Excluir</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  receita: {
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
  medsDaReceita: {
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
</script>

<style scoped>
.receita-item { border: 1px solid #e0e0e0; padding: 18px; margin-bottom: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 5px solid #2196f3; }
.info h4 { margin: 0 0 6px 0; color: #2c3e50; font-size: 18px; display: flex; align-items: center; gap: 10px; }
.badge-tipo { font-size: 11px; padding: 2px 8px; background-color: #e0e0e0; color: #555; border-radius: 4px; font-weight: bold; }
.badge-tipo.digital { background-color: #e3f2fd; color: #1e88e5; border: 1px solid #bbdefb; }
.info p { margin: 4px 0; color: #555; font-size: 14px; }
.meta-dados { color: #1e88e5 !important; font-weight: 500; }
.datas-linha { font-size: 13px; color: #666!important; }

/* Bloco da tabela intermediária */
.medicamentos-prescritos-bloco { margin-top: 12px; background: #fafafa; padding: 10px; border-radius: 6px; border: 1px solid #eaeaea; }
.medicamentos-prescritos-bloco h5 { margin: 0 0 8px 0; color: #34495e; font-size: 14px; }
.linhas-prescricao { display: flex; flex-direction: column; gap: 6px; }
.item-prescrito-linha { font-size: 13px; display: flex; align-items: center; gap: 8px; }
.nome-remedio-tag { background: #1e88e5; color: white; font-weight: bold; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
.posologia-detalhe { color: #444; font-style: italic; }
.sem-med { font-style: italic; color: #999; font-size: 13px; }

.bloco-instrucoes { margin-top: 10px; background: #f8f9fa; padding: 8px 12px; border-radius: 4px; border-left: 3px solid #b0bec5; font-size: 13px; }
.bloco-instrucoes p { margin: 4px 0 0 0; color: #333; }

.acoes button { margin-left: 8px; padding: 8px 16px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold; }
.btn-edit { background-color: #f39c12; color: #fff; }
.btn-edit:hover { background-color: #e67e22; }
.btn-delete { background-color: #c0392b; color: #fff; }
.btn-delete:hover { background-color: #a62c20; }
</style>