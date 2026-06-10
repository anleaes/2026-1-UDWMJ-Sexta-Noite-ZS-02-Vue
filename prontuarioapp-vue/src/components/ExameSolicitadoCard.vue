<template>
  <q-card bordered class="q-mb-md">
    <q-card-section>
      <div class="text-h6">{{ modeloExame.id ? 'Atualizar Solicitação de Exame' : 'Solicitar Novo Exame' }}</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="submeterFormulario" class="q-gutter-md">
        <q-select
          outlined dense
          v-model="modeloExame.consulta"
          :options="opcoesConsultas"
          label="Consulta de Origem"
          emit-value map-options
          option-value="id" option-label="label"
          required
        />

        <q-separator dashed />

        <q-input outlined dense v-model="modeloExame.nome_exame" label="Nome do Exame" required />

        <q-input outlined dense v-model="modeloExame.descricao" type="textarea" rows="2" label="Descrição / Objetivo do Exame" required />
        <q-input outlined dense v-model="modeloExame.preparo" type="textarea" rows="2" label="Instruções de Preparo do Paciente" required />

        <q-checkbox v-model="modeloExame.exige_jejum" label="Exige Jejum Obrigatório" />

        <div class="row q-gutter-sm">
          <q-btn type="submit" color="primary" :label="modeloExame.id ? 'Salvar Alterações' : 'Registrar Solicitação'" />
          <q-btn v-if="modeloExame.id" color="grey" flat label="Cancelar" @click="cancelarAcao" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  listaConsultas: { type: Array, required: true },
  obterNomePaciente: { type: Function, required: true }
})

const emit = defineEmits(['update:modelValue', 'salvar', 'cancelar'])

const modeloExame = computed({
  get: () => props.modelValue,
  set: (valoresAtualizados) => emit('update:modelValue', valoresAtualizados)
})

const opcoesConsultas = computed(() =>
  props.listaConsultas.map(c => ({
    id: c.id,
    label: `Consulta #${c.id} | Paciente: ${obterTextoConsulta(c)}`
  }))
)

const obterTextoConsulta = (consulta) => {
  const nomePac = props.obterNomePaciente(consulta.paciente)
  const dataForm = new Date(consulta.data_agendada).toLocaleDateString('pt-BR')
  return `${nomePac} (${dataForm})`
}

const submeterFormulario = () => emit('salvar')
const cancelarAcao = () => emit('cancelar')
</script>
