<template>
  <q-card class="my-card q-mb-md" bordered>
    <q-card-section>
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">Laudo: {{ nomeExame }}</div>
        <q-badge color="info">{{ resultado.valor }} {{ resultado.unidade_medida }}</q-badge>
      </div>
      <div class="text-primary text-weight-medium q-mt-xs">
        <strong>Data do Laudo:</strong> {{ formatarData(resultado.data_resultado) }}
      </div>

      <q-card-section class="q-pa-sm bg-grey-1 rounded-borders q-mt-sm">
        <strong>Conclusões Clínicas:</strong>
        <p class="q-mb-none">{{ resultado.conclusoes }}</p>
      </q-card-section>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat color="warning" label="Editar" icon="edit" @click="$emit('editar', resultado)" />
      <q-btn flat color="negative" label="Excluir" icon="delete" @click="$emit('deletar', resultado.id)" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
defineProps({
  resultado: { type: Object, required: true },
  nomeExame: { type: String, default: 'Carregando exame...' }
})
defineEmits(['editar', 'deletar'])

const formatarData = (dataStr) => {
  if (!dataStr) return ''
  const [ano, mes, dia] = dataStr.split('-')
  return `${dia}/${mes}/${ano}`
}
</script>
