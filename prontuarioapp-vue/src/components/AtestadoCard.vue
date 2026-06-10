<template>
  <q-card bordered class="q-mb-md">
    <q-card-section>
      <div class="text-h6">{{ modeloAtestado.id ? 'Atualizar Dados do Atestado' : 'Emitir Novo Atestado Médico' }}</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="submeterFormulario" class="q-gutter-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-8">
            <q-select
              outlined dense
              v-model="modeloAtestado.consulta"
              :options="opcoesConsultas"
              label="Consulta de Origem"
              emit-value map-options
              option-value="id" option-label="label"
              required
            />
          </div>
          <div class="col-12 col-md-4">
            <q-select
              outlined dense
              v-model="modeloAtestado.tipo_atestado"
              :options="opcoesTipo"
              label="Tipo de Atestado"
              emit-value map-options
              option-value="id" option-label="label"
              required
            />
          </div>
        </div>

        <q-separator dashed />

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input outlined dense v-model="modeloAtestado.codigo_autenticacao" label="Código de Autenticação Único" required />
          </div>
          <div class="col-12 col-md-4">
            <q-input outlined dense v-model="modeloAtestado.data_inicio_afastamento" type="date" label="Início do Afastamento" required />
          </div>
          <div class="col-12 col-md-4">
            <q-input outlined dense v-model.number="modeloAtestado.quantidade_dias" type="number" min="1" label="Quantidade de Dias" required />
          </div>
        </div>

        <q-separator dashed />

        <q-select
          outlined dense
          v-model="modeloAtestado.cid"
          :options="opcoesCids"
          label="CIDs Vinculados"
          multiple
          use-chips
          emit-value map-options
          option-value="id" option-label="label"
          required
        />
        <div class="text-caption text-grey-7">CIDs selecionados: {{ modeloAtestado.cid?.length || 0 }}</div>

        <div class="row q-gutter-sm">
          <q-btn type="submit" color="primary" :label="modeloAtestado.id ? 'Salvar Alterações' : 'Emitir Atestado'" />
          <q-btn v-if="modeloAtestado.id" color="grey" flat label="Cancelar" @click="cancelarAcao" />
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
  listaCids: { type: Array, required: true },
  obterNomePaciente: { type: Function, required: true }
})

const emit = defineEmits(['update:modelValue', 'salvar', 'cancelar'])

const modeloAtestado = computed({
  get: () => props.modelValue,
  set: (valoresAtualizados) => emit('update:modelValue', valoresAtualizados)
})

const opcoesConsultas = computed(() =>
  props.listaConsultas.map(c => ({
    id: c.id,
    label: `Consulta #${c.id} | Paciente: ${obterTextoConsulta(c)}`
  }))
)

const opcoesCids = computed(() =>
  props.listaCids.map(item => ({
    id: item.id,
    label: `${item.cod_cid} - ${item.descricao}`
  }))
)

const opcoesTipo = [
  { id: 'MEDICO', label: 'Médico' },
  { id: 'ODONTO', label: 'Odontológico' },
  { id: 'OUTRO', label: 'Outro' }
]

const obterTextoConsulta = (consulta) => {
  const nomePac = props.obterNomePaciente(consulta.paciente)
  const dataForm = new Date(consulta.data_agendada).toLocaleDateString('pt-BR')
  return `${nomePac} (${dataForm})`
}

const submeterFormulario = () => emit('salvar')
const cancelarAcao = () => emit('cancelar')
</script>
