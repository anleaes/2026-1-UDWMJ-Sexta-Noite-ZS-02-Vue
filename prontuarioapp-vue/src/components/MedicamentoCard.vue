<template>
  <q-card bordered class="q-mb-md">
    <q-card-section>
      <div class="text-h6">{{ modeloMedicamento.id ? 'Atualizar Medicamento' : 'Cadastrar Novo Medicamento' }}</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="submeterFormulario" class="q-gutter-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model="modeloMedicamento.nome_referencia" label="Nome de Referência" required />
          </div>
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model="modeloMedicamento.principio_ativo" label="Princípio Ativo" required />
          </div>
        </div>

        <q-input outlined dense v-model="modeloMedicamento.categoria" label="Categoria Farmacêutica" required />

        <q-separator dashed />

        <q-checkbox v-model="modeloMedicamento.e_controlado" label="Medicamento Controlado (Retenção de Receita)" />
        <q-checkbox v-model="modeloMedicamento.tem_generico" label="Possui Equivalente Genérico" />

        <div class="row q-gutter-sm">
          <q-btn type="submit" color="primary" :label="modeloMedicamento.id ? 'Salvar Alterações' : 'Cadastrar'" />
          <q-btn v-if="modeloMedicamento.id" color="grey" flat label="Cancelar" @click="cancelarAcao" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ modelValue: { type: Object, required: true } })
const emit = defineEmits(['update:modelValue', 'salvar', 'cancelar'])

const modeloMedicamento = computed({
  get: () => props.modelValue,
  set: (valoresAtualizados) => emit('update:modelValue', valoresAtualizados)
})

const submeterFormulario = () => emit('salvar')
const cancelarAcao = () => emit('cancelar')
</script>
