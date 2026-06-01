<template>
  <div style="padding: 20px; font-family: sans-serif;">
    <h2>📊 Resultados de Exames</h2>
    <p>Anexação de laudos laboratoriais, valores quantitativos de medição e diagnósticos.</p>

    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <h3 style="margin-top: 0;">{{ editandoId ? '✏️ Retificar Laudo Técnico' : '➕ Lançar Resultado de Exame' }}</h3>
      <form @submit.prevent="salvarResultado" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
        <input v-model.number="resForm.exame_solicitado" type="number" placeholder="ID do Exame Solicitado" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model="resForm.data_resultado" type="date" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model="resForm.valor" type="number" step="0.01" placeholder="Valor Medido (Ex: 140.5)" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model="resForm.unidade_medida" type="text" placeholder="Unidade de Medida (Ex: mg/dL)" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <textarea v-model="resForm.conclusoes" placeholder="Conclusões Clínicas e Laudo Técnico Descritivo" required style="padding: 8px; grid-column: span 1; height: 40px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
        <div style="display: flex; gap: 5px; align-items: flex-end;">
          <button type="submit" style="flex: 1; background-color: #2ecc71; color: white; border: none; padding: 8px; border-radius: 4px; font-weight: bold; cursor: pointer; height: 37px;">Emitir Laudo</button>
          <button v-if="editandoId" @click="cancelarEdicao" type="button" style="background-color: #95a5a6; color: white; border: none; padding: 8px; border-radius: 4px; height: 37px; cursor: pointer;">X</button>
        </div>
      </form>
    </div>

    <div style="margin: 20px 0;">
      <input type="text" v-model="filtro" placeholder="🔍 Buscar por ID do exame ou laudo..." style="padding: 10px; width: 100%; max-width: 400px; border: 1px solid #ccc; border-radius: 4px;" />
    </div>

    <div v-if="loading" style="color: #3498db; font-weight: bold;">🔄 Puxando laudos do servidor...</div>
    <div v-else-if="error" style="color: #e74c3c; background-color: #fce4e4; padding: 15px; border-radius: 4px; margin: 20px 0;">⚠️ {{ error }}</div>
    
    <table v-else border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; background-color: white; text-align: left;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th>ID</th>
          <th>Exame Solicitado</th>
          <th>Data do Laudo</th>
          <th>Valor Medido</th>
          <th>Conclusões / Laudo</th>
          <th style="text-align: center; width: 200px;">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in resultadosFiltrados" :key="r.id">
          <td>{{ r.id }}</td>
          <td>📋 #{{ r.exame_solicitado }}</td>
          <td>{{ formatarData(r.data_resultado) }}</td>
          <td style="font-weight: bold; color: #2c3e50;">{{ r.valor }} <span style="font-size: 12px; color: #7f8c8d;">{{ r.unidade_medida }}</span></td>
          <td style="white-space: pre-line;">{{ r.conclusoes }}</td>
          <td style="text-align: center;">
            <button 
              @click="carregarParaEditar(r)" 
              style="background-color: #f39c12; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-right: 8px; transition: background 0.2s;"
              onmouseover="this.style.backgroundColor='#d35400'"
              onmouseout="this.style.backgroundColor='#f39c12'"
            >
              ✏️ Editar
            </button>
            <button 
              @click="deletarResultado(r.id)" 
              style="background-color: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: background 0.2s;"
              onmouseover="this.style.backgroundColor='#c0392b'"
              onmouseout="this.style.backgroundColor='#e74c3c'"
            >
              🗑️ Excluir
            </button>
          </td>
        </tr>
        <tr v-if="resultadosFiltrados.length === 0">
          <td colspan="6" style="text-align: center; color: gray; padding: 15px;">Nenhum resultado encontrado.</td>
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
      resultados: [],
      filtro: '',
      loading: true,
      error: null,
      editandoId: null,
      resForm: { exame_solicitado: null, data_resultado: '', valor: '', unidade_medida: '', conclusoes: '' }
    };
  },
  computed: {
    resultadosFiltrados() {
      if (!this.filtro) return this.resultados;
      const q = this.filtro.toLowerCase();
      return this.resultados.filter(r => 
        String(r.exame_solicitado).includes(q) || 
        (r.conclusoes || '').toLowerCase().includes(q)
      );
    }
  },
  mounted() { this.buscarResultados(); },
  methods: {
    // 🔍 GET - Listar Resultados
    async buscarResultados() {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:8000/resultadoexame/api/');
        this.resultados = response.data;
        this.error = null;
      } catch (err) { 
        console.error(err);
        this.error = "Não foi possível carregar os laudos médicos. Verifique o servidor back-end."; 
      } finally { 
        this.loading = false; 
      }
    },

    // 💾 POST ou PUT - Salvar
    async salvarResultado() {
      try {
        // Formata os tipos estritos garantindo o Float que o seu models.py exige no banco Oracle
        const payload = {
          exame_solicitado: parseInt(this.resForm.exame_solicitado),
          data_resultado: this.resForm.data_resultado,
          valor: parseFloat(this.resForm.valor),
          unidade_medida: this.resForm.unidade_medida.trim(),
          conclusoes: this.resForm.conclusoes.trim()
        };

        if (this.editandoId) {
          const response = await axios.put(`http://localhost:8000/resultadoexame/api/${this.editandoId}/`, payload);
          const idx = this.resultados.findIndex(r => r.id === this.editandoId);
          this.resultados[idx] = response.data;
          this.editandoId = null;
          alert("Laudo técnico retificado com sucesso!");
        } else {
          const response = await axios.post('http://localhost:8000/resultadoexame/api/', payload);
          this.resultados.push(response.data);
          alert("Resultado de exame lançado com sucesso!");
        }
        this.resetarFormulario();
      } catch (err) { 
        console.error("Erro completo do Django:", err.response?.data || err);
        alert("Erro ao salvar. Certifique-se de que o ID do Exame Solicitado existe cadastrado no sistema."); 
      }
    },

    carregarParaEditar(r) {
      this.editandoId = r.id;
      this.resForm = {
        exame_solicitado: r.exame_solicitado,
        data_resultado: r.data_resultado,
        valor: r.valor,
        unidade_medida: r.unidade_medida,
        conclusoes: r.conclusoes
      };
    },

    cancelarEdicao() {
      this.editandoId = null;
      this.resetarFormulario();
    },

    resetarFormulario() {
      this.resForm = { exame_solicitado: null, data_resultado: '', valor: '', unidade_medida: '', conclusoes: '' };
    },

    // 🗑️ DELETE - Apagar do Banco
    async deletarResultado(id) {
      if (!confirm("Tem certeza que deseja excluir este laudo definitivo?")) return;
      try {
        await axios.delete(`http://localhost:8000/resultadoexame/api/${id}/`);
        this.resultados = this.resultados.filter(r => r.id !== id);
        alert("Laudo técnico removido com sucesso!");
      } catch (err) { 
        console.error(err);
        alert("Erro ao remover o laudo técnico do banco de dados."); 
      }
    },

    formatarData(d) { 
      if (!d) return '-'; 
      const [ano, mes, dia] = d.split('-'); 
      return `${dia}/${mes}/${ano}`; 
    }
  }
};
</script>