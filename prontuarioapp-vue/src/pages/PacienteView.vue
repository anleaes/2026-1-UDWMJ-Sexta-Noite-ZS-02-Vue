<template>
  <q-page padding>
    <div class="text-h4 text-weight-bold q-mb-md">Controle de Pacientes</div>

    <PacienteCard v-model="form" @salvar="salvarPaciente" @cancelar="cancelarEdicao" />

    <q-card bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-md">Buscar Paciente</div>
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
              style="min-width: 200px"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="text-subtitle1 text-weight-bold q-mb-md">Pacientes Cadastrados</div>
    <q-inner-loading :showing="carregando" label="Buscando registros no servidor Django..." />
    <div v-if="!carregando">
      <p v-if="pacientesFiltrados.length === 0" class="text-grey-7">Nenhum paciente encontrado na base de dados.</p>
      <PacienteItem
        v-for="paciente in pacientesFiltrados"
        :key="paciente.id"
        :paciente="paciente"
        @editar="prepararEdicao"
        @deletar="deletarPaciente"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api.js'
import PacienteCard from '../components/PacienteCard.vue'
import PacienteItem from '../components/PacienteItem.vue'

const $q = useQuasar()
const pacientes = ref([])
const carregando = ref(true)
const termoBusca = ref('')
const ordenacaoSelecionada = ref('nome_asc')

const opcoesOrdenacao = [
  { label: 'Nome (A-Z)', value: 'nome_asc' },
  { label: 'Nome (Z-A)', value: 'nome_desc' },
]

const estadoInicialForm = () => ({
  id: null, nome: '', sobrenome: '', cpf: '', telefone: '', email: '',
  data_nascimento: '', peso: '', altura: '', endereco: ''
})

const form = ref(estadoInicialForm())

const buscarPacientes = async () => {
  carregando.value = true
  try {
    const response = await api.get('paciente/api/')
    pacientes.value = response.data
  } catch (error) {
    console.error('Erro ao carregar pacientes do Django:', error)
  } finally {
    carregando.value = false
  }
}

const salvarPaciente = async () => {
  try {
    if (form.value.id) {
      await api.patch(`paciente/api/${form.value.id}/`, form.value)
      $q.notify({ type: 'positive', message: 'Paciente atualizado com sucesso!' })
    } else {
      await api.post('paciente/api/', form.value)
      $q.notify({ type: 'positive', message: 'Paciente cadastrado com sucesso!' })
    }
    form.value = estadoInicialForm()
    buscarPacientes()
  } catch (error) {
    console.error('Erro ao enviar dados para a API:', error.response?.data || error)
    $q.notify({ type: 'negative', message: 'Falha ao salvar. Revise os campos preenchidos.' })
  }
}

const deletarPaciente = (id) => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: 'Tem certeza que deseja excluir em definitivo este paciente?',
    cancel: { label: 'Cancelar', flat: true, color: 'grey' },
    ok: { label: 'Excluir', color: 'negative' },
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`paciente/api/${id}/`)
      buscarPacientes()
      $q.notify({ type: 'positive', message: 'Paciente excluído com sucesso.' })
    } catch (error) {
      console.error('Erro ao deletar registro do Django:', error)
      $q.notify({ type: 'negative', message: 'Erro ao excluir paciente.' })
    }
  })
}

const prepararEdicao = (paciente) => {
  form.value = { ...paciente }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelarEdicao = () => { form.value = estadoInicialForm() }

const pacientesFiltrados = computed(() => {
  let lista = [...pacientes.value]
  if (termoBusca.value) {
    const termo = termoBusca.value.toLowerCase()
    lista = lista.filter(p => {
      const nomeCompleto = `${p.nome} ${p.sobrenome}`.toLowerCase()
      return nomeCompleto.includes(termo) || p.cpf.includes(termo)
    })
  }
  lista.sort((a, b) => {
    const nomeA = `${a.nome} ${a.sobrenome}`.toLowerCase()
    const nomeB = `${b.nome} ${b.sobrenome}`.toLowerCase()
    return ordenacaoSelecionada.value === 'nome_desc'
      ? nomeB.localeCompare(nomeA, 'pt-BR')
      : nomeA.localeCompare(nomeB, 'pt-BR')
  })
  return lista
})

onMounted(() => { buscarPacientes() })
</script>
