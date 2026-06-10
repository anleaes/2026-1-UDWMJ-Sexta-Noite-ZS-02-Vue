<template>
  <q-card class="my-card q-mb-md" bordered>
    <q-card-section>
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">{{ medicamento.nome_referencia }}</div>
        <q-badge v-if="medicamento.e_controlado" color="warning">Controlado</q-badge>
      </div>
      <div class="text-primary text-weight-medium q-mt-xs">
        <strong>Princípio Ativo:</strong> {{ medicamento.principio_ativo }}
      </div>
      <p class="q-mb-xs"><strong>Categoria:</strong> {{ medicamento.categoria }}</p>
      <p class="text-grey-7 text-italic q-mb-none">
        <strong>Genérico Equivalente:</strong> {{ medicamento.tem_generico ? 'Disponível' : 'Não disponível' }}
      </p>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat color="warning" label="Editar" icon="edit" @click="$emit('editar', medicamento)" />
      <q-btn flat color="negative" label="Excluir" icon="delete" @click="$emit('deletar', medicamento.id)" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
defineProps({ medicamento: { type: Object, required: true } })
defineEmits(['editar', 'deletar'])
</script>
