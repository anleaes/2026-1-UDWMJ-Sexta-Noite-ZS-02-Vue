<template>
  <div class="app-layout" :class="{ 'sidebar-collapsed': isCollapsed }">
    
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand-wrapper" v-if="!isCollapsed">
          <span class="brand-icon">🏥</span>
          <div class="brand-text-group">
            <span class="brand-title">Prontuário de Saúde</span>
            <span class="brand-subtitle">Integrado</span>
          </div>
        </div>
        <div class="brand-icon-only" v-else>
          <span>🏥</span>
        </div>
        
        <button @click="toggleSidebar" class="btn-toggle-sidebar" title="Alternar Menu">
          <span class="toggle-icon">{{ isCollapsed ? '❯' : '❮' }}</span>
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" exact-active-class="active-link" title="Painel Principal">
          <span class="nav-icon">📊</span>
          <span class="nav-text" v-if="!isCollapsed">Dashboard</span>
        </router-link>

        <router-link to="/pacientes" class="nav-item" exact-active-class="active-link" title="Controle de Pacientes">
          <span class="nav-icon">👥</span>
          <span class="nav-text" v-if="!isCollapsed">Pacientes</span>
        </router-link>

        <router-link to="/medicos" class="nav-item" exact-active-class="active-link" title="Corpo Clínico">
          <span class="nav-icon">🩺</span>
          <span class="nav-text" v-if="!isCollapsed">Médicos</span>
        </router-link>

        <router-link to="/anamneses" class="nav-item" exact-active-class="active-link" title="Histórico de Anamneses">
          <span class="nav-icon">📝</span>
          <span class="nav-text" v-if="!isCollapsed">Anamneses</span>
        </router-link>

        <router-link to="/consultas" class="nav-item" exact-active-class="active-link" title="Agendamento de Consultas">
          <span class="nav-icon">📅</span>
          <span class="nav-text" v-if="!isCollapsed">Consultas</span>
        </router-link>

        <router-link to="/cids" class="nav-item" exact-active-class="active-link" title="Catálogo CID-10">
          <span class="nav-icon">📋</span>
          <span class="nav-text" v-if="!isCollapsed">Tabela CIDs</span>
        </router-link>

        <router-link to="/atestados" class="nav-item" exact-active-class="active-link" title="Emissão de Atestados">
          <span class="nav-icon">📄</span>
          <span class="nav-text" v-if="!isCollapsed">Atestados Médicos</span>
        </router-link>

        <router-link to="/medicamentos" class="nav-item" exact-active-class="active-link" title="Estoque de Medicamentos">
          <span class="nav-icon">📦</span>
          <span class="nav-text" v-if="!isCollapsed">Medicamentos</span>
        </router-link>

        <router-link to="/receitas" class="nav-item" exact-active-class="active-link" title="Prescrições Emitidas">
          <span class="nav-icon">💊</span>
          <span class="nav-text" v-if="!isCollapsed">Receitas</span>
        </router-link>

        <router-link to="/exames-solicitados" class="nav-item" exact-active-class="active-link" title="Solicitações Laboratoriais">
          <span class="nav-icon">🧪</span>
          <span class="nav-text" v-if="!isCollapsed">Exames Solicitados</span>
        </router-link>

        <router-link to="/resultados-exames" class="nav-item" exact-active-class="active-link" title="Laudos de Exames">
          <span class="nav-icon">📊</span>
          <span class="nav-text" v-if="!isCollapsed">Resultados de Exames</span>
        </router-link>
      </nav>
    </aside>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isCollapsed = ref(false);
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
/* Importação Direta da Fonte Corporativa Inter (Google Fonts) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.app-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
  transition: grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* Aplica a fonte Inter em todo o escopo do layout */
  font-family: 'Inter', -apple-system, sans-serif;
}

.app-layout.sidebar-collapsed {
  grid-template-columns: 70px 1fr;
}

.sidebar {
  background-color: #0f172a; /* Tom Slate Ultra Escuro (Mais moderno que o anterior) */
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #1e293b;
  overflow-x: hidden;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 100;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 16px;
  border-bottom: 1px solid #1e293b;
  height: 75px;
  box-sizing: border-box;
}

.brand-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}
.brand-icon { font-size: 22px; }
.brand-text-group { display: flex; flex-direction: column; line-height: 1.2; }
.brand-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #f8fafc;
  text-transform: uppercase;
}
.brand-subtitle {
  font-size: 11px;
  font-weight: 600;
  color: #38bdf8;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}
.brand-icon-only {
  width: 100%;
  display: flex;
  justify-content: center;
  font-size: 22px;
}

.btn-toggle-sidebar {
  background: #1e293b;
  border: none;
  color: #64748b;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.btn-toggle-sidebar:hover {
  background: #334155;
  color: #f8fafc;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 8px;
}

/* Customização dos Itens com Efeitos de Transição Profissionais */
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  /* Transição suave para cor, fundo e deslocamento lateral */
  transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

/* Efeito Hover Inteligente (Dá um leve slide para a direita e acende o texto) */
.nav-item:hover {
  background-color: #1e293b;
  color: #f8fafc;
  transform: translateX(4px); /* Efeito suave de movimento lateral */
}

/* Nova classe ativa forçada via exact-active-class */
.active-link {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important; /* Degradê médico sutil */
  color: #ffffff !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25); /* Glow azul profissional sob o botão ativo */
  transform: none !important; /* Trava o botão ativo para não deslocar no hover */
}

.nav-icon {
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
}

.main-content {
  background-color: #f4f6f8;
  overflow-y: auto;
}

.sidebar-collapsed .nav-item {
  justify-content: center;
  padding: 12px 0;
}
.sidebar-collapsed .nav-item:hover {
  transform: scale(1.05); /* No modo encolhido ele dá um leve zoom em vez de mover para o lado */
}
</style>