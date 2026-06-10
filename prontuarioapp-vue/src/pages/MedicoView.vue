<template>
  <q-page padding>
    <div class="text-h4 text-weight-bold q-mb-md">Controle de Médicos</div>

    <MedicoCard v-model="form" @salvar="salvarMedico" @cancelar="cancelarEdicao" />

    <q-card bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-md">Buscar Médico</div>
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

    <div class="text-subtitle1 text-weight-bold q-mb-md">Médicos Cadastrados</div>
    <q-inner-loading :showing="carregando" label="Buscando registros no servidor Django..." />
    <div v-if="!carregando">
      <p v-if="medicosFiltrados.length === 0" class="text-grey-7">Nenhum médico encontrado.</p>
      <MedicoItem
        v-for="medico in medicosFiltrados"
        :key="medico.id"
        :medico="medico"
        @editar="prepararEdicao"
        @deletar="deletarMedico"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api.js'
import MedicoCard from '../components/MedicoCard.vue'
import MedicoItem from '../components/MedicoItem.vue'

const $q = useQuasar()
const medicos = ref([])
const carregando = ref(true)
const termoBusca = ref('')
const ordenacaoSelecionada = ref('nome_asc')

const opcoesOrdenacao = [
  { label: 'Nome (A-Z)', value: 'nome_asc' },
  { label: 'Nome (Z-A)', value: 'nome_desc' },
]

const estadoInicialForm = () => ({
  id: null, nome: '', sobrenome: '', cpf: '', telefone: '', email: '',
  crm: '', especialidade: 'Clínico Geral', matricula: '', data_contratacao: '', cargo: '', esta_ativo: true
})

const form = ref(estadoInicialForm())

const buscarMedicos = async () => {
  carregando.value = true
  try {
    const response = await api.get('medico/api/')
    medicos.value = response.data
  } catch (error) {
    console.error('Erro ao carregar médicos do Django:', error)
  } finally {
    carregando.value = false
  }
}

const salvarMedico = async () => {
  try {
    if (form.value.id) {
      await api.patch(`medico/api/${form.value.id}/`, form.value)
      $q.notify({ type: 'positive', message: 'Médico atualizado com sucesso!' })
    } else {
      await api.post('medico/api/', form.value)
      $q.notify({ type: 'positive', message: 'Médico cadastrado com sucesso!' })
    }
    form.value = estadoInicialForm()
    buscarMedicos()
  } catch (error) {
    console.error('Erro ao salvar médico no Django:', error.response?.data || error)
    $q.notify({ type: 'negative', message: 'Falha ao salvar médico. Verifique os campos preenchidos.' })
  }
}

const deletarMedico = (id) => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: 'Tem certeza que deseja excluir em definitivo este médico?',
    cancel: { label: 'Cancelar', flat: true, color: 'grey' },
    ok: { label: 'Excluir', color: 'negative' },
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`medico/api/${id}/`)
      buscarMedicos()
    } catch (error) {
      console.error('Erro ao deletar médico do Django:', error)
    }
  })
}

const prepararEdicao = (medico) => {
  form.value = { ...medico }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelarEdicao = () => { form.value = estadoInicialForm() }

const medicosFiltrados = computed(() => {
  let lista = [...medicos.value]
  if (termoBusca.value) {
    const termo = termoBusca.value.toLowerCase()
    lista = lista.filter(m => {
      const nomeCompleto = `${m.nome} ${m.sobrenome}`.toLowerCase()
      return nomeCompleto.includes(termo) || m.especialidade.toLowerCase().includes(termo)
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

onMounted(() => { buscarMedicos() })
</script>
