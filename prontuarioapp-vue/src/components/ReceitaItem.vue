<template>
  <q-card class="my-card q-mb-md" bordered>
    <q-card-section>
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">Receita Médica #{{ receita.id }}</div>
        <q-badge :color="receita.e_digital ? 'info' : 'grey'">
          {{ receita.e_digital ? 'Assinatura Digital' : 'Impressa' }}
        </q-badge>
      </div>
      <div class="text-primary text-weight-medium q-mt-xs">
        <strong>Paciente:</strong> {{ nomePaciente }} |
        <strong>Médico:</strong> {{ nomeMedico }}
      </div>
      <p class="text-grey-7 q-mb-sm">
        <strong>Emissão:</strong> {{ formatarData(receita.data_emissao) }} |
        <strong>Validade até:</strong> {{ formatarData(receita.validade) }}
      </p>

      <q-card-section class="q-pa-sm bg-grey-1 rounded-borders">
        <div class="text-subtitle2 q-mb-sm">Medicamentos Prescritos e Posologia:</div>
        <div v-if="medsDaReceita?.length > 0" class="q-gutter-y-xs">
          <div v-for="(m, i) in medsDaReceita" :key="i" class="row items-center q-gutter-sm">
            <q-chip color="primary" text-color="white" dense>{{ m.nome_referencia }}</q-chip>
            <span class="text-grey-8 text-italic">
              {{ m.concentracao }} — {{ m.dose }} — {{ m.frequencia }} por {{ m.duracao_dias }} dias.
            </span>
          </div>
        </div>
        <span v-else class="text-grey-6 text-italic">Nenhum medicamento com posologia vinculado</span>
      </q-card-section>

      <div v-if="receita.instrucoes" class="q-mt-sm q-pa-sm bg-grey-2 rounded-borders">
        <strong>Instruções Gerais:</strong>
        <p class="q-mb-none">{{ receita.instrucoes }}</p>
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat color="warning" label="Editar" icon="edit" @click="$emit('editar', receita)" />
      <q-btn flat color="negative" label="Excluir" icon="delete" @click="$emit('deletar', receita.id)" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
defineProps({
  receita: { type: Object, required: true },
  nomePaciente: { type: String, default: 'Carregando...' },
  nomeMedico: { type: String, default: 'Carregando...' },
  medsDaReceita: { type: Array, default: () => [] }
})
defineEmits(['editar', 'deletar'])

const formatarData = (dataStr) => {
  if (!dataStr) return ''
  const [ano, mes, dia] = dataStr.split('-')
  return `${dia}/${mes}/${ano}`
}
</script>
