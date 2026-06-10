<template>
  <div class="dashboard-wrapper">
    <header class="dashboard-header">
      <div class="header-titles">
        <h1>Painel de Controle Clínico</h1>
        <p>Visão geral do ecossistema de atendimento e indicadores em tempo real</p>
      </div>
    </header>

    <section class="metrics-grid">
      <div class="metric-card branch-blue">
        <div class="metric-header">
          <span class="metric-title">Consultas Agendadas</span>
          <div class="mini-icon">REG</div>
        </div>
        <div class="metric-body">
          <span class="metric-value">{{ totais.consultas }}</span>
          <span class="metric-badge">Pacientes do dia</span>
        </div>
      </div>

      <div class="metric-card branch-orange">
        <div class="metric-header">
          <span class="metric-title">Exames & Laudos</span>
          <div class="mini-icon">LAB</div>
        </div>
        <div class="metric-body">
          <span class="metric-value">{{ totais.exames }}</span>
          <span class="metric-badge">Aguardando resultado</span>
        </div>
      </div>

      <div class="metric-card branch-green">
        <div class="metric-header">
          <span class="metric-title">Catálogo de Fórmulas</span>
          <div class="mini-icon">MED</div>
        </div>
        <div class="metric-body">
          <span class="metric-value">{{ totais.medicamentos }}</span>
          <span class="metric-badge">Itens ativos</span>
        </div>
      </div>

      <div class="metric-card branch-purple">
        <div class="metric-header">
          <span class="metric-title">Prescrições Emitidas</span>
          <div class="mini-icon">REC</div>
        </div>
        <div class="metric-body">
          <span class="metric-value">{{ totais.receitas }}</span>
          <span class="metric-badge">Histórico atualizado</span>
        </div>
      </div>
    </section>

    <section class="actions-section">
      <h2 class="section-title">Módulos de Acesso Rápido</h2>
      
      <div class="actions-grid">
        <router-link to="/pacientes" class="action-tile">
          <div class="tile-icon-wrapper blue">👥</div>
          <div class="tile-content">
            <h3>Pacientes</h3>
            <p>Gerenciamento de cadastros e históricos de pacientes</p>
          </div>
        </router-link>

        <router-link to="/medicos" class="action-tile">
          <div class="tile-icon-wrapper teal">🩺</div>
          <div class="tile-content">
            <h3>Médicos</h3>
            <p>Controle do corpo clínico e especialidades</p>
          </div>
        </router-link>

        <router-link to="/anamneses" class="action-tile">
          <div class="tile-icon-wrapper gray">📝</div>
          <div class="tile-content">
            <h3>Anamneses</h3>
            <p>Histórico de saúde e entrevistas iniciais</p>
          </div>
        </router-link>

        <router-link to="/consultas" class="action-tile">
          <div class="tile-icon-wrapper blue">📅</div>
          <div class="tile-content">
            <h3>Consultas</h3>
            <p>Agendamentos de horários e retornos médicos</p>
          </div>
        </router-link>

        <router-link to="/cids" class="action-tile">
          <div class="tile-icon-wrapper gray">📋</div>
          <div class="tile-content">
            <h3>Tabela CIDs</h3>
            <p>Classificação Internacional de Doenças</p>
          </div>
        </router-link>

        <router-link to="/atestados" class="action-tile">
          <div class="tile-icon-wrapper teal">📄</div>
          <div class="tile-content">
            <h3>Atestados Médicos</h3>
            <p>Emissão de justificativas e dispensas legais</p>
          </div>
        </router-link>

        <router-link to="/medicamentos" class="action-tile">
          <div class="tile-icon-wrapper orange">📦</div>
          <div class="tile-content">
            <h3>Medicamentos</h3>
            <p>Controle de fórmulas e catálogo ativo</p>
          </div>
        </router-link>

        <router-link to="/receitas" class="action-tile">
          <div class="tile-icon-wrapper purple">💊</div>
          <div class="tile-content">
            <h3>Receitas</h3>
            <p>Prescrições e posologias médicas integradas</p>
          </div>
        </router-link>

        <router-link to="/exames-solicitados" class="action-tile">
          <div class="tile-icon-wrapper indigo">🧪</div>
          <div class="tile-content">
            <h3>Exames Solicitados</h3>
            <p>Pedidos de análises laboratoriais e diagnósticos</p>
          </div>
        </router-link>

        <router-link to="/resultados-exames" class="action-tile">
          <div class="tile-icon-wrapper red">📊</div>
          <div class="tile-content">
            <h3>Resultados de Exames</h3>
            <p>Emissão e visualização de laudos técnicos</p>
          </div>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api.js';

const totais = ref({ consultas: 0, exames: 0, medicamentos: 0, receitas: 0 });

const carregarMétricasDoDashboard = async () => {
  try {
    const carregarContagem = async (url) => {
      try {
        const res = await api.get(url);
        return res.data?.length || 0;
      } catch { return 0; }
    };
    totais.value.consultas = await carregarContagem('consulta/api/');
    totais.value.medicamentos = await carregarContagem('medicamento/api/');
    totais.value.receitas = await carregarContagem('receita/api/');
    
    let qtdExames = await carregarContagem('exameSolicitado/api/');
    if (qtdExames === 0) qtdExames = await carregarContagem('examesolicitado/api/');
    totais.value.exames = qtdExames;
  } catch (error) {
    console.error("Erro nas métricas:", error);
  }
};

onMounted(() => { carregarMétricasDoDashboard(); });
</script>

<style scoped>
.dashboard-wrapper {
  padding: 32px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: #f4f6f8;
  min-height: 100vh;
  color: #1e293b;
}
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 20px;
}
.header-titles h1 {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}
.header-titles p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}
.metric-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}
.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}
.branch-blue::before { background-color: #2563eb; }
.branch-orange::before { background-color: #ea580c; }
.branch-green::before { background-color: #16a34a; }
.branch-purple::before { background-color: #7c3aed; }

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.metric-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.mini-icon {
  font-size: 11px;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  color: #94a3b8;
  font-weight: bold;
}
.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
  margin-bottom: 6px;
}
.metric-badge {
  font-size: 12px;
  color: #94a3b8;
}
.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 20px;
}
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}
.action-tile {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
  transition: all 0.2s ease;
}
.action-tile:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}
.tile-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.tile-icon-wrapper.blue { background-color: #eff6ff; }
.tile-icon-wrapper.gray { background-color: #f8fafc; }
.tile-icon-wrapper.teal { background-color: #f0fdfa; }
.tile-icon-wrapper.orange { background-color: #fff7ed; }
.tile-icon-wrapper.purple { background-color: #faf5ff; }
.tile-icon-wrapper.indigo { background-color: #e0e7ff; }
.tile-icon-wrapper.red { background-color: #fef2f2; }

.tile-content h3 {
  margin: 0 0 2px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}
.tile-content p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}
</style>