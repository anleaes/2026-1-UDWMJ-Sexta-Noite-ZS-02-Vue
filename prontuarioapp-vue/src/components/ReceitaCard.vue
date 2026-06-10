<template>
  <q-card bordered class="q-mb-md">
    <q-card-section>
      <div class="text-h6">{{ modeloReceita.id ? 'Atualizar Dados da Receita' : 'Emitir Nova Receita Médica' }}</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="submeterFormulario" class="q-gutter-md">
        <q-select
          outlined dense
          v-model="modeloReceita.consulta"
          :options="opcoesConsultas"
          label="Consulta de Origem"
          emit-value map-options
          option-value="id" option-label="label"
          :disable="!!modeloReceita.id"
          required
        />

        <q-separator dashed />

        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-4">
            <q-input outlined dense v-model="modeloReceita.data_emissao" type="date" label="Data de Emissão" required />
          </div>
          <div class="col-12 col-md-4">
            <q-input outlined dense v-model="modeloReceita.validade" type="date" label="Validade da Receita" required />
          </div>
          <div class="col-12 col-md-4">
            <q-checkbox v-model="modeloReceita.e_digital" label="Receita Digital" />
          </div>
        </div>

        <q-separator dashed />

        <div class="text-subtitle1 text-weight-medium">Medicamentos e Posologia</div>

        <div v-if="!modeloReceita.id" class="row q-col-gutter-sm items-end">
          <div class="col-grow">
            <q-select
              outlined dense
              v-model="medicamentoSelecionado"
              :options="opcoesMedicamentos"
              label="Escolha um medicamento para adicionar..."
              emit-value map-options
              option-value="id" option-label="label"
              clearable
            />
          </div>
          <div class="col-auto">
            <q-btn color="primary" label="+ Adicionar" @click="adicionarMedicamentoNaLista" />
          </div>
        </div>

        <template v-if="modeloReceita.itensMedicamentos?.length > 0">
          <q-markup-table flat bordered separator="horizontal" class="q-mt-sm">
            <thead>
              <tr>
                <th class="text-left">Medicamento</th>
                <th class="text-left">Concentração</th>
                <th class="text-left">Dose</th>
                <th class="text-left">Frequência</th>
                <th class="text-left">Duração (Dias)</th>
                <th v-if="!modeloReceita.id" class="text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in modeloReceita.itensMedicamentos" :key="index">
                <td class="text-primary text-weight-bold">{{ item.nome_referencia }}</td>
                <td>
                  <q-input dense outlined v-model="item.concentracao" placeholder="Ex: 500mg" required />
                </td>
                <td>
                  <q-input dense outlined v-model="item.dose" placeholder="Ex: 1 comp." required />
                </td>
                <td>
                  <q-input dense outlined v-model="item.frequencia" placeholder="Ex: 8h em 8h" required />
                </td>
                <td>
                  <q-input dense outlined v-model.number="item.duracao_dias" type="number" min="1" required />
                </td>
                <td v-if="!modeloReceita.id">
                  <q-btn flat color="negative" icon="delete" @click="removerMedicamentoDaLista(index)" />
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </template>
        <p v-else class="text-grey-6 text-italic text-center q-my-md">Nenhum medicamento adicionado a esta receita ainda.</p>

        <q-separator dashed />

        <q-input
          outlined dense
          v-model="modeloReceita.instrucoes"
          type="textarea"
          rows="2"
          label="Instruções Gerais de Uso (Opcional)"
        />

        <div class="row q-gutter-sm">
          <q-btn type="submit" color="primary" :label="modeloReceita.id ? 'Salvar Alterações' : 'Emitir Receita'" />
          <q-btn color="grey" flat :label="modeloReceita.id ? 'Cancelar' : 'Limpar'" @click="cancelarAcao" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  modelValue: { type: Object, required: true },
  listaConsultas: { type: Array, required: true },
  listaMedicamentos: { type: Array, required: true },
  obterNomePaciente: { type: Function, required: true }
})

const emit = defineEmits(['update:modelValue', 'salvar', 'cancelar'])

const modeloReceita = computed({
  get: () => props.modelValue,
  set: (valoresAtualizados) => emit('update:modelValue', valoresAtualizados)
})

const medicamentoSelecionado = ref(null)

const opcoesConsultas = computed(() =>
  props.listaConsultas.map(c => ({
    id: c.id,
    label: `Consulta #${c.id} | Paciente: ${obterTextoConsulta(c)}`
  }))
)

const opcoesMedicamentos = computed(() =>
  props.listaMedicamentos.map(med => ({
    id: med.id,
    label: `${med.nome_referencia} (${med.principio_ativo})`,
    med
  }))
)

const adicionarMedicamentoNaLista = () => {
  if (!medicamentoSelecionado.value) return

  const medObj = props.listaMedicamentos.find(m => m.id === medicamentoSelecionado.value)
  if (!medObj) return

  const jaExiste = modeloReceita.value.itensMedicamentos.some(m => m.medicamento === medObj.id)
  if (jaExiste) {
    $q.notify({ type: 'warning', message: 'Este medicamento já foi adicionado a esta receita.' })
    return
  }

  modeloReceita.value.itensMedicamentos.push({
    medicamento: medObj.id,
    nome_referencia: medObj.nome_referencia,
    concentracao: '',
    dose: '',
    frequencia: '',
    duracao_dias: ''
  })

  medicamentoSelecionado.value = null
}

const removerMedicamentoDaLista = (index) => {
  modeloReceita.value.itensMedicamentos.splice(index, 1)
}

const submeterFormulario = () => {
  if (modeloReceita.value.itensMedicamentos.length === 0) {
    $q.notify({ type: 'negative', message: 'Adicione pelo menos um medicamento com posologia para emitir a receita.' })
    return
  }
  emit('salvar')
}

const cancelarAcao = () => emit('cancelar')

const obterTextoConsulta = (consulta) => {
  const nomePac = props.obterNomePaciente(consulta.paciente)
  const dataForm = new Date(consulta.data_agendada).toLocaleDateString('pt-BR')
  return `${nomePac} (${dataForm})`
}
</script>
