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
        <input v-model.number="atestadoForm.cid" type="number" placeholder="ID numérico do CID" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <div style="display: flex; gap: 5px;">
          <button type="submit" style="flex: 1; background-color: #2ecc71; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">
            {{ editandoId ? 'Atualizar' : 'Registrar' }}
          </button>
          <button v-if="editandoId" @click="cancelarEdicao" type="button" style="background-color: #95a5a6; color: white; padding: 8px; border: none; border-radius: 4px; cursor: pointer;">X</button>
        </div>
      </form>
    </div>

    <div style="margin: 20px 0;">
      <input type="text" v-model="filtro" placeholder="🔍 Buscar por código de autenticação..." style="padding: 10px; width: 100%; max-width: 400px; border: 1px solid #ccc; border-radius: 4px;" />
    </div>

    <div v-if="loading" style="color: #3498db; font-weight: bold;">🔄 Carregando registros de atestados...</div>
    <div v-else-if="error" style="color: #e74c3c; background-color: #fce4e4; padding: 15px; border-radius: 4px; margin: 20px 0;">⚠️ {{ error }}</div>
    
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
          <td>#{{ atestado.cid }}</td>
          <td style="text-align: center;">
            <button @click="carregarParaEditar(atestado)" style="background-color: #f39c12; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; margin-right: 4px; font-weight: bold;">✏️</button>
            <button @click="deletarAtestado(atestado.id)" style="background-color: #e74c3c; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">🗑️</button>
          </td>
        </tr>
        <tr v-if="atestadosFiltrados.length === 0">
          <td colspan="8" style="text-align: center; color: gray; padding: 15px;">Nenhum atestado emitido encontrado.</td>
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
      atestados: [],
      filtro: '',
      loading: true,
      error: null,
      editandoId: null,
      atestadoForm: {
        codigo_autenticacao: '',
        tipo_atestado: 'MEDICO',
        data_inicio_afastamento: '',
        quantidade_dias: null,
        consulta: null,
        cid: null
      }
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
    // 🔍 GET - Listar
    async buscarAtestados() {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:8000/atestado/api/');
        this.atestados = response.data;
        this.error = null;
      } catch (err) {
        console.error(err);
        this.error = "Não foi possível carregar os atestados. Verifique o servidor back-end.";
      } finally {
        this.loading = false;
      }
    },

    // 💾 POST ou PUT - Salvar
    async salvarAtestado() {
      try {
        // Formata os tipos numéricos explicitamente para o Django aceitar redondo
        const payload = {
          codigo_autenticacao: this.atestadoForm.codigo_autenticacao.trim(),
          tipo_atestado: this.atestadoForm.tipo_atestado,
          data_inicio_afastamento: this.atestadoForm.data_inicio_afastamento,
          quantidade_dias: parseInt(this.atestadoForm.quantidade_dias),
          consulta: parseInt(this.atestadoForm.consulta),
          cid: parseInt(this.atestadoForm.cid)
        };

        if (this.editandoId) {
          const response = await axios.put(`http://localhost:8000/atestado/api/${this.editandoId}/`, payload);
          const idx = this.atestados.findIndex(a => a.id === this.editandoId);
          this.atestados[idx] = response.data;
          this.editandoId = null;
          alert("Atestado atualizado com sucesso!");
        } else {
          const response = await axios.post('http://localhost:8000/atestado/api/', payload);
          this.atestados.push(response.data);
          alert("Atestado emitido com sucesso!");
        }
        this.resetarFormulario();
      } catch (err) {
        console.error("Erro completo enviado pelo Django:", err.response?.data || err);
        const errosDoServidor = err.response?.data;
        
        if (errosDoServidor && errosDoServidor.consulta) {
          alert("Erro: Esta Consulta já possui um atestado cadastrado (Regra de relacionamento 1-para-1 do banco!).");
        } else if (errosDoServidor && errosDoServidor.codigo_autenticacao) {
          alert("Erro: Esse Código de Autenticação já foi utilizado. Escolha uma chave única.");
        } else {
          alert("Erro ao salvar. Verifique se os IDs da Consulta e do CID já existem criados no banco.");
        }
      }
    },

    carregarParaEditar(a) {
      this.editandoId = a.id;
      // Garante que o formulário receba chaves limpas para edição
      this.atestadoForm = {
        codigo_autenticacao: a.codigo_autenticacao,
        tipo_atestado: a.tipo_atestado,
        data_inicio_afastamento: a.data_inicio_afastamento,
        quantidade_dias: a.quantidade_dias,
        consulta: a.consulta,
        cid: a.cid
      };
    },

    cancelarEdicao() {
      this.editandoId = null;
      this.resetarFormulario();
    },

    resetarFormulario() {
      this.atestadoForm = { codigo_autenticacao: '', tipo_atestado: 'MEDICO', data_inicio_afastamento: '', quantidade_dias: null, consulta: null, cid: null };
    },

    // 🗑️ DELETE - Apagar do Banco
    async deletarAtestado(id) {
      if (!confirm("Tem certeza que deseja revogar permanentemente este atestado?")) return;
      try {
        await axios.delete(`http://localhost:8000/atestado/api/${id}/`);
        this.atestados = this.atestados.filter(a => a.id !== id);
        alert("Atestado removido com sucesso!");
      } catch (err) {
        console.error(err);
        alert("Erro ao remover o atestado.");
      }
    },

    formatarData(d) {
      if (!d) return '-';
      const [ano, mes, dia] = d.split('-');
      return `${dia}/${mes}/${ano}`;
    },

    traduzirTipo(t) {
      return { 'MEDICO': 'Médico', 'ODONTO': 'Odontológico', 'OUTRO': 'Outro' }[t] || t;
    }
  }
};
</script>