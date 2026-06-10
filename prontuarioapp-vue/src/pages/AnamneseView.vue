<template>
  <q-page padding>
    <div class="text-h4 text-weight-bold q-mb-md">Histórico Clínico - Anamneses</div>

    <AnamneseCard
      v-model="form"
      :listaPacientes="pacientes"
      :listaMedicos="medicos"
      @salvar="salvarAnamnese"
      @cancelar="cancelarEdicao"
    />

    <q-card bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-md">Buscar por Prontuários</div>
        <div class="row q-col-gutter-sm items-end">
          <div class="col-grow">
            <q-input v-model="termoBusca" label="Pesquisar..." outlined dense clearable>
              <template #prepend><q-icon name="search" /></template>
            </q-input>
          </div>
          <div class="col-auto">
            <q-select
              v-model="ordenacaoSelecionada"
              :options="opcoesOrdenacao"
              label="Ordenar por"
              outlined dense
              emit-value map-options
              option-value="value" option-label="label"
              style="min-width: 220px"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="text-subtitle1 text-weight-bold q-mb-md">Registros Clínicos Recentes</div>
    <q-inner-loading :showing="carregando" label="Buscando prontuários de anamnese no servidor Django..." />
    <div v-if="!carregando">
      <p v-if="anamnesesFiltradas.length === 0" class="text-grey-7">Nenhum registro clínico encontrado.</p>
      <AnamneseItem
        v-for="anamnese in anamnesesFiltradas"
        :key="anamnese.id"
        :anamnese="anamnese"
        :nomePaciente="obterNomePaciente(anamnese.paciente)"
        :nomeMedico="obterNomeMedico(anamnese.medico)"
        @editar="prepararEdicao"
        @deletar="deletarAnamnese"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api.js'
import AnamneseCard from '../components/AnamneseCard.vue'
import AnamneseItem from '../components/AnamneseItem.vue'

const $q = useQuasar()
const anamneses = ref([])
const pacientes = ref([])
const medicos = ref([])
const carregando = ref(true)
const termoBusca = ref('')
const ordenacaoSelecionada = ref('data_desc')

const opcoesOrdenacao = [
  { label: 'Data (mais recente)', value: 'data_desc' },
  { label: 'Data (mais antiga)', value: 'data_asc' },
]

const estadoInicialForm = () => ({
  id: null, paciente: '', medico: '', queixa_principal: '', alergias: '',
  medicamentos: '', alcool: 'NAO', fumante: 'NAO'
})

const form = ref(estadoInicialForm())

const carregarDadosDoSistema = async () => {
  carregando.value = true
  try {
    const [resAnamneses, resPacientes, resMedicos] = await Promise.all([
      api.get('anamnese/api/'),
      api.get('paciente/api/'),
      api.get('medico/api/')
    ])
    anamneses.value = resAnamneses.data
    pacientes.value = resPacientes.data
    medicos.value = resMedicos.data
  } catch (error) {
    console.error('Erro na carga de dados relacionais:', error)
  } finally {
    carregando.value = false
  }
}

const salvarAnamnese = async () => {
  try {
    if (form.value.id) {
      await api.patch(`anamnese/api/${form.value.id}/`, form.value)
      $q.notify({ type: 'positive', message: 'Anamnese atualizada com sucesso!' })
    } else {
      await api.post('anamnese/api/', form.value)
      $q.notify({ type: 'positive', message: 'Anamnese registrada com sucesso!' })
    }
    form.value = estadoInicialForm()
    carregarDadosDoSistema()
  } catch (error) {
    console.error('Erro ao salvar anamnese no Django:', error.response?.data || error)
    $q.notify({ type: 'negative', message: 'Falha ao salvar o prontuário. Revise as seleções e os campos.' })
  }
}

const deletarAnamnese = (id) => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: 'Tem certeza que deseja remover esta anamnese definitivamente?',
    cancel: { label: 'Cancelar', flat: true, color: 'grey' },
    ok: { label: 'Excluir', color: 'negative' },
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`anamnese/api/${id}/`)
      carregarDadosDoSistema()
    } catch (error) {
      console.error('Erro ao deletar do Django:', error)
    }
  })
}

const obterNomePaciente = (idPaciente) => {
  const p = pacientes.value.find(item => item.id === idPaciente)
  return p ? `${p.nome} ${p.sobrenome}` : 'Paciente não localizado'
}

const obterNomeMedico = (idMedico) => {
  const m = medicos.value.find(item => item.id === idMedico)
  return m ? `${m.nome} ${m.sobrenome}` : 'Médico não localizado'
}

const prepararEdicao = (anamnese) => {
  form.value = { ...anamnese }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelarEdicao = () => { form.value = estadoInicialForm() }

const anamnesesFiltradas = computed(() => {
  let lista = [...anamneses.value]
  if (termoBusca.value) {
    const termo = termoBusca.value.toLowerCase()
    lista = lista.filter(a => {
      const pNome = obterNomePaciente(a.paciente).toLowerCase()
      const mNome = obterNomeMedico(a.medico).toLowerCase()
      return pNome.includes(termo) || mNome.includes(termo) || a.queixa_principal.toLowerCase().includes(termo)
    })
  }
  lista.sort((a, b) => {
    const da = new Date(a.data_criacao || 0)
    const db = new Date(b.data_criacao || 0)
    return ordenacaoSelecionada.value === 'data_asc' ? da - db : db - da
  })
  return lista
})

onMounted(() => { carregarDadosDoSistema() })
</script>
