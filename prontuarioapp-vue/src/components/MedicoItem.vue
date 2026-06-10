<template>
  <q-card class="my-card q-mb-md" bordered :class="{ 'opacity-80': !medico.esta_ativo }">
    <q-card-section>
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">Dr(a). {{ medico.nome }} {{ medico.sobrenome }}</div>
        <q-badge :color="medico.esta_ativo ? 'positive' : 'grey'">
          {{ medico.esta_ativo ? 'Ativo' : 'Inativo' }}
        </q-badge>
      </div>
      <div class="text-primary text-weight-medium q-mt-xs">
        <strong>CRM:</strong> {{ medico.crm }} |
        <strong>Especialidade:</strong> {{ medico.especialidade }}
      </div>
      <p class="q-mb-xs"><strong>Matrícula:</strong> {{ medico.matricula }} | <strong>Cargo:</strong> {{ medico.cargo }}</p>
      <p class="q-mb-xs"><strong>Contato:</strong> {{ medico.telefone }} | <strong>E-mail:</strong> {{ medico.email }}</p>
      <p class="text-grey-7 text-italic q-mb-none"><strong>Contratação:</strong> {{ formatarData(medico.data_contratacao) }}</p>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat color="warning" label="Editar" icon="edit" @click="$emit('editar', medico)" />
      <q-btn flat color="negative" label="Excluir" icon="delete" @click="$emit('deletar', medico.id)" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
defineProps({ medico: { type: Object, required: true } })
defineEmits(['editar', 'deletar'])

const formatarData = (dataStr) => {
  if (!dataStr) return ''
  const [ano, mes, dia] = dataStr.split('-')
  return `${dia}/${mes}/${ano}`
}
</script>
