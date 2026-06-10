<template>
  <q-card class="my-card q-mb-md" bordered>
    <q-card-section>
      <div class="text-h6">
        Paciente: {{ nomePaciente }}
        <span class="text-body2 text-grey-8">| Dr(a). {{ nomeMedico }}</span>
      </div>
      <div class="text-caption text-grey-7 text-italic q-mb-sm">
        <strong>Data do Registro:</strong> {{ formatarDataHora(anamnese.data_criacao) }}
      </div>

      <q-card-section class="q-pa-sm bg-grey-1 rounded-borders">
        <p class="q-mb-xs"><strong>Queixa Principal:</strong> {{ anamnese.queixa_principal }}</p>
        <p class="q-mb-xs"><strong>Alergias:</strong> <span class="text-negative text-weight-bold">{{ anamnese.alergias }}</span></p>
        <p class="q-mb-none"><strong>Medicamentos em Uso:</strong> {{ anamnese.medicamentos }}</p>
      </q-card-section>

      <div class="row q-gutter-sm q-mt-sm">
        <q-badge color="grey-3" text-color="dark">
          <strong>Álcool:</strong> {{ traduzirChoices(anamnese.alcool) }}
        </q-badge>
        <q-badge color="grey-3" text-color="dark">
          <strong>Fumante:</strong> {{ traduzirChoices(anamnese.fumante) }}
        </q-badge>
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat color="warning" label="Editar" icon="edit" @click="$emit('editar', anamnese)" />
      <q-btn flat color="negative" label="Excluir" icon="delete" @click="$emit('deletar', anamnese.id)" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
defineProps({
  anamnese: { type: Object, required: true },
  nomePaciente: { type: String, default: 'Carregando paciente...' },
  nomeMedico: { type: String, default: 'Carregando médico...' }
})
defineEmits(['editar', 'deletar'])

const formatarDataHora = (dataStr) => {
  if (!dataStr) return ''
  return new Date(dataStr).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

const traduzirChoices = (opcao) => ({ NAO: 'Não consome', EVE: 'Eventual', DIA: 'Diário' }[opcao] || opcao)
</script>
