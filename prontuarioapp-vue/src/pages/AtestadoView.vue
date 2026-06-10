<template>
  <q-page padding>
    <div class="text-h4 text-weight-bold q-mb-md">Emissão e Controle de Atestados</div>

    <AtestadoCard
      v-model="form"
      :listaConsultas="consultas"
      :listaCids="cids"
      :obterNomePaciente="obterNomePacientePorId"
      @salvar="salvarAtestado"
      @cancelar="cancelarEdicao"
    />

    <q-card bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-md">Buscar Atestados Emitidos</div>
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

    <div class="text-subtitle1 text-weight-bold q-mb-md">Histórico de Documentos Emitidos</div>
    <q-inner-loading :showing="carregando" label="Buscando atestados no servidor Django..." />
    <div v-if="!carregando">
      <p v-if="atestadosFiltrados.length === 0" class="text-grey-7">Nenhum atestado localizado no sistema.</p>
      <AtestadoItem
        v-for="atestado in atestadosFiltrados"
        :key="atestado.id"
        :atestado="atestado"
        :nomePaciente="obterNomePacientePorConsulta(atestado.consulta)"
        :nomeMedico="obterNomeMedicoPorConsulta(atestado.consulta)"
        :cidsDoAtestado="mapearCidsDoAtestado(atestado.cid)"
        @editar="prepararEdicao"
        @deletar="deletarAtestado"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api.js'
import AtestadoCard from '../components/AtestadoCard.vue'
import AtestadoItem from '../components/AtestadoItem.vue'

const $q = useQuasar()
const atestados = ref([])
const consultas = ref([])
const pacientes = ref([])
const medicos = ref([])
const cids = ref([])
const carregando = ref(true)
const termoBusca = ref('')
const ordenacaoSelecionada = ref('data_desc')

const opcoesOrdenacao = [
  { label: 'Data de afastamento (mais recente)', value: 'data_desc' },
  { label: 'Data de afastamento (mais antiga)', value: 'data_asc' },
]

const estadoInicialForm = () => ({
  id: null, codigo_autenticacao: '', data_inicio_afastamento: '',
  quantidade_dias: '', tipo_atestado: 'MEDICO', consulta: '', cid: []
})

const form = ref(estadoInicialForm())

const carregarDadosDoSistema = async () => {
  carregando.value = true
  try {
    const [resAtestados, resConsultas, resPacientes, resMedicos, resCids] = await Promise.all([
      api.get('atestado/api/'),
      api.get('consulta/api/'),
      api.get('paciente/api/'),
      api.get('medico/api/'),
      api.get('cid/api/')
    ])
    atestados.value = resAtestados.data
    consultas.value = resConsultas.data
    pacientes.value = resPacientes.data
    medicos.value = resMedicos.data
    cids.value = resCids.data
  } catch (error) {
    console.error('Erro na carga de dados estruturais:', error)
  } finally {
    carregando.value = false
  }
}

const salvarAtestado = async () => {
  try {
    if (form.value.id) {
      await api.patch(`atestado/api/${form.value.id}/`, form.value)
      $q.notify({ type: 'positive', message: 'Atestado atualizado com sucesso!' })
    } else {
      await api.post('atestado/api/', form.value)
      $q.notify({ type: 'positive', message: 'Atestado emitido com sucesso!' })
    }
    form.value = estadoInicialForm()
    carregarDadosDoSistema()
  } catch (error) {
    console.error('Erro ao processar envio no Django:', error.response?.data || error)
    $q.notify({ type: 'negative', message: 'Falha ao salvar. Verifique se o código de autenticação já não existe ou se há campos em branco.' })
  }
}

const deletarAtestado = (id) => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: 'Tem certeza que deseja revogar/deletar permanentemente este atestado?',
    cancel: { label: 'Cancelar', flat: true, color: 'grey' },
    ok: { label: 'Excluir', color: 'negative' },
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`atestado/api/${id}/`)
      carregarDadosDoSistema()
    } catch (error) {
      console.error('Erro ao deletar registro do Django:', error)
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

const mapearCidsDoAtestado = (arrayIdsCids) => {
  if (!arrayIdsCids) return []
  return cids.value.filter(c => arrayIdsCids.includes(c.id))
}

const prepararEdicao = (atestado) => {
  form.value = { ...atestado }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelarEdicao = () => { form.value = estadoInicialForm() }

const atestadosFiltrados = computed(() => {
  let lista = [...atestados.value]
  if (termoBusca.value) {
    const termo = termoBusca.value.toLowerCase()
    lista = lista.filter(a => {
      const codAut = a.codigo_autenticacao.toLowerCase()
      const pNome = obterNomePacientePorConsulta(a.consulta).toLowerCase()
      const mNome = obterNomeMedicoPorConsulta(a.consulta).toLowerCase()
      const possuiCidFiltrado = mapearCidsDoAtestado(a.cid).some(c =>
        c.cod_cid.toLowerCase().includes(termo) || c.descricao.toLowerCase().includes(termo)
      )
      return codAut.includes(termo) || pNome.includes(termo) || mNome.includes(termo) || possuiCidFiltrado
    })
  }
  lista.sort((a, b) => {
    const da = new Date(a.data_inicio_afastamento)
    const db = new Date(b.data_inicio_afastamento)
    return ordenacaoSelecionada.value === 'data_asc' ? da - db : db - da
  })
  return lista
})

onMounted(() => { carregarDadosDoSistema() })
</script>
