<template>
  <div style="padding: 20px; font-family: sans-serif;">
    <h2>📝 Histórico de Anamneses</h2>
    <p>Controle de entrevistas clínicas vinculadas a pacientes e médicos.</p>

    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <h3 style="margin-top: 0;">{{ editandoId ? '✏️ Editar Anamnese' : '➕ Registrar Nova Anamnese' }}</h3>
      <form @submit.prevent="salvarAnamnese" style="display: flex; flex-direction: column; gap: 12px;">
        
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 200px;">
            <label style="display: block; font-size: 13px; font-weight: bold; margin-bottom: 4px;">ID do Paciente *</label>
            <input v-model.number="anamneseForm.paciente" type="number" placeholder="Ex: 1" required style="padding: 8px; width: 100%; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px;" />
          </div>
          <div style="flex: 1; min-width: 200px;">
            <label style="display: block; font-size: 13px; font-weight: bold; margin-bottom: 4px;">ID do Médico *</label>
            <input v-model.number="anamneseForm.medico" type="number" placeholder="Ex: 1" required style="padding: 8px; width: 100%; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px;" />
          </div>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 200px;">
            <label style="display: block; font-size: 13px; font-weight: bold; margin-bottom: 4px;">Consumo de Álcool</label>
            <select v-model="anamneseForm.alcool" style="padding: 8px; width: 100%; border: 1px solid #ccc; border-radius: 4px; background: white;">
              <option value="NAO">Não consome</option>
              <option value="EVE">Eventual</option>
              <option value="DIA">Diário</option>
            </select>
          </div>
          <div style="flex: 1; min-width: 200px;">
            <label style="display: block; font-size: 13px; font-weight: bold; margin-bottom: 4px;">Fumante</label>
            <select v-model="anamneseForm.fumante" style="padding: 8px; width: 100%; border: 1px solid #ccc; border-radius: 4px; background: white;">
              <option value="NAO">Não consome</option>
              <option value="EVE">Eventual</option>
              <option value="DIA">Diário</option>
            </select>
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 13px; font-weight: bold; margin-bottom: 4px;">Queixa Principal *</label>
          <textarea v-model="anamneseForm.queixa_principal" placeholder="O que o paciente está sentindo?" required style="padding: 8px; width: 100%; box-sizing: border-box; height: 60px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
        </div>

        <div>
          <label style="display: block; font-size: 13px; font-weight: bold; margin-bottom: 4px;">Alergias *</label>
          <textarea v-model="anamneseForm.alergias" placeholder="Informe as alergias ou 'Nenhuma'" required style="padding: 8px; width: 100%; box-sizing: border-box; height: 50px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
        </div>

        <div>
          <label style="display: block; font-size: 13px; font-weight: bold; margin-bottom: 4px;">Medicamentos em Uso *</label>
          <textarea v-model="anamneseForm.medicamentos" placeholder="Medicamentos contínuos ou 'Nenhum'" required style="padding: 8px; width: 100%; box-sizing: border-box; height: 50px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
        </div>

        <div style="display: flex; gap: 5px; max-width: 300px; margin-top: 5px;">
          <button type="submit" style="flex: 1; background-color: #2ecc71; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">
            {{ editandoId ? 'Atualizar Anamnese' : 'Salvar no Prontuário' }}
          </button>
          <button v-if="editandoId" @click="cancelarEdicao" type="button" style="background-color: #95a5a6; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer;">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <div style="margin: 20px 0;">
      <input type="text" v-model="filtro" placeholder="🔍 Buscar por queixa, alergias ou medicamentos..." style="padding: 10px; width: 100%; max-width: 400px; border: 1px solid #ccc; border-radius: 4px;" />
    </div>

    <div v-if="loading" style="color: #3498db; font-weight: bold;">🔄 Carregando prontuários...</div>
    <div v-else-if="error" style="color: #e74c3c; background-color: #fce4e4; padding: 15px; border-radius: 4px; margin: 20px 0;">⚠️ {{ error }}</div>

    <table v-else border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; background-color: white; text-align: left;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th>ID</th>
          <th>Paciente (ID)</th>
          <th>Médico (ID)</th>
          <th>Queixa Principal</th>
          <th>Alergias</th>
          <th>Álcool / Fumo</th>
          <th>Data Criação</th>
          <th style="text-align: center; width: 180px;">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="anamnese in anamnesesFiltradas" :key="anamnese.id">
          <td>{{ anamnese.id }}</td>
          <td>👤 #{{ anamnese.paciente }}</td>
          <td>🩺 #{{ anamnese.medico }}</td>
          <td>{{ anamnese.queixa_principal }}</td>
          <td>{{ anamnese.alergias }}</td>
          <td>🍷 {{ traduzirFrequencia(anamnese.alcool) }} / 🚬 {{ traduzirFrequencia(anamnese.fumante) }}</td>
          <td>{{ formatarDataHora(anamnese.data_criacao) }}</td>
          <td style="text-align: center;">
            <button @click="carregarParaEditar(anamnese)" style="background-color: #f39c12; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px; font-weight: bold;">✏️ Editar</button>
            <button @click="deletarAnamnese(anamnese.id)" style="background-color: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">🗑️ Excluir</button>
          </td>
        </tr>
        <tr v-if="anamnesesFiltradas.length === 0">
          <td colspan="8" style="text-align: center; color: gray; padding: 15px;">Nenhum registro encontrado.</td>
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
      anamneseForm: {
        paciente: null,
        medico: null,
        queixa_principal: '',
        alergias: '',
        medicamentos: '',
        alcool: 'NAO',
        fumante: 'NAO'
      }
    };
  },
  computed: {
    anamnesesFiltradas() {
      if (!this.filtro) return this.anamneses;
      const q = this.filtro.toLowerCase();
      return this.anamneses.filter(a => 
        (a.queixa_principal && a.queixa_principal.toLowerCase().includes(q)) || 
        (a.alergias && a.alergias.toLowerCase().includes(q)) ||
        (a.medicamentos && a.medicamentos.toLowerCase().includes(q))
      );
    }
  },
  mounted() { 
    this.buscarAnamneses(); 
  },
  methods: {
    // 🔍 GET - Listar
    async buscarAnamneses() {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:8000/anamnese/api/');
        this.anamneses = response.data;
        this.error = null;
      } catch (err) { 
        console.error(err);
        this.error = "Não foi possível carregar os históricos. Verifique o servidor back-end."; 
      } finally { 
        this.loading = false; 
      }
    },

    // 💾 POST ou PUT - Salvar
    async salvarAnamnese() {
      try {
        if (this.editandoId) {
          const response = await axios.put(`http://localhost:8000/anamnese/api/${this.editandoId}/`, this.anamneseForm);
          const idx = this.anamneses.findIndex(a => a.id === this.editandoId);
          this.anamneses[idx] = response.data;
          this.editandoId = null;
          alert("Anamnese atualizada com sucesso!");
        } else {
          const response = await axios.post('http://localhost:8000/anamnese/api/', this.anamneseForm);
          this.anamneses.push(response.data);
          alert("Anamnese registrada com sucesso!");
        }
        this.resetarFormulario();
      } catch (err) { 
        console.error("Erro do Django:", err.response?.data || err);
        alert("Erro ao salvar. Certifique-se de que o ID do Paciente e o ID do Médico já existem cadastrados no banco."); 
      }
    },

    carregarParaEditar(anamnese) {
      this.editandoId = anamnese.id;
      this.anamneseForm = { ...anamnese };
    },

    cancelarEdicao() {
      this.editandoId = null;
      this.resetarFormulario();
    },

    resetarFormulario() {
      this.anamneseForm = { paciente: null, medico: null, queixa_principal: '', alergias: '', medicamentos: '', alcool: 'NAO', fumante: 'NAO' };
    },

    // 🗑️ DELETE - Apagar
    async deletarAnamnese(id) {
      if (!confirm("Tem certeza de que deseja remover permanentemente esta anamnese?")) return;
      try {
        await axios.delete(`http://localhost:8000/anamnese/api/${id}/`);
        this.anamneses = this.anamneses.filter(a => a.id !== id);
        alert("Anamnese removida com sucesso!");
      } catch (err) { 
        alert("Falha ao apagar o registro."); 
      }
    },

    // Auxiliares de Formatação
    formatarDataHora(dataString) {
      if (!dataString) return '-';
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    },

    traduzirFrequencia(sigla) {
      const mapa = {
        'NAO': 'Não consome',
        'EVE': 'Eventual',
        'DIA': 'Diário'
      };
      return mapa[sigla] || sigla;
    }
  }
};
</script>