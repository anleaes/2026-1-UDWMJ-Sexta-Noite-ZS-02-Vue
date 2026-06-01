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
        
        <label style="display: flex; align-items: center; gap: 5px; font-size: 14px; user-select: none; cursor: pointer;">
          <input v-model="receitaForm.e_digital" type="checkbox" style="cursor: pointer;" /> Prescrição formato Digital?
        </label>
        
        <input v-model="receitaForm.instrucoes" type="text" placeholder="Instruções de Dosagem e Uso" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; grid-column: span 1;" />
        
        <div style="display: flex; gap: 5px;">
          <button type="submit" style="flex: 1; background-color: #2ecc71; color: white; border: none; padding: 8px; border-radius: 4px; font-weight: bold; cursor: pointer;">
            {{ editandoId ? 'Confirmar Alteração' : 'Emitir' }}
          </button>
          <button v-if="editandoId" @click="cancelarEdicao" type="button" style="background-color: #95a5a6; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">X</button>
        </div>
      </form>
    </div>

    <div style="margin: 20px 0;">
      <input type="text" v-model="filtro" placeholder="🔍 Buscar por ID da consulta ou instruções..." style="padding: 10px; width: 100%; max-width: 400px; border: 1px solid #ccc; border-radius: 4px;" />
    </div>

    <div v-if="loading" style="color: #3498db; font-weight: bold;">🔄 Listando histórico de receitas...</div>
    <div v-else-if="error" style="color: #e74c3c; background-color: #fce4e4; padding: 15px; border-radius: 4px; margin: 20px 0;">⚠️ {{ error }}</div>
    
    <table v-else border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; background-color: white; text-align: left;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th>ID Receita</th>
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
          <td><strong>#{{ r.id }}</strong></td>
          <td>📋 #{{ r.consulta }}</td>
          <td>{{ formatarData(r.data_emissao) }}</td>
          <td :style="verificarValidade(r.validade)">{{ formatarData(r.validade) }}</td>
          <td>
            <span :style="{ fontWeight: 'bold', color: r.e_digital ? '#3498db' : '#e67e22' }">
              {{ r.e_digital ? '💻 Digital' : '📄 Física' }}
            </span>
          </td>
          <td>{{ r.instrucoes || 'Sem instruções gerais.' }}</td>
          <td style="text-align: center;">
            <button @click="carregarParaEditar(r)" style="background-color: #f39c12; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; margin-right: 4px; font-weight: bold;">✏️</button>
            <button @click="deletarReceita(r.id)" style="background-color: #e74c3c; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">🗑️</button>
          </td>
        </tr>
        <tr v-if="receitasFiltradas.length === 0">
          <td colspan="7" style="text-align: center; color: gray; padding: 15px;">Nenhuma receita médica encontrada no histórico.</td>
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
      receitas: [],
      filtro: '',
      loading: true,
      error: null,
      editandoId: null,
      receitaForm: { 
        consulta: null, 
        data_emissao: '', 
        validade: '', 
        e_digital: true, 
        instrucoes: '' 
      }
    };
  },
  computed: {
    receitasFiltradas() {
      if (!this.filtro) return this.receitas;
      const q = this.filtro.toLowerCase();
      return this.receitas.filter(r => 
        String(r.consulta).includes(q) || 
        (r.instrucoes || '').toLowerCase().includes(q)
      );
    }
  },
  mounted() { this.buscarReceitas(); },
  methods: {
    // 🔍 GET - Listar Receitas
    async buscarReceitas() {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:8000/receita/api/');
        this.receitas = response.data;
        this.error = null;
      } catch (err) { 
        console.error(err);
        this.error = "Não foi possível carregar as receitas médicas. Verifique o servidor back-end."; 
      } finally { 
        this.loading = false; 
      }
    },

    // 💾 POST ou PUT - Salvar
    async salvarReceita() {
      try {
        // Isola estritamente as chaves aceitas pelo payload do Django, ignorando listas ManyToMany aninhadas no PUT
        const payload = {
          consulta: parseInt(this.receitaForm.consulta),
          data_emissao: this.receitaForm.data_emissao,
          validade: this.receitaForm.validade,
          e_digital: !!this.receitaForm.e_digital,
          instrucoes: this.receitaForm.instrucoes ? this.receitaForm.instrucoes.trim() : ''
        };

        if (this.editandoId) {
          const response = await axios.put(`http://localhost:8000/receita/api/${this.editandoId}/`, payload);
          const idx = this.receitas.findIndex(r => r.id === this.editandoId);
          this.receitas[idx] = response.data;
          this.editandoId = null;
          alert("Receita médica alterada com sucesso!");
        } else {
          const response = await axios.post('http://localhost:8000/receita/api/', payload);
          this.receitas.push(response.data);
          alert("Receita médica emitida com sucesso!");
        }
        this.resetarFormulario();
      } catch (err) { 
        console.error("Erro retornado do Django:", err.response?.data || err);
        alert("Erro ao processar receita. Certifique-se de que o ID da Consulta informado já existe cadastrado no sistema."); 
      }
    },

    carregarParaEditar(r) {
      this.editandoId = r.id;
      this.receitaForm = { 
        consulta: r.consulta,
        data_emissao: r.data_emissao,
        validade: r.validade,
        e_digital: r.e_digital,
        instrucoes: r.instrucoes
      };
    },

    cancelarEdicao() {
      this.editandoId = null;
      this.resetarFormulario();
    },

    resetarFormulario() {
      this.receitaForm = { consulta: null, data_emissao: '', validade: '', e_digital: true, instrucoes: '' };
    },

    // 🗑️ DELETE - Apagar do Banco
    async deletarReceita(id) {
      if (!confirm("Tem certeza que deseja revogar e excluir permanentemente esta receita?")) return;
      try {
        await axios.delete(`http://localhost:8000/receita/api/${id}/`);
        this.receitas = this.receitas.filter(r => r.id !== id);
        alert("Receita médica removida com sucesso!");
      } catch (err) { 
        console.error(err);
        alert("Erro ao remover o registro de receita."); 
      }
    },

    formatarData(d) { 
      if (!d) return '-'; 
      const [ano, mes, dia] = d.split('-'); 
      return `${dia}/${mes}/${ano}`; 
    },

    verificarValidade(v) { 
      if (!v) return ''; 
      const dataValidade = new Date(v + 'T00:00:00');
      const hoje = new Date();
      hoje.setHours(0,0,0,0);
      return dataValidade < hoje ? 'color: #c0392b; font-weight: bold; background-color: #f9e7e6;' : 'color: #27ae60; font-weight: bold;'; 
    }
  }
};
</script>