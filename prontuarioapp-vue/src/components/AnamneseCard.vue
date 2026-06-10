<template>
  <q-card bordered class="q-mb-md">
    <q-card-section>
      <div class="text-h6">{{ modeloAnamnese.id ? 'Atualizar Dados da Anamnese' : 'Registrar Nova Anamnese' }}</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="submeterFormulario" class="q-gutter-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-select
              outlined dense
              v-model="modeloAnamnese.paciente"
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
              v-model="modeloAnamnese.medico"
              :options="opcoesMedicos"
              label="Médico Responsável"
              emit-value map-options
              option-value="id" option-label="label"
              required
            />
          </div>
        </div>

        <q-separator dashed />

        <q-input outlined dense v-model="modeloAnamnese.queixa_principal" type="textarea" rows="3" label="Queixa Principal" required />
        <q-input outlined dense v-model="modeloAnamnese.alergias" type="textarea" rows="2" label="Alergias Conocidas" required />
        <q-input outlined dense v-model="modeloAnamnese.medicamentos" type="textarea" rows="2" label="Medicamentos em Uso" required />

        <q-separator dashed />

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-select
              outlined dense
              v-model="modeloAnamnese.alcool"
              :options="opcoesHabito"
              label="Consumo de Álcool"
              emit-value map-options
              option-value="id" option-label="label"
              required
            />
          </div>
          <div class="col-12 col-md-6">
            <q-select
              outlined dense
              v-model="modeloAnamnese.fumante"
              :options="opcoesHabito"
              label="Fumante"
              emit-value map-options
              option-value="id" option-label="label"
              required
            />
          </div>
        </div>

        <div class="row q-gutter-sm">
          <q-btn type="submit" color="primary" :label="modeloAnamnese.id ? 'Salvar Alterações' : 'Gravar Anamnese'" />
          <q-btn v-if="modeloAnamnese.id" color="grey" flat label="Cancelar" @click="cancelarAcao" />
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

const modeloAnamnese = computed({
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

const opcoesHabito = [
  { id: 'NAO', label: 'Não consome' },
  { id: 'EVE', label: 'Eventual' },
  { id: 'DIA', label: 'Diário' }
]

const formatarCPF = (cpf) => {
  if (!cpf || cpf.length !== 11) return cpf
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const submeterFormulario = () => emit('salvar')
const cancelarAcao = () => emit('cancelar')
</script>
