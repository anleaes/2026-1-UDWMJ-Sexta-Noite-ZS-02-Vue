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
          <input v-model="consultaForm.motivo" type="text" placeholder="Motivo clínico da consulta" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
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

    <div v-if="loading" style="color: #3498db;">🔄 Sincronizando agendas...</div>
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
          <td>{{ consulta.paciente_nome || consulta.paciente }}</td>
          <td>{{ consulta.medico_nome || consulta.medico }}</td>
          <td><span :style="getEstiloPrioridade(consulta.nivel_prioridade)">{{ traduzirPrioridade(consulta.nivel_prioridade) }}</span></td>
          <td><span :style="getEstiloStatus(consulta.status)">{{ traduzirStatus(consulta.status) }}</span></td>
          <td>{{ consulta.motivo }}</td>
          <td style="text-align: center;">
            <button @click="carregarParaEditar(consulta)" style="background-color: #f39c12; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-right: 5px;">✏️</button>
            <button @click="deletarConsulta(consulta.id)" style="background-color: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">🗑️</button>
          </td>
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
      consultas: [], filtro: '', loading: true, error: null, editandoId: null,
      consultaForm: { data_agendada: '', paciente: null, medico: null, nivel_prioridade: 'N', status: 'AG', motivo: '' }
    };
  },
  computed: {
    consultasFiltradas() {
      if (!this.filtro) return this.consultas;
      const q = this.filtro.toLowerCase();
      return this.consultas.filter(c => 
        String(c.paciente_nome || c.paciente).toLowerCase().includes(q) ||
        String(c.medico_nome || c.medico).toLowerCase().includes(q) ||
        String(c.motivo || '').toLowerCase().includes(q)
      );
    }
  },
  mounted() { this.buscarConsultas(); },
  methods: {
    async buscarConsultas() {
      try {
        const response = await axios.get('http://localhost:8000/consulta/api/');
        this.consultas = response.data;
      } catch (err) { this.error = "Erro."; } finally { this.loading = false; }
    },
    async salvarConsulta() {
      try {
        // Formata a data ISO para envio correto se necessário
        if (this.editandoId) {
          const response = await axios.put(`http://localhost:8000/consulta/api/${this.editandoId}/`, this.consultaForm);
          const idx = this.consultas.findIndex(c => c.id === this.editandoId);
          this.consultas[idx] = response.data;
          this.editandoId = null;
        } else {
          const response = await axios.post('http://localhost:8000/consulta/api/', this.consultaForm);
          this.consultas.push(response.data);
        }
        this.consultaForm = { data_agendada: '', paciente: null, medico: null, nivel_prioridade: 'N', status: 'AG', motivo: '' };
      } catch (err) { alert("Verifique as chaves estrangeiras de Médico e Paciente."); }
    },
    carregarParaEditar(c) {
      this.editandoId = c.id;
      // Trata formato de data para o input datetime-local
      let dataFormatada = c.data_agendada ? c.data_agendada.substring(0, 16) : '';
      this.consultaForm = { ...c, data_agendada: dataFormatada };
    },
    cancelarEdicao() { this.editandoId = null; this.consultaForm = { data_agendada: '', paciente: null, medico: null, nivel_prioridade: 'N', status: 'AG', motivo: '' }; },
    async deletarConsulta(id) {
      if (!confirm("Cancelar e excluir consulta?")) return;
      try {
        await axios.delete(`http://localhost:8000/consulta/api/${id}/`);
        this.consultas = this.consultas.filter(c => c.id !== id);
      } catch (err) { alert("Erro ao deletar."); }
    },
    formatarDataHora(d) { return d ? new Date(d).toLocaleString('pt-BR') : '-'; },
    traduzirStatus(s) { return { 'AG': 'Agendada', 'RE': 'Realizada', 'CA': 'Cancelada' }[s] || s; },
    getEstiloStatus(s) { return { 'AG': 'color: #3498db; font-weight: bold;', 'RE': 'color: #2ecc71; font-weight: bold;', 'CA': 'color: #95a5a6; text-decoration: line-through;' }[s] || ''; },
    traduzirPrioridade(p) { return { 'B': 'Baixa', 'N': 'Normal', 'A': 'Alta', 'U': 'Urgência' }[p] || p; },
    getEstiloPrioridade(n) {
      return {
        'B': 'background-color: #ecf0f1; padding: 3px 8px; border-radius: 4px;',
        'N': 'background-color: #dff0d8; color: #3c763d; padding: 3px 8px; border-radius: 4px;',
        'A': 'background-color: #fcf8e3; color: #8a6d3b; padding: 3px 8px; border-radius: 4px; font-weight: bold;',
        'U': 'background-color: #f2dede; color: #a94442; padding: 3px 8px; border-radius: 4px; font-weight: bold;'
      }[n] || '';
    }
  }
};
</script>