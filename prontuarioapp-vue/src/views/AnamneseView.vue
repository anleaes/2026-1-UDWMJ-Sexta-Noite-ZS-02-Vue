<template>
  <div style="padding: 20px; font-family: sans-serif;">
    <h2>📝 Histórico de Anamneses</h2>
    <p>Controle de entrevistas clínicas vinculadas a consultas médicas.</p>

    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <h3 style="margin-top: 0;">{{ editandoId ? '✏️ Editar Anamnese' : '➕ Registrar Nova Anamnese' }}</h3>
      <form @submit.prevent="salvarAnamnese" style="display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; gap: 10px;">
          <input v-model.number="anamneseForm.consulta" type="number" placeholder="ID da Consulta Relacionada" required style="padding: 8px; width: 220px; border: 1px solid #ccc; border-radius: 4px;" />
        </div>
        <textarea v-model="anamneseForm.sintomas" placeholder="Sintomas Narrados pelo Paciente" required style="padding: 8px; height: 60px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
        <textarea v-model="anamneseForm.historico_clinico" placeholder="Histórico Clínico Pregresso" style="padding: 8px; height: 60px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
        <div style="display: flex; gap: 5px; max-width: 300px;">
          <button type="submit" style="flex: 1; background-color: #2ecc71; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">
            {{ editandoId ? 'Atualizar' : 'Salvar no Prontuário' }}
          </button>
          <button v-if="editandoId" @click="cancelarEdicao" type="button" style="background-color: #95a5a6; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">Cancelar</button>
        </div>
      </form>
    </div>

    <div style="margin: 20px 0;">
      <input type="text" v-model="filtro" placeholder="🔍 Buscar em sintomas ou histórico..." style="padding: 10px; width: 100%; max-width: 400px; border: 1px solid #ccc; border-radius: 4px;" />
    </div>

    <div v-if="loading" style="color: #3498db;">🔄 Carregando prontuários...</div>
    <div v-else-if="error" style="color: #e74c3c;">⚠️ {{ error }}</div>

    <table v-else border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; background-color: white; text-align: left;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th>ID</th>
          <th>ID Consulta</th>
          <th>Sintomas Narrados</th>
          <th>Histórico Clínico</th>
          <th style="text-align: center; width: 180px;">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="anamnese in anamnesesFiltradas" :key="anamnese.id">
          <td>{{ anamnese.id }}</td>
          <td>#{{ anamnese.consulta }}</td>
          <td>{{ anamnese.sintomas }}</td>
          <td>{{ anamnese.historico_clinico || '-' }}</td>
          <td style="text-align: center;">
            <button @click="carregarParaEditar(anamnese)" style="background-color: #f39c12; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-right: 5px;">✏️ Editar</button>
            <button @click="deletarAnamnese(anamnese.id)" style="background-color: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">🗑️ Excluir</button>
          </td>
        </tr>
        <tr v-if="anamnesesFiltradas.length === 0">
          <td colspan="5" style="text-align: center; color: gray;">Nenhum registro encontrado.</td>
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
      anamneses: [],
      filtro: '',
      loading: true,
      error: null,
      editandoId: null,
      anamneseForm: { consulta: null, sintomas: '', historico_clinico: '' }
    };
  },
  computed: {
    anamnesesFiltradas() {
      if (!this.filtro) return this.anamneses;
      const q = this.filtro.toLowerCase();
      return this.anamneses.filter(a => 
        (a.sintomas && a.sintomas.toLowerCase().includes(q)) || 
        (a.historico_clinico && a.historico_clinico.toLowerCase().includes(q))
      );
    }
  },
  mounted() { this.buscarAnamneses(); },
  methods: {
    async buscarAnamneses() {
      try {
        const response = await axios.get('http://localhost:8000/anamnese/api/');
        this.anamneses = response.data;
      } catch (err) { this.error = "Erro no carregamento."; }
      finally { this.loading = false; }
    },
    async salvarAnamnese() {
      try {
        if (this.editandoId) {
          const response = await axios.put(`http://localhost:8000/anamnese/api/${this.editandoId}/`, this.anamneseForm);
          const idx = this.anamneses.findIndex(a => a.id === this.editandoId);
          this.anamneses[idx] = response.data;
          this.editandoId = null;
        } else {
          const response = await axios.post('http://localhost:8000/anamnese/api/', this.anamneseForm);
          this.anamneses.push(response.data);
        }
        this.anamneseForm = { consulta: null, sintomas: '', historico_clinico: '' };
      } catch (err) { alert("Verifique se o ID da Consulta é válido no banco."); }
    },
    carregarParaEditar(anamnese) {
      this.editandoId = anamnese.id;
      this.anamneseForm = { ...anamnese };
    },
    cancelarEdicao() {
      this.editandoId = null;
      this.anamneseForm = { consulta: null, sintomas: '', historico_clinico: '' };
    },
    async deletarAnamnese(id) {
      if (!confirm("Excluir definitivo?")) return;
      try {
        await axios.delete(`http://localhost:8000/anamnese/api/${id}/`);
        this.anamneses = this.anamneses.filter(a => a.id !== id);
      } catch (err) { alert("Falha ao apagar."); }
    }
  }
};
</script>