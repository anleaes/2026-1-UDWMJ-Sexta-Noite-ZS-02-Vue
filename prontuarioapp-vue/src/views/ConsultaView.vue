<template>
  <div style="padding: 20px; font-family: sans-serif;">
    <h2>📅 Agendamento e Registro de Consultas</h2>
    <p>Controle operacional de agendas médicas, prioridades e triagem.</p>

    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <h3 style="margin-top: 0;">{{ editandoId ? '✏️ Remarcar / Alterar Consulta' : '➕ Agendar Nova Consulta' }}</h3>
      <form @submit.prevent="salvarConsulta" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
        <div style="display: flex; flex-direction: column;">
          <label style="font-size: 12px; font-weight: bold; margin-bottom: 2px;">Data e Hora:</label>
          <input v-model="consultaForm.data_agendada" type="datetime-local" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        </div>
        <div style="display: flex; flex-direction: column;">
          <label style="font-size: 12px; font-weight: bold; margin-bottom: 2px;">ID Paciente:</label>
          <input v-model.number="consultaForm.paciente" type="number" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        </div>
        <div style="display: flex; flex-direction: column;">
          <label style="font-size: 12px; font-weight: bold; margin-bottom: 2px;">ID Médico:</label>
          <input v-model.number="consultaForm.medico" type="number" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        </div>
        <div style="display: flex; flex-direction: column;">
          <label style="font-size: 12px; font-weight: bold; margin-bottom: 2px;">Prioridade:</label>
          <select v-model="consultaForm.nivel_prioridade" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            <option value="B">Baixa</option>
            <option value="N">Normal</option>
            <option value="A">Alta</option>
            <option value="U">Urgência</option>
          </select>
        </div>
        <div style="display: flex; flex-direction: column;">
          <label style="font-size: 12px; font-weight: bold; margin-bottom: 2px;">Status:</label>
          <select v-model="consultaForm.status" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            <option value="AG">Agendada</option>
            <option value="RE">Realizada</option>
            <option value="CA">Cancelada</option>
          </select>
        </div>
        <div style="display: flex; flex-direction: column; grid-column: span 1;">
          <label style="font-size: 12px; font-weight: bold; margin-bottom: 2px;">Motivo:</label>
          <input v-model="consultaForm.motivo" type="text" placeholder="Motivo clínico da consulta" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        </div>
        <div style="display: flex; gap: 5px; align-items: flex-end;">
          <button type="submit" style="flex: 1; background-color: #2ecc71; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-weight: bold; height: 37px;">
            Confirmar
          </button>
          <button v-if="editandoId" @click="cancelarEdicao" type="button" style="background-color: #95a5a6; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; height: 37px;">❌</button>
        </div>
      </form>
    </div>

    <div style="margin: 20px 0;">
      <input type="text" v-model="filtro" placeholder="🔍 Filtrar consultas por nome ou motivo..." style="padding: 10px; width: 100%; max-width: 400px; border: 1px solid #ccc; border-radius: 4px;" />
    </div>

    <div v-if="loading" style="color: #3498db; font-weight: bold;">🔄 Sincronizando agendas...</div>
    <div v-else-if="error" style="color: #e74c3c; background-color: #fce4e4; padding: 15px; border-radius: 4px; margin: 20px 0;">⚠️ {{ error }}</div>
    
    <table v-else border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; background-color: white; text-align: left;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th>ID</th>
          <th>Data e Hora</th>
          <th>Paciente</th>
          <th>Médico</th>
          <th>Prioridade</th>
          <th>Status</th>
          <th>Motivo</th>
          <th style="text-align: center; width: 180px;">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="consulta in consultasFiltradas" :key="consulta.id">
          <td>{{ consulta.id }}</td>
          <td>{{ formatarDataHora(consulta.data_agendada) }}</td>
          <td>👤 #{{ consulta.paciente }}</td>
          <td>🩺 #{{ consulta.medico }}</td>
          <td><span :style="getEstiloPrioridade(consulta.nivel_prioridade)">{{ traduzirPrioridade(consulta.nivel_prioridade) }}</span></td>
          <td><span :style="getEstiloStatus(consulta.status)">{{ traduzirStatus(consulta.status) }}</span></td>
          <td>{{ consulta.motivo }}</td>
          <td style="text-align: center;">
            <button @click="carregarParaEditar(consulta)" style="background-color: #f39c12; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px; font-weight: bold;">✏️</button>
            <button @click="deletarConsulta(consulta.id)" style="background-color: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">🗑️</button>
          </td>
        </tr>
        <tr v-if="consultasFiltradas.length === 0">
          <td colspan="8" style="text-align: center; color: gray; padding: 15px;">Nenhuma consulta agendada encontrada.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      consultas: [],
      filtro: '',
      loading: true,
      error: null,
      editandoId: null,
      consultaForm: {
        data_agendada: '',
        paciente: null,
        medico: null,
        nivel_prioridade: 'N',
        status: 'AG',
        motivo: ''
      }
    };
  },
  computed: {
    consultasFiltradas() {
      if (!this.filtro) return this.consultas;
      const q = this.filtro.toLowerCase();
      return this.consultas.filter(c => 
        String(c.paciente).toLowerCase().includes(q) ||
        String(c.medico).toLowerCase().includes(q) ||
        String(c.motivo || '').toLowerCase().includes(q)
      );
    }
  },
  mounted() { this.buscarConsultas(); },
  methods: {
    // 🔍 GET - Listar
    async buscarConsultas() {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:8000/consulta/api/');
        this.consultas = response.data;
        this.error = null;
      } catch (err) {
        console.error(err);
        this.error = "Não foi possível carregar o agendamento de consultas. Verifique o back-end.";
      } finally {
        this.loading = false;
      }
    },

    // 💾 POST ou PUT - Salvar
    async salvarConsulta() {
      try {
        // Envia chaves limpas e tipadas perfeitamente para o back-end
        const payload = {
          data_agendada: new Date(this.consultaForm.data_agendada).toISOString(),
          paciente: parseInt(this.consultaForm.paciente),
          medico: parseInt(this.consultaForm.medico),
          nivel_prioridade: this.consultaForm.nivel_prioridade,
          status: this.consultaForm.status,
          motivo: this.consultaForm.motivo.trim()
        };

        if (this.editandoId) {
          const response = await axios.put(`http://localhost:8000/consulta/api/${this.editandoId}/`, payload);
          const idx = this.consultas.findIndex(c => c.id === this.editandoId);
          this.consultas[idx] = response.data;
          this.editandoId = null;
          alert("Consulta remarcada/alterada com sucesso!");
        } else {
          const response = await axios.post('http://localhost:8000/consulta/api/', payload);
          this.consultas.push(response.data);
          alert("Consulta agendada com sucesso!");
        }
        this.resetarFormulario();
      } catch (err) {
        console.error("Erro completo do Django:", err.response?.data || err);
        alert("Erro ao salvar consulta. Certifique-se de que os IDs de Médico e Paciente existem cadastrados no sistema.");
      }
    },

    carregarParaEditar(c) {
      this.editandoId = c.id;
      // Garante a conversão do padrão UTC/ISO do banco para o input datetime-local nativo do HTML
      let dataFormatada = '';
      if (c.data_agendada) {
        const dataObjeto = new Date(c.data_agendada);
        // Desloca fuso horário local para o formato 'AAAA-MM-DDTHH:MM'
        const offset = dataObjeto.getTimezoneOffset() * 60000;
        const localISOTime = new Date(dataObjeto.getTime() - offset).toISOString();
        dataFormatada = localISOTime.substring(0, 16);
      }
      
      this.consultaForm = {
        data_agendada: dataFormatada,
        paciente: c.paciente,
        medico: c.medico,
        nivel_prioridade: c.nivel_prioridade,
        status: c.status,
        motivo: c.motivo
      };
    },

    cancelarEdicao() {
      this.editandoId = null;
      this.resetarFormulario();
    },

    resetarFormulario() {
      this.consultaForm = { data_agendada: '', paciente: null, medico: null, nivel_prioridade: 'N', status: 'AG', motivo: '' };
    },

    // 🗑️ DELETE - Apagar
    async deletarConsulta(id) {
      if (!confirm("Tem certeza que deseja cancelar e desmarcar permanentemente esta consulta?")) return;
      try {
        await axios.delete(`http://localhost:8000/consulta/api/${id}/`);
        this.consultas = this.consultas.filter(c => c.id !== id);
        alert("Consulta cancelada e removida com sucesso!");
      } catch (err) {
        console.error(err);
        alert("Não foi possível excluir a consulta. Verifique dependências de chaves estrangeiras (como atestados vinculados).");
      }
    },

    formatarDataHora(d) { return d ? new Date(d).toLocaleString('pt-BR') : '-'; },
    traduzirStatus(s) { return { 'AG': 'Agendada', 'RE': 'Realizada', 'CA': 'Cancelada' }[s] || s; },
    getEstiloStatus(s) { return { 'AG': 'color: #3498db; font-weight: bold;', 'RE': 'color: #2ecc71; font-weight: bold;', 'CA': 'color: #95a5a6; text-decoration: line-through;' }[s] || ''; },
    traduzirPrioridade(p) { return { 'B': 'Baixa', 'N': 'Normal', 'A': 'Alta', 'U': 'Urgência' }[p] || p; },
    getEstiloPrioridade(n) {
      return {
        'B': 'background-color: #ecf0f1; padding: 3px 8px; border-radius: 4px; color: #7f8c8d;',
        'N': 'background-color: #dff0d8; color: #3c763d; padding: 3px 8px; border-radius: 4px;',
        'A': 'background-color: #fcf8e3; color: #8a6d3b; padding: 3px 8px; border-radius: 4px; font-weight: bold;',
        'U': 'background-color: #f2dede; color: #a94442; padding: 3px 8px; border-radius: 4px; font-weight: bold;'
      }[n] || '';
    }
  }
};
</script>