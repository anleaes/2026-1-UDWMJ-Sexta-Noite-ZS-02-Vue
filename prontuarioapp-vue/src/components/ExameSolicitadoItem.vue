<template>
  <q-card class="my-card q-mb-md" bordered>
    <q-card-section>
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">{{ exame.nome_exame }}</div>
        <q-badge :color="exame.exige_jejum ? 'warning' : 'grey'">
          {{ exame.exige_jejum ? 'Exige Jejum' : 'Sem Jejum' }}
        </q-badge>
      </div>
      <div class="text-primary text-weight-medium q-mt-xs">
        <strong>Paciente:</strong> {{ nomePaciente }} |
        <strong>Médico Solicitante:</strong> {{ nomeMedico }}
      </div>

      <q-card-section class="q-pa-sm bg-grey-1 rounded-borders q-mt-sm">
        <p class="q-mb-xs"><strong>Descrição:</strong> {{ exame.descricao }}</p>
        <p class="text-orange-9 text-italic q-mb-none"><strong>Preparo Exigido:</strong> {{ exame.preparo }}</p>
      </q-card-section>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat color="warning" label="Editar" icon="edit" @click="$emit('editar', exame)" />
      <q-btn flat color="negative" label="Excluir" icon="delete" @click="$emit('deletar', exame.id)" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
defineProps({
  exame: { type: Object, required: true },
  nomePaciente: { type: String, default: 'Carregando...' },
  nomeMedico: { type: String, default: 'Carregando...' }
})
defineEmits(['editar', 'deletar'])
</script>
