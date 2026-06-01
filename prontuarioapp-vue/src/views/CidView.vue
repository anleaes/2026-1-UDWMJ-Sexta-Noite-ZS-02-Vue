<template>
  <div class="container" style="font-family: sans-serif; padding: 20px;">
    <h2>📋 Cadastro Geral de CIDs</h2>
    <p>Consulte ou configure os códigos diagnósticos consumidos pelo sistema de prontuários.</p>

    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <h3 style="margin-top: 0;">{{ editandoId ? '✏️ Alterar Termo de CID' : '➕ Cadastrar Novo Código CID' }}</h3>
      <form @submit.prevent="salvarCid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
        <input v-model="cidForm.cod_cid" type="text" placeholder="Código (Ex: J11)" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model="cidForm.descricao" type="text" placeholder="Descrição Diagnóstica Completa" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <div style="display: flex; gap: 5px;">
          <button type="submit" style="flex: 1; background-color: #2ecc71; color: white; border: none; padding: 8px; border-radius: 4px; font-weight: bold; cursor: pointer;">Confirmar</button>
          <button v-if="editandoId" @click="cancelarEdicao" type="button" style="background-color: #95a5a6; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">X</button>
        </div>
      </form>
    </div>

    <div style="margin: 20px 0;">
      <input v-model="searchQuery" type="text" placeholder="🔍 Digite o código ou a descrição do CID..." style="padding: 10px; width: 100%; max-width: 400px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;" />
    </div>

    <div v-if="loading" style="color: #3498db; font-weight: bold;">🔄 Sincronizando tabela de códigos...</div>
    <div v-else-if="error" style="color: #e74c3c; background-color: #fce4e4; padding: 15px; border-radius: 4px; margin: 20px 0;">⚠️ {{ error }}</div>
    
    <table v-else border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; text-align: left; background-color: white;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th>ID</th>
          <th>Código CID</th>
          <th>Descrição Diagnóstica</th>
          <th>Tipo</th>
          <th>Status</th>
          <th style="text-align: center; width: 200px;">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cid in filteredCids" :key="cid.id">
          <td>{{ cid.id }}</td>
          <td style="font-weight: bold; color: #2c3e50;">{{ cid.cod_cid }}</td>
          <td>{{ cid.descricao }}</td>
          <td>{{ cid.tipo || 'Geral' }}</td>
          <td>
            <span :style="{ color: cid.status_ativo ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }">
              {{ cid.status_ativo ? 'Ativo' : 'Inativo' }}
            </span>
          </td>
          <td style="text-align: center;">
            <button 
              @click="carregarParaEditar(cid)" 
              style="background-color: #f39c12; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-right: 8px; transition: background 0.2s;"
              onmouseover="this.style.backgroundColor='#d35400'"
              onmouseout="this.style.backgroundColor='#f39c12'"
            >
              ✏️ Editar
            </button>
            <button 
              @click="deletarCid(cid.id)" 
              style="background-color: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: background 0.2s;"
              onmouseover="this.style.backgroundColor='#c0392b'"
              onmouseout="this.style.backgroundColor='#e74c3c'"
            >
              🗑️ Excluir
            </button>
          </td>
        </tr>
        <tr v-if="filteredCids.length === 0">
          <td colspan="6" style="text-align: center; color: gray; padding: 15px;">Nenhum CID encontrado.</td>
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
      searchQuery: '',
      cids: [],
      loading: true,
      error: null,
      editandoId: null,
      cidForm: {
        cod_cid: '',
        descricao: '',
        sintomas: '',
        tipo: '',
        status_ativo: true
      }
    };
  },
  computed: {
    filteredCids() {
      return this.cids.filter(cid => {
        const query = this.searchQuery.toLowerCase();
        const codigo = (cid.cod_cid || '').toLowerCase();
        const desc = (cid.descricao || '').toLowerCase();
        return codigo.includes(query) || desc.includes(query);
      });
    }
  },
  mounted() { this.buscarCids(); },
  methods: {
    // 🔍 GET - Listar CIDs
    async buscarCids() {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:8000/cid/api/');
        this.cids = response.data;
        this.error = null;
      } catch (err) {
        console.error(err);
        this.error = "Não foi possível carregar a tabela de CIDs. Verifique o back-end.";
      } finally {
        this.loading = false;
      }
    },

    // 💾 POST ou PUT - Salvar
    async salvarCid() {
      try {
        // Monta o payload garantindo o envio dos campos obrigatórios que o seu models.py exige
        const payload = {
          cod_cid: this.cidForm.cod_cid.trim().toUpperCase(),
          descricao: this.cidForm.descricao.trim(),
          sintomas: this.cidForm.sintomas || "Sintomas gerais associados ao diagnóstico.", // Fallback obrigatório
          tipo: this.cidForm.tipo || "Geral", // Fallback obrigatório
          status_ativo: this.cidForm.status_ativo ?? true
        };

        if (this.editandoId) {
          const response = await axios.put(`http://localhost:8000/cid/api/${this.editandoId}/`, payload);
          const idx = this.cids.findIndex(c => c.id === this.editandoId);
          this.cids[idx] = response.data;
          this.editandoId = null;
          alert("Código CID atualizado com sucesso!");
        } else {
          const response = await axios.post('http://localhost:8000/cid/api/', payload);
          this.cids.push(response.data);
          alert("Código CID cadastrado com sucesso!");
        }
        this.resetarFormulario();
      } catch (err) {
        console.error("Erro retornado do Django:", err.response?.data || err);
        const errosDoServidor = err.response?.data;
        
        if (errosDoServidor && errosDoServidor.cod_cid) {
          alert("Erro: Este código CID já está cadastrado no banco. Escolha um código único.");
        } else {
          alert("Ocorreu um erro ao salvar o CID. Verifique os dados.");
        }
      }
    },

    carregarParaEditar(c) {
      this.editandoId = c.id;
      this.cidForm = {
        cod_cid: c.cod_cid,
        descricao: c.descricao,
        sintomas: c.sintomas,
        tipo: c.tipo,
        status_ativo: c.status_ativo
      };
    },

    cancelarEdicao() {
      this.editandoId = null;
      this.resetarFormulario();
    },

    resetarFormulario() {
      this.cidForm = { cod_cid: '', descricao: '', sintomas: '', tipo: '', status_ativo: true };
    },

    // 🗑️ DELETE - Remover
    async deletarCid(id) {
      if (!confirm("Excluir este CID permanentemente?")) return;
      try {
        await axios.delete(`http://localhost:8000/cid/api/${id}/`);
        this.cids = this.cids.filter(c => c.id !== id);
        alert("Código CID removido com sucesso!");
      } catch (err) {
        console.error(err);
        alert("Bloqueado: Este código CID não pode ser excluído pois está vinculado a atestados ou prontuários ativos.");
      }
    }
  }
};
</script>