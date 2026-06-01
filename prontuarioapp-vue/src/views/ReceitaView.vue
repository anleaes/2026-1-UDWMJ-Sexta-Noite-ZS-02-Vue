<template>
  <div style="padding: 20px; font-family: sans-serif;">
    <h2>💊 Prescrições e Receitas Médicas</h2>
    <p>Histórico completo de emissão de receituários eletrônicos e físicos.</p>

    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <h3 style="margin-top: 0;">{{ editandoId ? '✏️ Alterar Receita' : '➕ Emitir Nova Receita Médica' }}</h3>
      <form @submit.prevent="salvarReceita" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
        <input v-model.number="receitaForm.consulta" type="number" placeholder="ID da Consulta" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model="receitaForm.data_emissao" type="date" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model="receitaForm.validade" type="date" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <label style="display: flex; align-items: center; gap: 5px; font-size: 14px;">
          <input v-model="receitaForm.e_digital" type="checkbox" /> Prescrição formato Digital?
        </label>
        <input v-model="receitaForm.instrucoes" type="text" placeholder="Instruções de Dosagem e Uso" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; grid-column: span 1;" />
        <div style="display: flex; gap: 5px;">
          <button type="submit" style="flex: 1; background-color: #2ecc71; color: white; border: none; padding: 8px; border-radius: 4px; font-weight: bold; cursor: pointer;">Emitir</button>
          <button v-if="editandoId" @click="cancelarEdicao" type="button" style="background-color: #95a5a6; color: white; border: none; padding: 8px; border-radius: 4px;">X</button>
        </div>
      </form>
    </div>

    <div style="margin: 20px 0;">
      <input type="text" v-model="filtro" placeholder="🔍 Buscar por ID da consulta ou instruções..." style="padding: 10px; width: 100%; max-width: 400px; border: 1px solid #ccc; border-radius: 4px;" />
    </div>

    <div v-if="loading" style="color: #3498db;">🔄 Listando histórico de receitas...</div>
    <table v-else border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; background-color: white; text-align: left;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th>ID</th>
          <th>ID da Consulta</th>
          <th>Data de Emissão</th>
          <th>Validade</th>
          <th>Tipo / Formato</th>
          <th>Instruções Gerais</th>
          <th style="text-align: center; width: 160px;">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in receitasFiltradas" :key="r.id">
          <td>{{ r.id }}</td>
          <td>#{{ r.consulta }}</td>
          <td>{{ formatarData(r.data_emissao) }}</td>
          <td :style="verificarValidade(r.validade)">{{ formatarData(r.validade) }}</td>
          <td>{{ r.e_digital ? '💻 Digital' : '📄 Física' }}</td>
          <td>{{ r.instrucoes || 'Sem instruções gerais.' }}</td>
          <td style="text-align: center;">
            <button @click="carregarParaEditar(r)" style="background-color: #f39c12; color: white; border: none; padding: 4px 6px; border-radius: 4px; cursor: pointer; margin-right: 4px;">✏️</button>
            <button @click="deletarReceita(r.id)" style="background-color: #e74c3c; color: white; border: none; padding: 4px 6px; border-radius: 4px; cursor: pointer;">🗑️</button>
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
      receitas: [], filtro: '', loading: true, error: null, editandoId: null,
      receitaForm: { consulta: null, data_emissao: '', validade: '', e_digital: false, instrucoes: '' }
    };
  },
  computed: {
    receitasFiltradas() {
      if (!this.filtro) return this.receitas;
      const q = this.filtro.toLowerCase();
      return this.receitas.filter(r => String(r.consulta).includes(q) || (r.instrucoes || '').toLowerCase().includes(q));
    }
  },
  mounted() { this.buscarReceitas(); },
  methods: {
    async buscarReceitas() {
      try {
        const response = await axios.get('http://localhost:8000/receita/api/');
        this.receitas = response.data;
      } catch (err) { this.error = "Erro"; } finally { this.loading = false; }
    },
    async salvarReceita() {
      try {
        if (this.editandoId) {
          const response = await axios.put(`http://localhost:8000/receita/api/${this.editandoId}/`, this.receitaForm);
          const idx = this.receitas.findIndex(r => r.id === this.editandoId);
          this.receitas[idx] = response.data;
          this.editandoId = null;
        } else {
          const response = await axios.post('http://localhost:8000/receita/api/', this.receitaForm);
          this.receitas.push(response.data);
        }
        this.receitaForm = { consulta: null, data_emissao: '', validade: '', e_digital: false, instrucoes: '' };
      } catch (err) { alert("Verifique se o ID da Consulta existe."); }
    },
    carregarParaEditar(r) { this.editandoId = r.id; this.receitaForm = { ...r }; },
    cancelarEdicao() { this.editandoId = null; this.receitaForm = { consulta: null, data_emissao: '', validade: '', e_digital: false, instrucoes: '' }; },
    async deletarReceita(id) {
      if (!confirm("Excluir receita?")) return;
      try {
        await axios.delete(`http://localhost:8000/receita/api/${id}/`);
        this.receitas = this.receitas.filter(r => r.id !== id);
      } catch (err) { alert("Erro."); }
    },
    formatarData(d) { if (!d) return '-'; const [ano, mes, dia] = d.split('-'); return `${dia}/${mes}/${ano}`; },
    verificarValidade(v) { if (!v) return ''; return new Date(v) < new Date().setHours(0,0,0,0) ? 'color: #c0392b; font-weight: bold; background-color: #f9e7e6;' : 'color: #27ae60; font-weight: bold;'; }
  }
};
</script>