<template>
  <q-card bordered class="q-mb-md">
    <q-card-section>
      <div class="text-h6">{{ modeloCid.id ? 'Atualizar CID' : 'Cadastrar Novo CID' }}</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="submeterFormulario" class="q-gutter-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model="modeloCid.cod_cid" label="Código CID (Ex: I10, E11)" required />
          </div>
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model="modeloCid.tipo" label="Tipo/Categoria da Doença" required />
          </div>
        </div>

        <q-input outlined dense v-model="modeloCid.descricao" label="Descrição/Nome da Patologia" required />

        <q-input
          outlined dense
          v-model="modeloCid.sintomas"
          type="textarea"
          rows="3"
          label="Sintomas Comuns"
          required
        />

        <q-checkbox v-model="modeloCid.status_ativo" label="CID Ativo para Uso" />

        <div class="row q-gutter-sm">
          <q-btn type="submit" color="primary" :label="modeloCid.id ? 'Salvar Alterações' : 'Cadastrar'" />
          <q-btn v-if="modeloCid.id" color="grey" flat label="Cancelar" @click="cancelarAcao" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ modelValue: { type: Object, required: true } })
const emit = defineEmits(['update:modelValue', 'salvar', 'cancelar'])

const modeloCid = computed({
  get: () => props.modelValue,
  set: (valoresAtualizados) => emit('update:modelValue', valoresAtualizados)
})

const submeterFormulario = () => emit('salvar')
const cancelarAcao = () => emit('cancelar')
</script>
