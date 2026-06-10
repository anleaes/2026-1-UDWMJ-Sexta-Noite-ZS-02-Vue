<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-secondary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title class="text-weight-bold">
          Prontuário de Saúde Integrado
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="sidebar-drawer"
    >
      <q-list padding>
        <q-item-label header class="text-accent text-weight-bold">
          Navegação Clínica
        </q-item-label>

        <q-item
          v-for="item in navItems"
          :key="item.to"
          clickable
          v-ripple
          :to="item.to"
          :exact="item.exact"
          active-class="nav-active"
        >
          <q-item-section avatar>
            <span class="nav-emoji">{{ item.icon }}</span>
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container class="bg-grey-2">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(true)

const navItems = [
  { to: '/', icon: '📊', label: 'Dashboard', exact: true },
  { to: '/pacientes', icon: '👥', label: 'Pacientes' },
  { to: '/medicos', icon: '🩺', label: 'Médicos' },
  { to: '/anamneses', icon: '📝', label: 'Anamneses' },
  { to: '/consultas', icon: '📅', label: 'Consultas' },
  { to: '/cids', icon: '📋', label: 'Tabela CIDs' },
  { to: '/atestados', icon: '📄', label: 'Atestados Médicos' },
  { to: '/medicamentos', icon: '📦', label: 'Medicamentos' },
  { to: '/receitas', icon: '💊', label: 'Receitas' },
  { to: '/exames-solicitados', icon: '🧪', label: 'Exames Solicitados' },
  { to: '/resultados-exames', icon: '📊', label: 'Resultados de Exames' },
]
</script>

<style scoped>
.sidebar-drawer {
  background-color: #0f172a;
  color: #f8fafc;
}

.sidebar-drawer :deep(.q-item) {
  color: #94a3b8;
  border-radius: 8px;
  margin: 2px 8px;
}

.sidebar-drawer :deep(.q-item:hover) {
  background-color: #1e293b;
  color: #f8fafc;
}

.sidebar-drawer :deep(.nav-active) {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
  color: #ffffff !important;
  font-weight: 600;
}

.sidebar-drawer :deep(.q-item__label--header) {
  color: #38bdf8;
}

.nav-emoji {
  font-size: 18px;
  line-height: 1;
}
</style>
