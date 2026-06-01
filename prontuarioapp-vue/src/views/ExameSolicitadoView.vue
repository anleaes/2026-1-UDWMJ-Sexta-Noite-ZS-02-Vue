<template>
  <div style="padding: 20px; font-family: sans-serif;">
    <h2>📋 Pedidos de Exames Clínicos</h2>
    <p>Gerencie as solicitações de exames laboratoriais e de imagem vinculados às consultas.</p>

    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <h3 style="margin-top: 0;">{{ editandoId ? '✏️ Alterar Solicitação de Exame' : '➕ Solicitar Novo Exame' }}</h3>
      <form @submit.prevent="salvarExameSolicitado" style="display: flex; flex-direction: column; gap: 12px;">
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
          <div style="display: flex; flex-direction: column;">
            <label style="font-size: 12px; font-weight: bold; margin-bottom: 4px;">ID da Consulta Relacionada *</label>
            <input v-model.number="exameForm.consulta" type="number" placeholder="Ex: 1" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
          </div>

          <div style="display: flex; flex-direction: column;">
            <label style="font-size: 12px; font-weight: bold; margin-bottom: 4px;">Nome do Exame *</label>
            <input v-model="exameForm.nome_exame" type="text" placeholder="Ex: Hemograma Completo" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
          </div>

          <div style="display: flex; align-items: center; margin-top: 20px; gap: 8px;">
            <input v-model="exameForm.exige_jejum" type="checkbox" id="jejum" style="width: 18px; height: 18px; cursor: pointer;" />
            <label for="jejum" style="font-size: 14px; font-weight: bold; cursor: pointer;">Exige Jejum do Paciente?</label>
          </div>
        </div>

        <div style="display: flex; flex-direction: column;">
          <label style="font-size: 12px; font-weight: bold; margin-bottom: 4px;">Descrição / Justificativa *</label>
          <textarea v-model="exameForm.descricao" placeholder="Descreva a necessidade clínica do exame..." required style="padding: 8px; height: 50px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
        </div>

        <div style="display: flex; flex-direction: column;">
          <label style="font-size: 12px; font-weight: bold; margin-bottom: 4px;">Instruções de Preparo *</label>
          <textarea v-model="exameForm.preparo" placeholder="Ex: Jejum absoluto de 8 horas, não tomar medicamento X..." required style="padding: 8px; height: 50px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
        </div>

        <div style="display: flex; gap: 5px; max-width: 300px; margin-top: 5px;">
          <button type="submit" style="flex: 1; background-color: #2ecc71; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">
            {{ editandoId ? 'Atualizar Pedido' : 'Confirmar Pedido' }}
          </button>
          <button v-if="editandoId" @click="cancelarEdicao" type="button" style="background-color: #95a5a6; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer;">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <div style="margin: 20px 0;">
      <input type="text" v-model="filtro" placeholder="🔍 Buscar por nome do exame ou descrição..." style="padding: 10px; width: 100%; max-width: 400px; border: 1px solid #ccc; border-radius: 4px;" />
    </div>

    <div v-if="loading" style="color: #3498db; font-weight: bold;">🔄 Sincronizando solicitações com o servidor...</div>
    <div v-else-if="error" style="color: #e74c3c; background-color: #fce4e4; padding: 15px; border-radius: 4px; margin: 20px 0;">⚠️ {{ error }}</div>

    <table v-else border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; background-color: white; text-align: left;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th>ID Exame</th>
          <th>ID Consulta</th>
          <th>Nome do Exame</th>
          <th>Descrição</th>
          <th>Preparo</th>
          <th>Jejum?</th>
          <th style="text-align: center; width: 180px;">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="exame in examesFiltrados" :key="exame.id">
          <td><strong>#{{ exame.id }}</strong></td>
          <td>📋 #{{ exame.consulta }}</td>
          <td style="color: #2c3e50; font-weight: bold;">{{ exame.nome_exame }}</td>
          <td>{{ exame.descricao }}</td>
          <td>{{ exame.preparo }}</td>
          <td>
            <span :style="{ color: exame.exige_jejum ? '#e67e22' : '#2ecc71', fontWeight: 'bold' }">
              {{ exame.exige_jejum ? '⏳ Sim' : '✅ Não' }}
            </span>
          </td>
          <td style="text-align: center;">
            <button @click="carregarParaEditar(exame)" style="background-color: #f39c12; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px; font-weight: bold;">✏️</button>
            <button @click="deletarExame(exame.id)" style="background-color: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">🗑️</button>
          </td>
        </tr>
        <tr v-if="examesFiltrados.length === 0">
          <td colspan="7" style="text-align: center; color: gray; padding: 15px;">Nenhum exame solicitado encontrado.</td>
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
      exames: [],
      filtro: '',
      loading: true,
      error: null,
      editandoId: null,
      exameForm: {
        nome_exame: '',
        descricao: '',
        preparo: '',
        exige_jejum: false,
        consulta: null
      }
    };
  },
  computed: {
    examesFiltrados() {
      if (!this.filtro) return this.exames;
      const q = this.filtro.toLowerCase();
      return this.exames.filter(e => 
        (e.nome_exame && e.nome_exame.toLowerCase().includes(q)) ||
        (e.descricao && e.descricao.toLowerCase().includes(q))
      );
    }
  },
  mounted() { this.buscarExames(); },
  methods: {
    // 🔍 GET - Listar usando a rota case-sensitive correta
    async buscarExames() {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:8000/exameSolicitado/api/');
        this.exames = response.data;
        this.error = null;
      } catch (err) {
        console.error(err);
        this.error = "Não foi possível carregar os exames solicitados. Verifique o back-end.";
      } finally {
        this.loading = false;
      }
    },

    // 💾 POST ou PUT - Salvar
    async salvarExameSolicitado() {
      try {
        const payload = {
          nome_exame: this.exameForm.nome_exame.trim(),
          descricao: this.exameForm.descricao.trim(),
          preparo: this.exameForm.preparo.trim(),
          exige_jejum: !!this.exameForm.exige_jejum,
          consulta: parseInt(this.exameForm.consulta)
        };

        if (this.editandoId) {
          const response = await axios.put(`http://localhost:8000/exameSolicitado/api/${this.editandoId}/`, payload);
          const idx = this.exames.findIndex(e => e.id === this.editandoId);
          this.exames[idx] = response.data;
          this.editandoId = null;
          alert("Solicitação de exame atualizada com sucesso!");
        } else {
          const response = await axios.post('http://localhost:8000/exameSolicitado/api/', payload);
          this.exames.push(response.data);
          alert("Exame solicitado com sucesso!");
        }
        this.resetarFormulario();
      } catch (err) {
        console.error("Erro do Django:", err.response?.data || err);
        alert("Erro ao salvar o pedido de exame. Verifique se o ID da Consulta inserido existe no banco.");
      }
    },

    carregarParaEditar(e) {
      this.editandoId = e.id;
      this.exameForm = {
        nome_exame: e.nome_exame,
        descricao: e.descricao,
        preparo: e.preparo,
        exige_jejum: e.exige_jejum,
        consulta: e.consulta
      };
    },

    cancelarEdicao() {
      this.editandoId = null;
      this.resetarFormulario();
    },

    resetarFormulario() {
      this.exameForm = { nome_exame: '', descricao: '', preparo: '', exige_jejum: false, consulta: null };
    },

    // 🗑️ DELETE - Apagar do Banco
    async deletarExame(id) {
      if (!confirm("Deseja mesmo remover permanentemente esta solicitação de exame?")) return;
      try {
        await axios.delete(`http://localhost:8000/exameSolicitado/api/${id}/`);
        this.exames = this.exames.filter(e => e.id !== id);
        alert("Solicitação excluída com sucesso!");
      } catch (err) {
        console.error(err);
        alert("Não foi possível excluir. O ID desse exame pode estar vinculado a um laudo técnico ativo na tabela de resultados.");
      }
    }
  }
};
</script>