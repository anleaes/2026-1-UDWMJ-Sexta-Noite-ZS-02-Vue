<template>
  <div style="padding: 20px; font-family: sans-serif;">
    <h2>📄 Emissão e Consulta de Atestados Médicos</h2>
    <p>Gere e invalide documentos legais de afastamento de forma centralizada.</p>

    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <h3 style="margin-top: 0;">{{ editandoId ? '✏️ Retificar Atestado' : '➕ Emitir Novo Atestado Legal' }}</h3>
      <form @submit.prevent="salvarAtestado" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
        <input v-model="atestadoForm.codigo_autenticacao" type="text" placeholder="Chave Única de Autenticação" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <select v-model="atestadoForm.tipo_atestado" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
          <option value="MEDICO">Médico</option>
          <option value="ODONTO">Odontológico</option>
          <option value="OUTRO">Outro</option>
        </select>
        <input v-model="atestadoForm.data_inicio_afastamento" type="date" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model.number="atestadoForm.quantidade_dias" type="number" placeholder="Quantidade de Dias" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model.number="atestadoForm.consulta" type="number" placeholder="ID da Consulta" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model.number="atestadoForm.cid" type="number" placeholder="ID numérico do CID" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <div style="display: flex; gap: 5px;">
          <button type="submit" style="flex: 1; background-color: #2ecc71; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">
            {{ editandoId ? 'Atualizar' : 'Registrar' }}
          </button>
          <button v-if="editandoId" @click="cancelarEdicao" type="button" style="background-color: #95a5a6; color: white; padding: 8px; border: none; border-radius: 4px;">X</button>
        </div>
      </form>
    </div>

    <div style="margin: 20px 0;">
      <input type="text" v-model="filtro" placeholder="🔍 Buscar por código de autenticação..." style="padding: 10px; width: 100%; max-width: 400px; border: 1px solid #ccc; border-radius: 4px;" />
    </div>

    <div v-if="loading" style="color: #3498db;">🔄 Carregando registros de atestados...</div>
    <table v-else border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; background-color: white; text-align: left;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th>ID</th>
          <th>Código Autenticação</th>
          <th>Tipo</th>
          <th>Início</th>
          <th>Duração</th>
          <th>Consulta</th>
          <th>CID</th>
          <th style="text-align: center; width: 160px;">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="atestado in atestadosFiltrados" :key="atestado.id">
          <td>{{ atestado.id }}</td>
          <td style="font-family: monospace; font-weight: bold;">{{ atestado.codigo_autenticacao }}</td>
          <td>{{ traduzirTipo(atestado.tipo_atestado) }}</td>
          <td>{{ formatarData(atestado.data_inicio_afastamento) }}</td>
          <td>{{ atestado.quantidade_dias }} dias</td>
          <td>#{{ atestado.consulta }}</td>
          <td>{{ atestado.cid_codigo || atestado.cid }}</td>
          <td style="text-align: center;">
            <button @click="carregarParaEditar(atestado)" style="background-color: #f39c12; color: white; border: none; padding: 4px 6px; border-radius: 4px; cursor: pointer; margin-right: 4px;">✏️</button>
            <button @click="deletarAtestado(atestado.id)" style="background-color: #e74c3c; color: white; border: none; padding: 4px 6px; border-radius: 4px; cursor: pointer;">🗑️</button>
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
      atestados: [], filtro: '', loading: true, error: null, editandoId: null,
      atestadoForm: { codigo_autenticacao: '', tipo_atestado: 'MEDICO', data_inicio_afastamento: '', quantidade_dias: null, consulta: null, cid: null }
    };
  },
  computed: {
    atestadosFiltrados() {
      if (!this.filtro) return this.atestados;
      return this.atestados.filter(a => a.codigo_autenticacao && a.codigo_autenticacao.toLowerCase().includes(this.filtro.toLowerCase()));
    }
  },
  mounted() { this.buscarAtestados(); },
  methods: {
    async buscarAtestados() {
      try {
        const response = await axios.get('http://localhost:8000/atestado/api/');
        this.atestados = response.data;
      } catch (err) { this.error = "Erro"; } finally { this.loading = false; }
    },
    async salvarAtestado() {
      try {
        if (this.editandoId) {
          const response = await axios.put(`http://localhost:8000/atestado/api/${this.editandoId}/`, this.atestadoForm);
          const idx = this.atestados.findIndex(a => a.id === this.editandoId);
          this.atestados[idx] = response.data;
          this.editandoId = null;
        } else {
          const response = await axios.post('http://localhost:8000/atestado/api/', this.atestadoForm);
          this.atestados.push(response.data);
        }
        this.atestadoForm = { codigo_autenticacao: '', tipo_atestado: 'MEDICO', data_inicio_afastamento: '', quantidade_dias: null, consulta: null, cid: null };
      } catch (err) { alert("Verifique os IDs inseridos."); }
    },
    carregarParaEditar(a) { this.editandoId = a.id; this.atestadoForm = { ...a }; },
    cancelarEdicao() { this.editandoId = null; this.atestadoForm = { codigo_autenticacao: '', tipo_atestado: 'MEDICO', data_inicio_afastamento: '', quantidade_dias: null, consulta: null, cid: null }; },
    async deletarAtestado(id) {
      if (!confirm("Revogar atestado?")) return;
      try {
        await axios.delete(`http://localhost:8000/atestado/api/${id}/`);
        this.atestados = this.atestados.filter(a => a.id !== id);
      } catch (err) { alert("Erro."); }
    },
    formatarData(d) { if (!d) return '-'; const [a, m, dia] = d.split('-'); return `${dia}/${m}/${a}`; },
    traduzirTipo(t) { return { 'MEDICO': 'Médico', 'ODONTO': 'Odontológico', 'OUTRO': 'Outro' }[t] || t; }
  }
};
</script>