<template>
  <q-page padding>
    <div class="text-h4 text-weight-bold q-mb-md">Resultados e Laudos de Exames</div>

    <ResultadoExameCard
      v-model="form"
      :listaExames="exames"
      @salvar="salvarResultado"
      @cancelar="cancelarEdicao"
    />

    <q-card bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-md">Filtrar Laudos</div>
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

    <div class="text-subtitle1 text-weight-bold q-mb-md">Laudos Registrados</div>
    <q-inner-loading :showing="carregando" label="Buscando laudos laboratoriais no servidor Django..." />
    <div v-if="!carregando">
      <p v-if="resultadosFiltrados.length === 0" class="text-grey-7">Nenhum laudo de exame localizado.</p>
      <ResultadoExameItem
        v-for="resultado in resultadosFiltrados"
        :key="resultado.id"
        :resultado="resultado"
        :nomeExame="obterNomeExame(resultado.exame_solicitado)"
        @editar="prepararEdicao"
        @deletar="deletarResultado"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api.js'
import ResultadoExameCard from '../components/ResultadoExameCard.vue'
import ResultadoExameItem from '../components/ResultadoExameItem.vue'

const $q = useQuasar()
const resultados = ref([])
const exames = ref([])
const carregando = ref(true)
const termoBusca = ref('')
const ordenacaoSelecionada = ref('data_desc')

const opcoesOrdenacao = [
  { label: 'Data do resultado (mais recente)', value: 'data_desc' },
  { label: 'Data do resultado (mais antiga)', value: 'data_asc' },
]

const estadoInicialForm = () => ({
  id: null, data_resultado: '', conclusoes: '', valor: '', unidade_medida: '', exame_solicitado: ''
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
        console.warn(`Aviso: Falha sutil ao tentar mapear endpoint [${url}].`)
        return []
      }
    }

    let dadosExames = await carregarTabela('exameSolicitado/api/')
    if (dadosExames.length === 0) dadosExames = await carregarTabela('examesolicitado/api/')
    exames.value = dadosExames

    resultados.value = await carregarTabela('resultadoexame/api/')
  } catch (error) {
    console.error('Erro geral no carregamento de laudos:', error)
  } finally {
    carregando.value = false
  }
}

const salvarResultado = async () => {
  try {
    if (form.value.id) {
      await api.put(`resultadoexame/api/${form.value.id}/`, form.value)
      $q.notify({ type: 'positive', message: 'Laudo de resultado atualizado!' })
    } else {
      await api.post('resultadoexame/api/', form.value)
      $q.notify({ type: 'positive', message: 'Laudo de exame lançado com sucesso!' })
    }
    form.value = estadoInicialForm()
    carregarDadosDoSistema()
  } catch (error) {
    console.error('Erro ao salvar resultado de exame:', error)
    $q.notify({ type: 'negative', message: 'Falha ao salvar. Verifique se os dados numéricos e campos textuais foram preenchidos.' })
  }
}

const deletarResultado = (id) => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: 'Tem certeza de que deseja excluir permanentemente este laudo?',
    cancel: { label: 'Cancelar', flat: true, color: 'grey' },
    ok: { label: 'Excluir', color: 'negative' },
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`resultadoexame/api/${id}/`)
      carregarDadosDoSistema()
    } catch (error) {
      console.error('Erro ao deletar registro:', error)
    }
  })
}

const obterNomeExame = (idExame) => {
  const ex = exames.value.find(item => item.id === idExame)
  return ex ? ex.nome_exame : 'Exame não identificado'
}

const prepararEdicao = (resultado) => {
  form.value = { ...resultado }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelarEdicao = () => { form.value = estadoInicialForm() }

const resultadosFiltrados = computed(() => {
  let lista = [...resultados.value]
  if (termoBusca.value) {
    const termo = termoBusca.value.toLowerCase()
    lista = lista.filter(res => {
      const conc = res.conclusoes.toLowerCase()
      const exNome = obterNomeExame(res.exame_solicitado).toLowerCase()
      return conc.includes(termo) || exNome.includes(termo)
    })
  }
  lista.sort((a, b) => {
    const da = new Date(a.data_resultado)
    const db = new Date(b.data_resultado)
    return ordenacaoSelecionada.value === 'data_asc' ? da - db : db - da
  })
  return lista
})

onMounted(() => { carregarDadosDoSistema() })
</script>
