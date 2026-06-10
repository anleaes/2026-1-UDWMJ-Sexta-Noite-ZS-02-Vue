<template>
  <q-card class="my-card q-mb-md" bordered>
    <q-card-section>
      <div class="text-h6">
        Paciente: {{ nomePaciente }}
        <span class="text-body2 text-grey-8">| Dr(a). {{ nomeMedico }}</span>
      </div>
      <div class="text-primary text-weight-medium q-mt-xs">
        <strong>Horário:</strong> {{ formatarDataHora(consulta.data_agendada) }}
      </div>
      <p class="q-mb-xs"><strong>Motivo:</strong> {{ consulta.motivo }}</p>
      <p class="q-mb-none">
        <strong>Status:</strong> {{ traduzirStatus(consulta.status) }} |
        <strong>Prioridade:</strong> {{ traduzirPrioridade(consulta.nivel_prioridade) }}
      </p>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat color="warning" label="Editar" icon="edit" @click="$emit('editar', consulta)" />
      <q-btn flat color="negative" label="Excluir" icon="delete" @click="$emit('deletar', consulta.id)" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
defineProps({
  consulta: { type: Object, required: true },
  nomePaciente: { type: String, default: 'Carregando paciente...' },
  nomeMedico: { type: String, default: 'Carregando médico...' }
})
defineEmits(['editar', 'deletar'])

const formatarDataHora = (dataStr) => {
  if (!dataStr) return ''
  return new Date(dataStr).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

const traduzirStatus = (st) => ({ AG: 'Agendada', RE: 'Realizada', CA: 'Cancelada' }[st] || st)
const traduzirPrioridade = (pr) => ({ B: 'Baixa', N: 'Normal', A: 'Alta', U: 'Urgência' }[pr] || pr)
</script>
