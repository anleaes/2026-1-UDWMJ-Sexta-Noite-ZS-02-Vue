<template>
  <q-page padding>
    <div class="text-h4 text-weight-bold q-mb-md">Emissão e Controle de Receitas</div>

    <ReceitaCard
      v-model="form"
      :listaConsultas="consultas"
      :listaMedicamentos="medicamentos"
      :obterNomePaciente="obterNomePacientePorId"
      @salvar="salvarReceita"
      @cancelar="cancelarEdicao"
    />

    <q-card bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-md">Buscar Receitas Emitidas</div>
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

    <div class="text-subtitle1 text-weight-bold q-mb-md">Histórico de Prescrições</div>
    <q-inner-loading :showing="carregando" label="Buscando receitas no servidor Django..." />
    <div v-if="!carregando">
      <p v-if="receitasFiltrados.length === 0" class="text-grey-7">Nenhuma receita localizada no sistema.</p>
      <ReceitaItem
        v-for="receita in receitasFiltrados"
        :key="receita.id"
        :receita="receita"
        :nomePaciente="obterNomePacientePorConsulta(receita.consulta)"
        :nomeMedico="obterNomeMedicoPorConsulta(receita.consulta)"
        :medsDaReceita="obterMedsPosologiaDaReceita(receita.id)"
        @editar="prepararEdicao"
        @deletar="deletarReceita"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api.js'
import ReceitaCard from '../components/ReceitaCard.vue'
import ReceitaItem from '../components/ReceitaItem.vue'

const $q = useQuasar()
const receitas = ref([])
const consultas = ref([])
const pacientes = ref([])
const medicos = ref([])
const medicamentos = ref([])
const intermediariosReceitaMed = ref([])
const carregando = ref(true)
const termoBusca = ref('')
const ordenacaoSelecionada = ref('data_desc')

const opcoesOrdenacao = [
  { label: 'Data de emissão (mais recente)', value: 'data_desc' },
  { label: 'Data de emissão (mais antiga)', value: 'data_asc' },
]

const estadoInicialForm = () => ({
  id: null, consulta: '', data_emissao: '', validade: '', instrucoes: '', e_digital: true, itensMedicamentos: []
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
        console.warn(`Aviso: Rota [${url}] não respondeu corretamente. Retornando dados vazios.`)
        return []
      }
    }

    receitas.value = await carregarTabela('receita/api/')
    consultas.value = await carregarTabela('consulta/api/')
    pacientes.value = await carregarTabela('paciente/api/')
    medicos.value = await carregarTabela('medico/api/')
    medicamentos.value = await carregarTabela('medicamento/api/')

    let dadosIntermediarios = await carregarTabela('receitamedicamento/api/')
    if (dadosIntermediarios.length === 0) {
      dadosIntermediarios = await carregarTabela('receitaMedicamento/api/')
    }
    intermediariosReceitaMed.value = dadosIntermediarios
  } catch (error) {
    console.error('Erro geral no carregamento:', error)
  } finally {
    carregando.value = false
  }
}

const salvarReceita = async () => {
  try {
    const payloadBase = {
      consulta: form.value.consulta,
      data_emissao: form.value.data_emissao,
      validade: form.value.validade,
      instrucoes: form.value.instrucoes,
      e_digital: form.value.e_digital
    }

    if (form.value.id) {
      await api.patch(`receita/api/${form.value.id}/`, payloadBase)
      $q.notify({ type: 'positive', message: 'Receita atualizada com sucesso!' })
    } else {
      const resNovaReceita = await api.post('receita/api/', payloadBase)
      const idReceitaGerada = resNovaReceita.data.id

      const listaPromises = form.value.itensMedicamentos.map(item => {
        const dadosLinha = {
          receita: idReceitaGerada,
          medicamento: item.medicamento,
          concentracao: item.concentracao,
          dose: item.dose,
          frequencia: item.frequencia,
          duracao_dias: item.duracao_dias
        }
        return api.post('receitamedicamento/api/', dadosLinha).catch(() =>
          api.post('receitaMedicamento/api/', dadosLinha)
        )
      })

      await Promise.all(listaPromises)
      $q.notify({ type: 'positive', message: 'Receita emitida com sucesso!' })
    }

    form.value = estadoInicialForm()
    carregarDadosDoSistema()
  } catch (error) {
    console.error('Erro ao salvar receita:', error)
    $q.notify({ type: 'negative', message: 'Falha ao salvar. Verifique os campos preenchidos.' })
  }
}

const deletarReceita = (id) => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: 'Tem certeza que deseja deletar esta receita?',
    cancel: { label: 'Cancelar', flat: true, color: 'grey' },
    ok: { label: 'Excluir', color: 'negative' },
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`receita/api/${id}/`)
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

const obterMedsPosologiaDaReceita = (idReceita) => {
  const relacoes = intermediariosReceitaMed.value.filter(r => r.receita === idReceita)
  return relacoes.map(r => {
    const medInfo = medicamentos.value.find(m => m.id === r.medicamento)
    return { ...r, nome_referencia: medInfo ? medInfo.nome_referencia : 'Medicamento' }
  })
}

const prepararEdicao = (receita) => {
  const copia = { ...receita }
  copia.itensMedicamentos = obterMedsPosologiaDaReceita(receita.id)
  form.value = copia
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelarEdicao = () => { form.value = estadoInicialForm() }

const receitasFiltrados = computed(() => {
  let lista = [...receitas.value]
  if (termoBusca.value) {
    const termo = termoBusca.value.toLowerCase()
    lista = lista.filter(r => {
      const pNome = obterNomePacientePorConsulta(r.consulta).toLowerCase()
      const mNome = obterNomeMedicoPorConsulta(r.consulta).toLowerCase()
      const instr = (r.instrucoes || '').toLowerCase()
      return pNome.includes(termo) || mNome.includes(termo) || instr.includes(termo)
    })
  }
  lista.sort((a, b) => {
    const da = new Date(a.data_emissao)
    const db = new Date(b.data_emissao)
    return ordenacaoSelecionada.value === 'data_asc' ? da - db : db - da
  })
  return lista
})

onMounted(() => { carregarDadosDoSistema() })
</script>
