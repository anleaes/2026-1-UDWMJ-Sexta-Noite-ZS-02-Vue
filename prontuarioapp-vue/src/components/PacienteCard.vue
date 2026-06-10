<template>
  <q-card bordered class="q-mb-md">
    <q-card-section>
      <div class="text-h6">{{ modeloPaciente.id ? 'Atualizar Dados do Paciente' : 'Cadastrar Novo Paciente' }}</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="submeterFormulario" class="q-gutter-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model="modeloPaciente.nome" label="Nome" required />
          </div>
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model="modeloPaciente.sobrenome" label="Sobrenome" required />
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model="modeloPaciente.cpf" label="CPF (somente números)" maxlength="11" required />
          </div>
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model="modeloPaciente.telefone" label="Telefone celular" required />
          </div>
        </div>

        <q-input outlined dense v-model="modeloPaciente.email" type="email" label="E-mail" required />

        <q-separator dashed />

        <q-input outlined dense v-model="modeloPaciente.data_nascimento" type="date" label="Data de Nascimento" required />

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model.number="modeloPaciente.peso" type="number" step="0.1" label="Peso (kg)" required />
          </div>
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model.number="modeloPaciente.altura" type="number" step="0.01" label="Altura (m)" required />
          </div>
        </div>

        <q-input outlined dense v-model="modeloPaciente.endereco" label="Endereço Completo" required />

        <div class="row q-gutter-sm">
          <q-btn type="submit" color="primary" :label="modeloPaciente.id ? 'Salvar Alterações' : 'Cadastrar'" />
          <q-btn v-if="modeloPaciente.id" color="grey" flat label="Cancelar" @click="cancelarAcao" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true }
})

const emit = defineEmits(['update:modelValue', 'salvar', 'cancelar'])

const modeloPaciente = computed({
  get: () => props.modelValue,
  set: (valoresAtualizados) => emit('update:modelValue', valoresAtualizados)
})

const submeterFormulario = () => emit('salvar')
const cancelarAcao = () => emit('cancelar')
</script>
