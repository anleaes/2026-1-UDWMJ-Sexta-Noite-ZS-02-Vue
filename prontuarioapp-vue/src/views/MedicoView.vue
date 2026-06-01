<template>
  <div style="padding: 20px; font-family: sans-serif;">
    <h2>🩺 Corpo Clínico de Médicos</h2>
    <p>Gerenciamento completo do cadastro e especialidades dos médicos.</p>

    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <h3 style="margin-top: 0;">{{ editandoId ? '✏️ Editar Médico' : '➕ Cadastrar Novo Médico' }}</h3>
      <form @submit.prevent="salvarMedico" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
        <input v-model="medicoForm.nome" type="text" placeholder="Nome do Médico" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model="medicoForm.crm" type="text" placeholder="CRM (Ex: 12345/RS)" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model="medicoForm.especialidade" type="text" placeholder="Especialidade" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model="medicoForm.telefone" type="text" placeholder="Telefone de Contato" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <div style="display: flex; gap: 5px;">
          <button type="submit" style="flex: 1; background-color: #2ecc71; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">
            {{ editandoId ? 'Atualizar' : 'Salvar' }}
          </button>
          <button v-if="editandoId" @click="cancelarEdicao" type="button" style="background-color: #95a5a6; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <div style="margin: 20px 0;">
      <input type="text" v-model="filtro" placeholder="🔍 Buscar médico por nome..." style="padding: 10px; width: 100%; max-width: 400px; border: 1px solid #ccc; border-radius: 4px;" />
    </div>

    <div v-if="loading" style="color: #3498db; font-weight: bold;">🔄 Carregando médicos...</div>
    <div v-else-if="error" style="color: #e74c3c;">⚠️ {{ error }}</div>

    <table v-else border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; background-color: white; text-align: left;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th>ID</th>
          <th>Nome do Médico</th>
          <th>CRM</th>
          <th>Especialidade</th>
          <th>Telefone</th>
          <th style="text-align: center; width: 180px;">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="medico in medicosFiltrados" :key="medico.id">
          <td>{{ medico.id }}</td>
          <td>{{ medico.nome || 'Não informado' }}</td>
          <td>{{ medico.crm }}</td>
          <td>{{ medico.especialidade || 'Geral' }}</td>
          <td>{{ medico.telefone || '-' }}</td>
          <td style="text-align: center;">
            <button @click="carregarParaEditar(medico)" style="background-color: #f39c12; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-right: 5px;">✏️ Editar</button>
            <button @click="deletarMedico(medico.id)" style="background-color: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">🗑️ Excluir</button>
          </td>
        </tr>
        <tr v-if="medicosFiltrados.length === 0">
          <td colspan="6" style="text-align: center; color: gray;">Nenhum médico encontrado.</td>
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
      medicos: [],
      filtro: '',
      loading: true,
      error: null,
      editandoId: null,
      medicoForm: { nome: '', crm: '', especialidade: '', telefone: '' }
    };
  },
  computed: {
    medicosFiltrados() {
      if (!this.filtro) return this.medicos;
      return this.medicos.filter(m => m.nome && m.nome.toLowerCase().includes(this.filtro.toLowerCase()));
    }
  },
  mounted() { this.buscarMedicos(); },
  methods: {
    async buscarMedicos() {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:8000/medico/api/');
        this.medicos = response.data;
      } catch (err) { this.error = "Erro ao carregar dados."; }
      finally { this.loading = false; }
    },
    async salvarMedico() {
      try {
        if (this.editandoId) {
          const response = await axios.put(`http://localhost:8000/medico/api/${this.editandoId}/`, this.medicoForm);
          const idx = this.medicos.findIndex(m => m.id === this.editandoId);
          this.medicos[idx] = response.data;
          this.editandoId = null;
        } else {
          const response = await axios.post('http://localhost:8000/medico/api/', this.medicoForm);
          this.medicos.push(response.data);
        }
        this.medicoForm = { nome: '', crm: '', especialidade: '', telefone: '' };
      } catch (err) { alert("Erro ao salvar dados."); }
    },
    carregarParaEditar(medico) {
      this.editandoId = medico.id;
      this.medicoForm = { ...medico };
    },
    cancelarEdicao() {
      this.editandoId = null;
      this.medicoForm = { nome: '', crm: '', especialidade: '', telefone: '' };
    },
    async deletarMedico(id) {
      if (!confirm("Excluir permanentemente?")) return;
      try {
        await axios.delete(`http://localhost:8000/medico/api/${id}/`);
        this.medicos = this.medicos.filter(m => m.id !== id);
      } catch (err) { alert("Não foi possível excluir."); }
    }
  }
};
</script>