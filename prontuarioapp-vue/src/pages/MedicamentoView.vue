<template>
  <q-page padding>
    <div class="text-h4 text-weight-bold q-mb-md">Farmácia - Catálogo de Medicamentos</div>

    <MedicamentoCard v-model="form" @salvar="salvarMedicamento" @cancelar="cancelarEdicao" />

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
              style="min-width: 220px"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="text-subtitle1 text-weight-bold q-mb-md">Medicamentos Cadastrados</div>
    <q-inner-loading :showing="carregando" label="Buscando registros no servidor Django..." />
    <div v-if="!carregando">
      <p v-if="medicamentosFiltrados.length === 0" class="text-grey-7">Nenhum medicamento encontrado na base de dados.</p>
      <MedicamentoItem
        v-for="medicamento in medicamentosFiltrados"
        :key="medicamento.id"
        :medicamento="medicamento"
        @editar="prepararEdicao"
        @deletar="deletarMedicamento"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api.js'
import MedicamentoCard from '../components/MedicamentoCard.vue'
import MedicamentoItem from '../components/MedicamentoItem.vue'

const $q = useQuasar()
const medicamentos = ref([])
const carregando = ref(true)
const termoBusca = ref('')
const ordenacaoSelecionada = ref('nome_asc')

const opcoesOrdenacao = [
  { label: 'Nome de referência (A-Z)', value: 'nome_asc' },
  { label: 'Nome de referência (Z-A)', value: 'nome_desc' },
  { label: 'Princípio ativo (A-Z)', value: 'ativo_asc' },
]

const estadoInicialForm = () => ({
  id: null, nome_referencia: '', principio_ativo: '', categoria: '', e_controlado: false, tem_generico: true
})

const form = ref(estadoInicialForm())

const buscarMedicamentos = async () => {
  carregando.value = true
  try {
    const response = await api.get('medicamento/api/')
    medicamentos.value = response.data
  } catch (error) {
    console.error('Erro ao carregar medicamentos do Django:', error)
  } finally {
    carregando.value = false
  }
}

const salvarMedicamento = async () => {
  try {
    if (form.value.id) {
      await api.patch(`medicamento/api/${form.value.id}/`, form.value)
      $q.notify({ type: 'positive', message: 'Medicamento atualizado com sucesso!' })
    } else {
      await api.post('medicamento/api/', form.value)
      $q.notify({ type: 'positive', message: 'Medicamento cadastrado com sucesso!' })
    }
    form.value = estadoInicialForm()
    buscarMedicamentos()
  } catch (error) {
    console.error('Erro ao salvar medicamento no Django:', error.response?.data || error)
    $q.notify({ type: 'negative', message: 'Falha ao salvar. Verifique os campos preenchidos.' })
  }
}

const deletarMedicamento = (id) => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: 'Tem certeza que deseja remover este medicamento definitivamente do catálogo?',
    cancel: { label: 'Cancelar', flat: true, color: 'grey' },
    ok: { label: 'Excluir', color: 'negative' },
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`medicamento/api/${id}/`)
      $q.notify({ type: 'positive', message: 'Medicamento excluído com sucesso!' })
      buscarMedicamentos()
    } catch (error) {
      console.error('Erro ao tentar deletar do Django:', error)
      if (error.response) {
        $q.notify({ type: 'negative', message: 'Não é possível excluir este medicamento. Ele possui dependências de histórico clínico (está vinculado a uma ou mais receitas ativas).' })
      } else {
        $q.notify({ type: 'negative', message: 'Falha na comunicação com a API. Verifique a sua conexão.' })
      }
    }
  })
}

const prepararEdicao = (medicamento) => {
  form.value = { ...medicamento }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelarEdicao = () => { form.value = estadoInicialForm() }

const medicamentosFiltrados = computed(() => {
  let lista = [...medicamentos.value]
  if (termoBusca.value) {
    const termo = termoBusca.value.toLowerCase()
    lista = lista.filter(med =>
      med.nome_referencia.toLowerCase().includes(termo) || med.principio_ativo.toLowerCase().includes(termo)
    )
  }
  lista.sort((a, b) => {
    if (ordenacaoSelecionada.value === 'ativo_asc') {
      return a.principio_ativo.localeCompare(b.principio_ativo, 'pt-BR')
    }
    const cmp = a.nome_referencia.localeCompare(b.nome_referencia, 'pt-BR')
    return ordenacaoSelecionada.value === 'nome_desc' ? -cmp : cmp
  })
  return lista
})

onMounted(() => { buscarMedicamentos() })
</script>
