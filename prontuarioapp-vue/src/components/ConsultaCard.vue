<template>
  <q-card bordered class="q-mb-md">
    <q-card-section>
      <div class="text-h6">{{ modeloConsulta.id ? 'Atualizar Dados da Consulta' : 'Agendar Nova Consulta' }}</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="submeterFormulario" class="q-gutter-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-select
              outlined dense
              v-model="modeloConsulta.paciente"
              :options="opcoesPacientes"
              label="Paciente"
              emit-value map-options
              option-value="id" option-label="label"
              required
            />
          </div>
          <div class="col-12 col-md-6">
            <q-select
              outlined dense
              v-model="modeloConsulta.medico"
              :options="opcoesMedicos"
              label="Médico Responsável"
              emit-value map-options
              option-value="id" option-label="label"
              required
            />
          </div>
        </div>

        <q-separator dashed />

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input outlined dense v-model="modeloConsulta.data_agendada" type="datetime-local" label="Data e Hora Agendada" required />
          </div>
          <div class="col-12 col-md-4">
            <q-select
              outlined dense
              v-model="modeloConsulta.status"
              :options="opcoesStatus"
              label="Status"
              emit-value map-options
              option-value="id" option-label="label"
              required
            />
          </div>
          <div class="col-12 col-md-4">
            <q-select
              outlined dense
              v-model="modeloConsulta.nivel_prioridade"
              :options="opcoesPrioridade"
              label="Nível de Prioridade"
              emit-value map-options
              option-value="id" option-label="label"
              required
            />
          </div>
        </div>

        <q-separator dashed />

        <q-input
          outlined dense
          v-model="modeloConsulta.motivo"
          type="textarea"
          rows="3"
          label="Motivo da Consulta"
          required
        />

        <div class="row q-gutter-sm">
          <q-btn type="submit" color="primary" :label="modeloConsulta.id ? 'Salvar Alterações' : 'Agendar Consulta'" />
          <q-btn v-if="modeloConsulta.id" color="grey" flat label="Cancelar" @click="cancelarAcao" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  listaPacientes: { type: Array, required: true },
  listaMedicos: { type: Array, required: true }
})

const emit = defineEmits(['update:modelValue', 'salvar', 'cancelar'])

const modeloConsulta = computed({
  get: () => props.modelValue,
  set: (valoresAtualizados) => emit('update:modelValue', valoresAtualizados)
})

const opcoesPacientes = computed(() =>
  props.listaPacientes.map(p => ({
    id: p.id,
    label: `${p.nome} ${p.sobrenome} (CPF: ${formatarCPF(p.cpf)})`
  }))
)

const opcoesMedicos = computed(() =>
  props.listaMedicos.map(m => ({
    id: m.id,
    label: `Dr(a). ${m.nome} ${m.sobrenome} (CRM: ${m.crm})`
  }))
)

const opcoesStatus = [
  { id: 'AG', label: 'Agendada' },
  { id: 'RE', label: 'Realizada' },
  { id: 'CA', label: 'Cancelada' }
]

const opcoesPrioridade = [
  { id: 'B', label: 'Baixa' },
  { id: 'N', label: 'Normal' },
  { id: 'A', label: 'Alta' },
  { id: 'U', label: 'Urgência' }
]

const formatarCPF = (cpf) => {
  if (!cpf || cpf.length !== 11) return cpf
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const submeterFormulario = () => emit('salvar')
const cancelarAcao = () => emit('cancelar')
</script>
