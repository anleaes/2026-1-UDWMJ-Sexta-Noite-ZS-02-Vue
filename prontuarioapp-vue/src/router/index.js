import { createRouter, createWebHistory } from 'vue-router'

// Ajuste: remova o .vue/index.js e aponte direto para o arquivo .vue
import PacienteView from '../pages/PacienteView.vue'
import MedicoView from '../pages/MedicoView.vue'
import AnamneseView from '../pages/AnamneseView.vue'
import ConsultaView from '../pages/ConsultaView.vue'
import CidView from '../pages/CidView.vue'
import AtestadoView from '../pages/AtestadoView.vue'
import MedicamentoView from '../pages/MedicamentoView.vue'
import ReceitaView from '../pages/ReceitaView.vue'
import ExameSolicitadoView from '../pages/ExameSolicitadoView.vue'
import ResultadoExameView from '../pages/ResultadoExameView.vue'
import HomeView from '../pages/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Rota Raiz agora carrega o Dashboard de forma absoluta
    { path: '/', name: 'Home', component: HomeView },
    
    // Demais rotas do ecossistema clínico
    { path: '/pacientes', name: 'pacientes', component: PacienteView },
    { path: '/medicos', name: 'medicos', component: MedicoView },
    { path: '/anamneses', name: 'anamneses', component: AnamneseView },
    { path: '/consultas', name: 'consultas', component: ConsultaView },
    { path: '/cids', name: 'cids', component: CidView },
    { path: '/atestados', name: 'atestados', component: AtestadoView },
    { path: '/medicamentos', name: 'medicamentos', component: MedicamentoView },
    { path: '/receitas', name: 'receitas', component: ReceitaView },
    { path: '/exames-solicitados', name: 'examesSolicitados', component: ExameSolicitadoView },
    { path: '/resultados-exames', name: 'resultadosExames', component: ResultadoExameView }
  ],
})

export default router