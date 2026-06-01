<template>
  <div style="padding: 20px; font-family: sans-serif;">
    <h2>📊 Resultados de Exames</h2>
    <p>Anexação de laudos laboratoriais, valores quantitativos de medição e diagnósticos.</p>

    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <h3 style="margin-top: 0;">{{ editandoId ? '✏️ Retificar Laudo Técnico' : '➕ Lançar Resultado de Exame' }}</h3>
      <form @submit.prevent="salvarResultado" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
        <input v-model.number="resForm.exame_solicitado" type="number" placeholder="ID do Exame Solicitado" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model="resForm.data_resultado" type="date" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model="resForm.valor" type="text" placeholder="Valor Medido (Ex: 140)" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model="resForm.unidade_medida" type="text" placeholder="Unidade de Medida (Ex: mg/dL)" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <textarea v-model="resForm.conclusoes" placeholder="Conclusões Clínicas e Laudo Técnico Descritivo" required style="padding: 8px; grid-column: span 1; height: 40px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
        <div style="display: flex; gap: 5px; align-items: flex-end;">
          <button type="submit" style="flex: 1; background-color: #2ecc71; color: white; border: none; padding: 8px; border-radius: 4px; font-weight: bold; cursor: pointer; height: 37px;">Emitir Laudo</button>
          <button v-if="editandoId" @click="cancelarEdicao" type="button" style="background-color: #95a5a6; color: white; border: none; padding: 8px; border-radius: 4px; height: 37px;">X</button>
        </div>
      </form>
    </div>

    <div style="margin: 20px 0;">
      <input type="text" v-model="filtro" placeholder="🔍 Buscar por ID do exame ou laudo..." style="padding: 10px; width: 100%; max-width: 400px; border: 1px solid #ccc; border-radius: 4px;" />
    </div>

    <div v-if="loading" style="color: #3498db;">🔄 Puxando laudos do servidor...</div>
    <table v-else border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; background-color: white; text-align: left;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th>ID</th>
          <th>Exame Solicitado</th>
          <th>Data do Laudo</th>
          <th>Valor Medido</th>
          <th>Conclusões / Laudo</th>
          <th style="text-align: center; width: 160px;">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in resultadosFiltrados" :key="r.id">
          <td>{{ r.id }}</td>
          <td>#{{ r.exame_solicitado }}</td>
          <td>{{ formatarData(r.data_resultado) }}</td>
          <td style="font-weight: bold; color: #2c3e50;">{{ r.valor }} <span style="font-size: 12px; color: #7f8c8d;">{{ r.unidade_medida }}</span></td>
          <td style="white-space: pre-line;">{{ r.conclusoes }}</td>
          <td style="text-align: center;">
            <button @click="carregarParaEditar(r)" style="background-color: #f39c12; color: white; border: none; padding: 4px 6px; border-radius: 4px; cursor: pointer; margin-right: 4px;">✏️</button>
            <button @click="deletarResultado(r.id)" style="background-color: #e74c3c; color: white; border: none; padding: 4px 6px; border-radius: 4px; cursor: pointer;">🗑️</button>
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
      resultados: [], filtro: '', loading: true, error: null, editandoId: null,
      resForm: { exame_solicitado: null, data_resultado: '', valor: '', unidade_medida: '', conclusoes: '' }
    };
  },
  computed: {
    resultadosFiltrados() {
      if (!this.filtro) return this.resultados;
      const q = this.filtro.toLowerCase();
      return this.resultados.filter(r => String(r.exame_solicitado).includes(q) || (r.conclusoes || '').toLowerCase().includes(q));
    }
  },
  mounted() { this.buscarResultados(); },
  methods: {
    async buscarResultados() {
      try {
        const response = await axios.get('http://localhost:8000/resultadoexame/api/');
        this.resultados = response.data;
      } catch (err) { this.error = "Erro"; } finally { this.loading = false; }
    },
    async salvarResultado() {
      try {
        if (this.editandoId) {
          const response = await axios.put(`http://localhost:8000/resultadoexame/api/${this.editandoId}/`, this.resForm);
          const idx = this.resultados.findIndex(r => r.id === this.editandoId);
          this.resultados[idx] = response.data;
          this.editandoId = null;
        } else {
          const response = await axios.post('http://localhost:8000/resultadoexame/api/', this.resForm);
          this.resultados.push(response.data);
        }
        this.resForm = { exame_solicitado: null, data_resultado: '', valor: '', unidade_medida: '', conclusoes: '' };
      } catch (err) { alert("Verifique se o ID do Exame Solicitado existe no sistema."); }
    },
    carregarParaEditar(r) { this.editandoId = r.id; this.resForm = { ...r }; },
    cancelarEdicao() { this.editandoId = null; this.resForm = { exame_solicitado: null, data_resultado: '', valor: '', unidade_medida: '', conclusoes: '' }; },
    async deletarResultado(id) {
      if (!confirm("Excluir este laudo definitivo?")) return;
      try {
        await axios.delete(`http://localhost:8000/resultadoexame/api/${id}/`);
        this.resultados = this.resultados.filter(r => r.id !== id);
      } catch (err) { alert("Erro."); }
    },
    formatarData(d) { if (!d) return '-'; const [ano, mes, dia] = d.split('-'); return `${dia}/${mes}/${ano}`; }
  }
};
</script>