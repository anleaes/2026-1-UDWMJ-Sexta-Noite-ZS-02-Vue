<template>
  <q-page padding>
    <div class="q-mb-lg">
      <div class="text-h4 text-weight-bold text-secondary">Painel de Controle Clínico</div>
      <div class="text-grey-7">Visão geral do ecossistema de atendimento e indicadores em tempo real</div>
    </div>

    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12 col-sm-6 col-md-3" v-for="metric in metricCards" :key="metric.key">
        <q-card bordered class="metric-card" :style="{ borderLeft: `4px solid ${metric.color}` }">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-caption text-grey-7 text-weight-medium text-uppercase">{{ metric.title }}</div>
              <q-badge color="grey-3" text-color="grey-7">{{ metric.badge }}</q-badge>
            </div>
            <div class="text-h3 text-weight-bold text-secondary q-mt-sm">{{ totais[metric.key] }}</div>
            <div class="text-caption text-grey-6">{{ metric.subtitle }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="text-h6 text-weight-bold text-grey-8 q-mb-md">Módulos de Acesso Rápido</div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="modulo in modulos" :key="modulo.to">
        <q-card bordered class="module-card cursor-pointer" @click="$router.push(modulo.to)">
          <q-card-section class="row items-center no-wrap q-gutter-md">
            <q-avatar :style="{ backgroundColor: modulo.bg }" size="48px" class="text-h6">
              {{ modulo.icon }}
            </q-avatar>
            <div>
              <div class="text-subtitle1 text-weight-bold">{{ modulo.title }}</div>
              <div class="text-caption text-grey-7">{{ modulo.desc }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api.js'

const totais = ref({ consultas: 0, exames: 0, medicamentos: 0, receitas: 0 })

const metricCards = [
  { key: 'consultas', title: 'Consultas Agendadas', badge: 'REG', subtitle: 'Pacientes do dia', color: '#2563eb' },
  { key: 'exames', title: 'Exames & Laudos', badge: 'LAB', subtitle: 'Aguardando resultado', color: '#ea580c' },
  { key: 'medicamentos', title: 'Catálogo de Fórmulas', badge: 'MED', subtitle: 'Itens ativos', color: '#16a34a' },
  { key: 'receitas', title: 'Prescrições Emitidas', badge: 'REC', subtitle: 'Histórico atualizado', color: '#7c3aed' },
]

const modulos = [
  { to: '/pacientes', icon: '👥', title: 'Pacientes', desc: 'Gerenciamento de cadastros e históricos', bg: '#eff6ff' },
  { to: '/medicos', icon: '🩺', title: 'Médicos', desc: 'Controle do corpo clínico', bg: '#f0fdfa' },
  { to: '/anamneses', icon: '📝', title: 'Anamneses', desc: 'Histórico de saúde e entrevistas', bg: '#f8fafc' },
  { to: '/consultas', icon: '📅', title: 'Consultas', desc: 'Agendamentos e retornos médicos', bg: '#eff6ff' },
  { to: '/cids', icon: '📋', title: 'Tabela CIDs', desc: 'Classificação Internacional de Doenças', bg: '#f8fafc' },
  { to: '/atestados', icon: '📄', title: 'Atestados Médicos', desc: 'Emissão de justificativas legais', bg: '#f0fdfa' },
  { to: '/medicamentos', icon: '📦', title: 'Medicamentos', desc: 'Controle de fórmulas e catálogo', bg: '#fff7ed' },
  { to: '/receitas', icon: '💊', title: 'Receitas', desc: 'Prescrições e posologias integradas', bg: '#faf5ff' },
  { to: '/exames-solicitados', icon: '🧪', title: 'Exames Solicitados', desc: 'Pedidos laboratoriais e diagnósticos', bg: '#e0e7ff' },
  { to: '/resultados-exames', icon: '📊', title: 'Resultados de Exames', desc: 'Emissão e visualização de laudos', bg: '#fef2f2' },
]

const carregarMétricasDoDashboard = async () => {
  try {
    const carregarContagem = async (url) => {
      try {
        const res = await api.get(url)
        return res.data?.length || 0
      } catch { return 0 }
    }
    totais.value.consultas = await carregarContagem('consulta/api/')
    totais.value.medicamentos = await carregarContagem('medicamento/api/')
    totais.value.receitas = await carregarContagem('receita/api/')

    let qtdExames = await carregarContagem('exameSolicitado/api/')
    if (qtdExames === 0) qtdExames = await carregarContagem('examesolicitado/api/')
    totais.value.exames = qtdExames
  } catch (error) {
    console.error('Erro nas métricas:', error)
  }
}

onMounted(() => { carregarMétricasDoDashboard() })
</script>

<style scoped>
.metric-card { transition: transform 0.2s; }
.metric-card:hover { transform: translateY(-2px); }
.module-card { transition: all 0.2s; }
.module-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
</style>
