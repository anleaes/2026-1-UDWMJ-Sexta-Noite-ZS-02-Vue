<template>
  <q-page padding>
    <div class="text-h4 text-weight-bold q-mb-md">Controle de Exames Solicitados</div>

    <ExameSolicitadoCard
      v-model="form"
      :listaConsultas="consultas"
      :obterNomePaciente="obterNomePacientePorId"
      @salvar="salvarExame"
      @cancelar="cancelarEdicao"
    />

    <q-card bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-md">Buscar Exames</div>
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

    <div class="text-subtitle1 text-weight-bold q-mb-md">Pedidos de Exames Registrados</div>
    <q-inner-loading :showing="carregando" label="Buscando registros no servidor Django..." />
    <div v-if="!carregando">
      <p v-if="examesFiltrados.length === 0" class="text-grey-7">Nenhum exame solicitado encontrado.</p>
      <ExameSolicitadoItem
        v-for="exame in examesFiltrados"
        :key="exame.id"
        :exame="exame"
        :nomePaciente="obterNomePacientePorConsulta(exame.consulta)"
        :nomeMedico="obterNomeMedicoPorConsulta(exame.consulta)"
        @editar="prepararEdicao"
        @deletar="deletarExame"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api.js'
import ExameSolicitadoCard from '../components/ExameSolicitadoCard.vue'
import ExameSolicitadoItem from '../components/ExameSolicitadoItem.vue'

const $q = useQuasar()
const exames = ref([])
const consultas = ref([])
const pacientes = ref([])
const medicos = ref([])
const carregando = ref(true)
const termoBusca = ref('')
const ordenacaoSelecionada = ref('nome_asc')

const opcoesOrdenacao = [
  { label: 'Nome do exame (A-Z)', value: 'nome_asc' },
  { label: 'Nome do exame (Z-A)', value: 'nome_desc' },
]

const estadoInicialForm = () => ({
  id: null, nome_exame: '', descricao: '', preparo: '', exige_jejum: false, consulta: ''
})

const form = ref(estadoInicialForm())

const carregarDadosDoSistema = async () => {
  carregando.value = true
  try {
    const carregarTabela = async (url) => {
      try {
        const res = await api.get(url)
        return res.data
      } catch {
        console.warn(`Aviso: Rota [${url}] falhou no carregamento local.`)
        return []
      }
    }

    consultas.value = await carregarTabela('consulta/api/')
    pacientes.value = await carregarTabela('paciente/api/')
    medicos.value = await carregarTabela('medico/api/')

    let dadosExames = await carregarTabela('exameSolicitado/api/')
    if (dadosExames.length === 0) dadosExames = await carregarTabela('examesolicitado/api/')
    exames.value = dadosExames
  } catch (error) {
    console.error('Erro geral no carregamento de exames:', error)
  } finally {
    carregando.value = false
  }
}

const salvarExame = async () => {
  try {
    if (form.value.id) {
      try {
        await api.patch(`exameSolicitado/api/${form.value.id}/`, form.value)
      } catch {
        await api.patch(`examesolicitado/api/${form.value.id}/`, form.value)
      }
      $q.notify({ type: 'positive', message: 'Solicitação de exame atualizada!' })
    } else {
      try {
        await api.post('exameSolicitado/api/', form.value)
      } catch {
        await api.post('examesolicitado/api/', form.value)
      }
      $q.notify({ type: 'positive', message: 'Exame solicitado com sucesso!' })
    }
    form.value = estadoInicialForm()
    carregarDadosDoSistema()
  } catch (error) {
    console.error('Erro ao salvar exame:', error)
    $q.notify({ type: 'negative', message: 'Falha ao salvar o exame. Revise os campos obrigatórios.' })
  }
}

const deletarExame = (id) => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: 'Deseja realmente remover esta solicitação de exame?',
    cancel: { label: 'Cancelar', flat: true, color: 'grey' },
    ok: { label: 'Excluir', color: 'negative' },
    persistent: true
  }).onOk(async () => {
    try {
      try {
        await api.delete(`exameSolicitado/api/${id}/`)
      } catch {
        await api.delete(`examesolicitado/api/${id}/`)
      }
      carregarDadosDoSistema()
    } catch (error) {
      console.error('Erro ao deletar registro:', error)
    }
  })
}

const obterNomePacientePorId = (idPac) => {
  const p = pacientes.value.find(item => item.id === idPac)
  return p ? `${p.nome} ${p.sobrenome}` : 'Carregando...'
}

const obterNomePacientePorConsulta = (idConsulta) => {
  const c = consultas.value.find(item => item.id === idConsulta)
  return c ? obterNomePacientePorId(c.paciente) : 'Não localizado'
}

const obterNomeMedicoPorConsulta = (idConsulta) => {
  const c = consultas.value.find(item => item.id === idConsulta)
  if (!c) return 'Não localizado'
  const m = medicos.value.find(item => item.id === c.medico)
  return m ? `${m.nome} ${m.sobrenome}` : 'Não localizado'
}

const prepararEdicao = (exame) => {
  form.value = { ...exame }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelarEdicao = () => { form.value = estadoInicialForm() }

const examesFiltrados = computed(() => {
  let lista = [...exames.value]
  if (termoBusca.value) {
    const termo = termoBusca.value.toLowerCase()
    lista = lista.filter(ex => {
      const nomeEx = ex.nome_exame.toLowerCase()
      const nomePac = obterNomePacientePorConsulta(ex.consulta).toLowerCase()
      return nomeEx.includes(termo) || nomePac.includes(termo)
    })
  }
  lista.sort((a, b) => {
    const cmp = a.nome_exame.localeCompare(b.nome_exame, 'pt-BR')
    return ordenacaoSelecionada.value === 'nome_desc' ? -cmp : cmp
  })
  return lista
})

onMounted(() => { carregarDadosDoSistema() })
</script>
