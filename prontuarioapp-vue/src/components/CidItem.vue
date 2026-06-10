<template>
  <q-card class="my-card q-mb-md" bordered :class="{ 'opacity-80': !cid.status_ativo }">
    <q-card-section>
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">
          <span class="text-primary text-weight-bold">{{ cid.cod_cid }}</span> - {{ cid.descricao }}
        </div>
        <q-badge :color="cid.status_ativo ? 'positive' : 'grey'">
          {{ cid.status_ativo ? 'Ativo' : 'Inativo' }}
        </q-badge>
      </div>
      <div class="text-primary text-weight-medium q-mt-xs">
        <strong>Categoria/Tipo:</strong> {{ cid.tipo }}
      </div>
      <p class="text-grey-7 text-italic q-mb-none"><strong>Sintomas Relacionados:</strong> {{ cid.sintomas }}</p>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat color="warning" label="Editar" icon="edit" @click="$emit('editar', cid)" />
      <q-btn flat color="negative" label="Excluir" icon="delete" @click="$emit('deletar', cid.id)" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
defineProps({ cid: { type: Object, required: true } })
defineEmits(['editar', 'deletar'])
</script>
