<template>
  <div style="padding: 20px; font-family: sans-serif;">
    <h2>📦 Catálogo de Medicamentos</h2>
    <p>Adicione, modifique e catalogue a grade de substâncias da farmácia clínica.</p>

    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <h3 style="margin-top: 0;">{{ editandoId ? '✏️ Atualizar Fármaco' : '➕ Adicionar Novo Medicamento ao Catálogo' }}</h3>
      <form @submit.prevent="salvarMedicamento" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
        <input v-model="medForm.nome_referencia" type="text" placeholder="Nome Comercial / Referência" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model="medForm.principio_ativo" type="text" placeholder="Princípio Ativo" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model="medForm.categoria" type="text" placeholder="Categoria (Ex: Analgésico)" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        
        <label style="display: flex; align-items: center; gap: 5px; font-size: 14px; user-select: none; cursor: pointer;">
          <input v-model="medForm.e_controlado" type="checkbox" style="cursor: pointer;" /> Requer Tarja Preta / Controlado?
        </label>
        <label style="display: flex; align-items: center; gap: 5px; font-size: 14px; user-select: none; cursor: pointer;">
          <input v-model="medForm.tem_generico" type="checkbox" style="cursor: pointer;" /> Possui equivalente Genérico?
        </label>
        
        <div style="display: flex; gap: 5px;">
          <button type="submit" style="flex: 1; background-color: #2ecc71; color: white; border: none; padding: 8px; border-radius: 4px; font-weight: bold; cursor: pointer;">
            {{ editandoId ? 'Atualizar' : 'Salvar' }}
          </button>
          <button v-if="editandoId" @click="cancelarEdicao" type="button" style="background-color: #95a5a6; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">X</button>
        </div>
      </form>
    </div>

    <div style="margin: 20px 0;">
      <input type="text" v-model="filtro" placeholder="🔍 Buscar por nome comercial ou ativo..." style="padding: 10px; width: 100%; max-width: 400px; border: 1px solid #ccc; border-radius: 4px;" />
    </div>

    <div v-if="loading" style="color: #3498db; font-weight: bold;">🔄 Atualizando catálogo de medicamentos...</div>
    <div v-else-if="error" style="color: #e74c3c; background-color: #fce4e4; padding: 15px; border-radius: 4px; margin: 20px 0;">⚠️ {{ error }}</div>
    
    <table v-else border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; background-color: white; text-align: left;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th>ID</th>
          <th>Nome Comercial</th>
          <th>Princípio Ativo</th>
          <th>Categoria</th>
          <th>Controlado</th>
          <th>Genérico</th>
          <th style="text-align: center; width: 160px;">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in medicamentosFiltrados" :key="m.id">
          <td>{{ m.id }}</td>
          <td style="font-weight: bold; color: #2c3e50;">{{ m.nome_referencia }}</td>
          <td>{{ m.principio_ativo }}</td>
          <td>{{ m.categoria }}</td>
          <td>
            <span :style="m.e_controlado ? 'color: #c0392b; font-weight: bold; background-color: #fadbd8; padding: 2px 6px; border-radius: 4px;' : 'color: #27ae60; font-weight: bold;'">
              {{ m.e_controlado ? '⚠️ Sim' : 'Não' }}
            </span>
          </td>
          <td>
            <span :style="{ color: m.tem_generico ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }">
              {{ m.tem_generico ? '🟢 Sim' : '❌ Não' }}
            </span>
          </td>
          <td style="text-align: center;">
            <button @click="carregarParaEditar(m)" style="background-color: #f39c12; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; margin-right: 4px; font-weight: bold;">✏️</button>
            <button @click="deletarMedicamento(m.id)" style="background-color: #e74c3c; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">🗑️</button>
          </td>
        </tr>
        <tr v-if="medicamentosFiltrados.length === 0">
          <td colspan="7" style="text-align: center; color: gray; padding: 15px;">Nenhum medicamento encontrado no catálogo.</td>
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
      medicamentos: [],
      filtro: '',
      loading: true,
      error: null,
      editandoId: null,
      medForm: {
        nome_referencia: '',
        principio_ativo: '',
        categoria: '',
        e_controlado: false,
        tem_generico: true
      }
    };
  },
  computed: {
    medicamentosFiltrados() {
      if (!this.filtro) return this.medicamentos;
      const q = this.filtro.toLowerCase();
      return this.medicamentos.filter(m => 
        (m.nome_referencia || '').toLowerCase().includes(q) || 
        (m.principio_ativo || '').toLowerCase().includes(q)
      );
    }
  },
  mounted() { this.buscarMedicamentos(); },
  methods: {
    // 🔍 GET - Listar Fármacos
    async buscarMedicamentos() {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:8000/medicamento/api/');
        this.medicamentos = response.data;
        this.error = null;
      } catch (err) {
        console.error(err);
        this.error = "Não foi possível carregar o catálogo de medicamentos. Verifique o back-end.";
      } finally {
        this.loading = false;
      }
    },

    // 💾 POST ou PUT - Salvar
    async salvarMedicamento() {
      try {
        const payload = {
          nome_referencia: this.medForm.nome_referencia.trim(),
          principio_ativo: this.medForm.principio_ativo.trim(),
          categoria: this.medForm.categoria.trim(),
          e_controlado: !!this.medForm.e_controlado,
          tem_generico: !!this.medForm.tem_generico
        };

        if (this.editandoId) {
          const response = await axios.put(`http://localhost:8000/medicamento/api/${this.editandoId}/`, payload);
          const idx = this.medicamentos.findIndex(m => m.id === this.editandoId);
          this.medicamentos[idx] = response.data;
          this.editandoId = null;
          alert("Medicamento atualizado com sucesso!");
        } else {
          const response = await axios.post('http://localhost:8000/medicamento/api/', payload);
          this.medicamentos.push(response.data);
          alert("Medicamento adicionado ao catálogo!");
        }
        this.resetarFormulario();
      } catch (err) {
        console.error("Erro do Django Serializer:", err.response?.data || err);
        alert("Ocorreu um erro ao salvar o medicamento. Verifique as restrições dos campos no terminal.");
      }
    },

    carregarParaEditar(m) {
      this.editandoId = m.id;
      this.medForm = {
        nome_referencia: m.nome_referencia,
        principio_ativo: m.principio_ativo,
        categoria: m.categoria,
        e_controlado: m.e_controlado,
        tem_generico: m.tem_generico
      };
    },

    cancelarEdicao() {
      this.editandoId = null;
      this.resetarFormulario();
    },

    resetarFormulario() {
      this.medForm = { nome_referencia: '', principio_ativo: '', categoria: '', e_controlado: false, tem_generico: true };
    },

    // 🗑️ DELETE - Remover
    async deletarMedicamento(id) {
      if (!confirm("Tem certeza que deseja excluir este item permanentemente do catálogo?")) return;
      try {
        await axios.delete(`http://localhost:8000/medicamento/api/${id}/`);
        this.medicamentos = this.medicamentos.filter(m => m.id !== id);
        alert("Medicamento removido com sucesso!");
      } catch (err) {
        console.error(err);
        alert("Bloqueado: Este medicamento não pode ser deletado porque está associado a receitas médicas registradas.");
      }
    }
  }
};
</script>