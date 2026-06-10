<template>
  <q-page padding>
    <div class="text-h4 text-weight-bold q-mb-md">Catálogo de Classificação de Doenças (CID)</div>

    <CidCard v-model="form" @salvar="salvarCid" @cancelar="cancelarEdicao" />

    <q-card bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-md">Buscar no Catálogo</div>
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

    <div class="text-subtitle1 text-weight-bold q-mb-md">CIDs Cadastrados</div>
    <q-inner-loading :showing="carregando" label="Buscando registros no servidor Django..." />
    <div v-if="!carregando">
      <p v-if="cidsFiltrados.length === 0" class="text-grey-7">Nenhum CID encontrado na base de dados.</p>
      <CidItem
        v-for="cid in cidsFiltrados"
        :key="cid.id"
        :cid="cid"
        @editar="prepararEdicao"
        @deletar="deletarCid"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api.js'
import CidCard from '../components/CidCard.vue'
import CidItem from '../components/CidItem.vue'

const $q = useQuasar()
const cids = ref([])
const carregando = ref(true)
const termoBusca = ref('')
const ordenacaoSelecionada = ref('codigo_asc')

const opcoesOrdenacao = [
  { label: 'Código (A-Z)', value: 'codigo_asc' },
  { label: 'Código (Z-A)', value: 'codigo_desc' },
  { label: 'Descrição (A-Z)', value: 'descricao_asc' },
]

const estadoInicialForm = () => ({
  id: null, cod_cid: '', descricao: '', sintomas: '', tipo: '', status_ativo: true
})

const form = ref(estadoInicialForm())

const buscarCids = async () => {
  carregando.value = true
  try {
    const response = await api.get('cid/api/')
    cids.value = response.data
  } catch (error) {
    console.error('Erro ao carregar CIDs do Django:', error)
  } finally {
    carregando.value = false
  }
}

const salvarCid = async () => {
  try {
    if (form.value.id) {
      await api.patch(`cid/api/${form.value.id}/`, form.value)
      $q.notify({ type: 'positive', message: 'CID atualizado com sucesso!' })
    } else {
      await api.post('cid/api/', form.value)
      $q.notify({ type: 'positive', message: 'CID cadastrado com sucesso!' })
    }
    form.value = estadoInicialForm()
    buscarCids()
  } catch (error) {
    console.error('Erro ao salvar CID no Django:', error.response?.data || error)
    $q.notify({ type: 'negative', message: 'Falha ao salvar. Verifique se o código informado já não está cadastrado.' })
  }
}

const deletarCid = (id) => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: 'Tem certeza que deseja remover este CID definitivamente do catálogo?',
    cancel: { label: 'Cancelar', flat: true, color: 'grey' },
    ok: { label: 'Excluir', color: 'negative' },
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`cid/api/${id}/`)
      buscarCids()
    } catch (error) {
      console.error('Erro ao deletar registro do Django:', error)
    }
  })
}

const prepararEdicao = (cid) => {
  form.value = { ...cid }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelarEdicao = () => { form.value = estadoInicialForm() }

const cidsFiltrados = computed(() => {
  let lista = [...cids.value]
  if (termoBusca.value) {
    const termo = termoBusca.value.toLowerCase()
    lista = lista.filter(cid =>
      cid.cod_cid.toLowerCase().includes(termo) || cid.descricao.toLowerCase().includes(termo)
    )
  }
  lista.sort((a, b) => {
    if (ordenacaoSelecionada.value === 'descricao_asc') {
      return a.descricao.localeCompare(b.descricao, 'pt-BR')
    }
    const cmp = a.cod_cid.localeCompare(b.cod_cid, 'pt-BR')
    return ordenacaoSelecionada.value === 'codigo_desc' ? -cmp : cmp
  })
  return lista
})

onMounted(() => { buscarCids() })
</script>
