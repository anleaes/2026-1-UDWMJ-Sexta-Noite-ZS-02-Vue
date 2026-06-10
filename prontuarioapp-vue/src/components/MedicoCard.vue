<template>
  <q-card bordered class="q-mb-md">
    <q-card-section>
      <div class="text-h6">{{ modeloMedico.id ? 'Atualizar Dados do Médico' : 'Cadastrar Novo Médico' }}</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="submeterFormulario" class="q-gutter-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model="modeloMedico.nome" label="Nome" required />
          </div>
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model="modeloMedico.sobrenome" label="Sobrenome" required />
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model="modeloMedico.cpf" label="CPF (somente números)" maxlength="11" required />
          </div>
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model="modeloMedico.telefone" label="Telefone celular" required />
          </div>
        </div>

        <q-input outlined dense v-model="modeloMedico.email" type="email" label="E-mail" required />

        <q-separator dashed />

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model="modeloMedico.crm" label="CRM" required />
          </div>
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model="modeloMedico.matricula" label="Matrícula" required />
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model="modeloMedico.especialidade" label="Especialidade" required />
          </div>
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model="modeloMedico.cargo" label="Cargo" required />
          </div>
        </div>

        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model="modeloMedico.data_contratacao" type="date" label="Data de Contratação" required />
          </div>
          <div class="col-12 col-md-6">
            <q-checkbox v-model="modeloMedico.esta_ativo" label="Médico Ativo" />
          </div>
        </div>

        <div class="row q-gutter-sm">
          <q-btn type="submit" color="primary" :label="modeloMedico.id ? 'Salvar Alterações' : 'Cadastrar'" />
          <q-btn v-if="modeloMedico.id" color="grey" flat label="Cancelar" @click="cancelarAcao" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ modelValue: { type: Object, required: true } })
const emit = defineEmits(['update:modelValue', 'salvar', 'cancelar'])

const modeloMedico = computed({
  get: () => props.modelValue,
  set: (valoresAtualizados) => emit('update:modelValue', valoresAtualizados)
})

const submeterFormulario = () => emit('salvar')
const cancelarAcao = () => emit('cancelar')
</script>
