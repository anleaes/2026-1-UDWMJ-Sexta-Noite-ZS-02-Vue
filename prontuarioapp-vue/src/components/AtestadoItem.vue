<template>
  <q-card class="my-card q-mb-md" bordered>
    <q-card-section>
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">Atestado {{ atestado.codigo_autenticacao }}</div>
        <q-badge color="grey-3" text-color="dark">Tipo: {{ traduzirTipo(atestado.tipo_atestado) }}</q-badge>
      </div>
      <div class="text-primary text-weight-medium q-mt-xs">
        <strong>Paciente:</strong> {{ nomePaciente }} |
        <strong>Médico Emissor:</strong> {{ nomeMedico }}
      </div>
      <p class="q-mb-sm">
        <strong>Período de Afastamento:</strong> {{ formatarData(atestado.data_inicio_afastamento) }}
        por <strong>{{ atestado.quantidade_dias }} dias</strong>
      </p>

      <div class="row items-center q-gutter-sm">
        <strong>CIDs Associados:</strong>
        <q-chip v-for="c in cidsDoAtestado" :key="c.id" color="primary" text-color="white" dense>
          {{ c.cod_cid }}
          <q-tooltip>{{ c.descricao }}</q-tooltip>
        </q-chip>
        <span v-if="cidsDoAtestado.length === 0" class="text-grey-6 text-italic">Nenhum CID anexado</span>
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat color="warning" label="Editar" icon="edit" @click="$emit('editar', atestado)" />
      <q-btn flat color="negative" label="Excluir" icon="delete" @click="$emit('deletar', atestado.id)" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
defineProps({
  atestado: { type: Object, required: true },
  nomePaciente: { type: String, default: 'Carregando...' },
  nomeMedico: { type: String, default: 'Carregando...' },
  cidsDoAtestado: { type: Array, default: () => [] }
})
defineEmits(['editar', 'deletar'])

const formatarData = (dataStr) => {
  if (!dataStr) return ''
  const [ano, mes, dia] = dataStr.split('-')
  return `${dia}/${mes}/${ano}`
}

const traduzirTipo = (tipo) => ({ MEDICO: 'Médico', ODONTO: 'Odontológico', OUTRO: 'Outro' }[tipo] || tipo)
</script>
