<template>
  <q-page padding>
    <div class="text-h4 text-weight-bold q-mb-md">Gerenciamento de Consultas</div>

    <ConsultaCard
      v-model="form"
      :listaPacientes="pacientes"
      :listaMedicos="medicos"
      @salvar="salvarConsulta"
      @cancelar="cancelarEdicao"
    />

    <q-card bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-md">Buscar Consultas</div>
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

    <div class="text-subtitle1 text-weight-bold q-mb-md">Consultas Registradas</div>
    <q-inner-loading :showing="carregando" label="Buscando agenda no servidor Django..." />
    <div v-if="!carregando">
      <p v-if="consultasFiltradas.length === 0" class="text-grey-7">Nenhuma consulta encontrada na base de dados.</p>
      <ConsultaItem
        v-for="consulta in consultasFiltradas"
        :key="consulta.id"
        :consulta="consulta"
        :nomePaciente="obterNomePaciente(consulta.paciente)"
        :nomeMedico="obterNomeMedico(consulta.medico)"
        @editar="prepararEdicao"
        @deletar="deletarConsulta"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api.js'
import ConsultaCard from '../components/ConsultaCard.vue'
import ConsultaItem from '../components/ConsultaItem.vue'

const $q = useQuasar()
const consultas = ref([])
const pacientes = ref([])
const medicos = ref([])
const carregando = ref(true)
const termoBusca = ref('')
const ordenacaoSelecionada = ref('data_desc')

const opcoesOrdenacao = [
  { label: 'Data (mais recente)', value: 'data_desc' },
  { label: 'Data (mais antiga)', value: 'data_asc' },
  { label: 'Prioridade (maior)', value: 'prioridade' },
]

const prioridadeOrdem = { U: 4, A: 3, N: 2, B: 1 }

const estadoInicialForm = () => ({
  id: null, paciente: '', medico: '', data_agendada: '', status: 'AG', nivel_prioridade: 'N', motivo: ''
})

const form = ref(estadoInicialForm())

const carregarDadosDoSistema = async () => {
  carregando.value = true
  try {
    const [resConsultas, resPacientes, resMedicos] = await Promise.all([
      api.get('consulta/api/'),
      api.get('paciente/api/'),
      api.get('medico/api/')
    ])
    consultas.value = resConsultas.data
    pacientes.value = resPacientes.data
    medicos.value = resMedicos.data
  } catch (error) {
    console.error('Erro na carga de dados da agenda:', error)
  } finally {
    carregando.value = false
  }
}

const salvarConsulta = async () => {
  try {
    const payload = { ...form.value }
    if (payload.id) {
      await api.patch(`consulta/api/${payload.id}/`, payload)
      $q.notify({ type: 'positive', message: 'Consulta atualizada com sucesso!' })
    } else {
      await api.post('consulta/api/', payload)
      $q.notify({ type: 'positive', message: 'Consulta agendada com sucesso!' })
    }
    form.value = estadoInicialForm()
    carregarDadosDoSistema()
  } catch (error) {
    console.error('Erro ao agendar consulta no Django:', error.response?.data || error)
    $q.notify({ type: 'negative', message: 'Falha ao salvar. Revise a consistência de data e seleções.' })
  }
}

const deletarConsulta = (id) => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: 'Tem certeza que deseja remover esta consulta definitivamente?',
    cancel: { label: 'Cancelar', flat: true, color: 'grey' },
    ok: { label: 'Excluir', color: 'negative' },
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`consulta/api/${id}/`)
      carregarDadosDoSistema()
    } catch (error) {
      console.error('Erro ao deletar da API Django:', error)
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

const prepararEdicao = (consulta) => {
  const copia = { ...consulta }
  if (copia.data_agendada) copia.data_agendada = copia.data_agendada.substring(0, 16)
  form.value = copia
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelarEdicao = () => { form.value = estadoInicialForm() }

const consultasFiltradas = computed(() => {
  let lista = [...consultas.value]
  if (termoBusca.value) {
    const termo = termoBusca.value.toLowerCase()
    lista = lista.filter(c => {
      const pNome = obterNomePaciente(c.paciente).toLowerCase()
      const mNome = obterNomeMedico(c.medico).toLowerCase()
      return pNome.includes(termo) || mNome.includes(termo) || c.motivo.toLowerCase().includes(termo)
    })
  }
  lista.sort((a, b) => {
    if (ordenacaoSelecionada.value === 'prioridade') {
      const pa = prioridadeOrdem[a.nivel_prioridade] || 0
      const pb = prioridadeOrdem[b.nivel_prioridade] || 0
      return pb - pa
    }
    const da = new Date(a.data_agendada)
    const db = new Date(b.data_agendada)
    return ordenacaoSelecionada.value === 'data_asc' ? da - db : db - da
  })
  return lista
})

onMounted(() => { carregarDadosDoSistema() })
</script>
