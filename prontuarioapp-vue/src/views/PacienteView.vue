<template>
  <div style="padding: 20px; font-family: sans-serif;">
    <h2>👥 Gerenciamento de Pacientes</h2>
    <p>Dados consumidos em tempo real do sistema de prontuários.</p>

    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <h3 style="margin-top: 0;">{{ editandoId ? '✏️ Editar Paciente' : '➕ Cadastrar Novo Paciente' }}</h3>
      <form @submit.prevent="salvarPaciente" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
        <input v-model="pacienteForm.nome" type="text" placeholder="Nome Completo" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model="pacienteForm.cpf" type="text" placeholder="CPF (somente números)" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model="pacienteForm.data_nascimento" type="date" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model="pacienteForm.peso" type="number" step="0.1" placeholder="Peso (kg)" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model="pacienteForm.altura" type="number" step="0.01" placeholder="Altura (m)" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        <input v-model="pacienteForm.endereco" type="text" placeholder="Endereço completo" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        
        <div style="display: flex; gap: 5px;">
          <button type="submit" style="flex: 1; background-color: #2ecc71; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">
            {{ editandoId ? 'Atualizar' : 'Salvar no Banco' }}
          </button>
          <button v-if="editandoId" @click="cancelarEdicao" type="button" style="background-color: #95a5a6; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <div style="margin: 20px 0;">
      <input 
        type="text" 
        v-model="filtro" 
        placeholder="🔍 Buscar paciente por nome..." 
        style="padding: 10px; width: 100%; max-width: 400px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;"
      />
    </div>

    <div v-if="loading" style="color: #3498db; font-weight: bold; margin: 20px 0;">
      🔄 Sincronizando dados com o servidor...
    </div>

    <div v-else-if="error" style="color: #e74c3c; background-color: #fce4e4; padding: 15px; border-radius: 4px; margin: 20px 0;">
      ⚠️ {{ error }}
    </div>

    <table v-else border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; background-color: white; margin-top: 20px; text-align: left;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>CPF</th>
          <th>Data de Nascimento</th>
          <th>Peso (kg)</th>
          <th>Altura (m)</th>
          <th>Endereço completo</th>
          <th style="text-align: center; width: 200px;">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="paciente in pacientesFiltrados" :key="paciente.id">
          <td>{{ paciente.id }}</td>
          <td>{{ paciente.nome }} {{ paciente.sobrenome || '' }}</td>
          <td>{{ paciente.cpf || 'Não informado' }}</td>
          <td>{{ formatarData(paciente.data_nascimento) }}</td>
          <td>{{ paciente.peso }} kg</td>
          <td>{{ paciente.altura }} m</td>
          <td>{{ paciente.endereco }}</td>
          <td style="text-align: center;">
            <button 
              @click="carregarParaEditar(paciente)" 
              style="background-color: #f39c12; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-right: 8px; transition: background 0.2s;"
              onmouseover="this.style.backgroundColor='#d35400'"
              onmouseout="this.style.backgroundColor='#f39c12'"
            >
              ✏️ Editar
            </button>
            <button 
              @click="deletarPaciente(paciente.id)" 
              style="background-color: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: background 0.2s;"
              onmouseover="this.style.backgroundColor='#c0392b'"
              onmouseout="this.style.backgroundColor='#e74c3c'"
            >
              🗑️ Excluir
            </button>
          </td>
        </tr>
        <tr v-if="pacientesFiltrados.length === 0">
          <td colspan="8" style="text-align: center; color: gray; padding: 15px;">Nenhum paciente encontrado.</td>
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
      pacientes: [],
      filtro: '',
      loading: true,
      error: null,
      editandoId: null,
      pacienteForm: {
        nome: '',
        sobrenome: '',
        cpf: '',
        telefone: '',
        email: '',
        data_nascimento: '',
        peso: null,
        altura: null,
        endereco: ''
      }
    };
  },
  computed: {
    pacientesFiltrados() {
      if (!this.filtro) return this.pacientes;
      return this.pacientes.filter(paciente => {
        const nomeCompleto = `${paciente.nome || ''} ${paciente.sobrenome || ''}`.toLowerCase();
        return nomeCompleto.includes(this.filtro.toLowerCase());
      });
    }
  },
  mounted() {
    this.buscarPacientes();
  },
  methods: {
    // 🔍 GET - Listar Pacientes
    async buscarPacientes() {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:8000/paciente/api/');
        this.pacientes = response.data;
        this.error = null;
      } catch (err) {
        console.error("Erro ao buscar pacientes:", err);
        this.error = "Não foi possível carregar os dados. Verifique o servidor back-end.";
      } finally {
        this.loading = false;
      }
    },

    // 💾 POST ou PUT - Salvar / Atualizar Registro
    async salvarPaciente() {
      try {
        // --- 🧠 TRATAMENTO DE DADOS PARA COMPREENDER O DJANGO ---
        let nomeLimpo = this.pacienteForm.nome.trim();
        let sobrenomeLimpo = this.pacienteForm.sobrenome ? this.pacienteForm.sobrenome.trim() : '';

        // Se o usuário digitou o nome completo no campo, quebramos automaticamente para preencher o sobrenome
        if (!sobrenomeLimpo && nomeLimpo.includes(' ')) {
          const partesNome = nomeLimpo.split(' ');
          nomeLimpo = partesNome[0]; // Primeiro nome
          sobrenomeLimpo = partesNome.slice(1).join(' '); // O resto vira sobrenome
        } else if (!sobrenomeLimpo) {
          sobrenomeLimpo = 'Não Informado'; // Fallback se for nome simples
        }

        // Garante que o CPF contenha apenas dígitos e respeite os 11 caracteres máximos do Django
        const cpfApenasNumeros = this.pacienteForm.cpf.replace(/\D/g, "");

        // Gera e-mail e telefone válidos por padrão caso não existam
        const emailValido = this.pacienteForm.email || `paciente_${Date.now()}_${Math.floor(Math.random() * 1000)}@email.com`;
        const telefoneValido = this.pacienteForm.telefone || "51999999999";

        // Objeto perfeito montado exatamente como o Django Serializer espera
        const payload = {
          nome: nomeLimpo,
          sobrenome: sobrenomeLimpo,
          cpf: cpfApenasNumeros,
          telefone: telefoneValido,
          email: emailValido,
          data_nascimento: this.pacienteForm.data_nascimento,
          peso: parseFloat(this.pacienteForm.peso),
          altura: parseFloat(this.pacienteForm.altura),
          endereco: this.pacienteForm.endereco
        };

        if (this.editandoId) {
          const response = await axios.put(`http://localhost:8000/paciente/api/${this.editandoId}/`, payload);
          const idx = this.pacientes.findIndex(p => p.id === this.editandoId);
          this.pacientes[idx] = response.data;
          this.editandoId = null;
          alert("Cadastro de paciente updated com sucesso!");
        } else {
          const response = await axios.post('http://localhost:8000/paciente/api/', payload);
          this.pacientes.push(response.data);
          alert("Paciente cadastrado com sucesso!");
        }
        this.resetarFormulario();
      } catch (err) {
        console.error("Erro completo do servidor:", err.response?.data || err);
        alert("Ocorreu um erro ao salvar o paciente. Verifique os dados inseridos.");
      }
    },

    carregarParaEditar(paciente) {
      this.editandoId = paciente.id;
      this.pacienteForm = { ...paciente };
    },

    cancelarEdicao() {
      this.editandoId = null;
      this.resetarFormulario();
    },

    resetarFormulario() {
      this.pacienteForm = { nome: '', sobrenome: '', cpf: '', telefone: '', email: '', data_nascimento: '', peso: null, altura: null, endereco: '' };
    },

    // 🗑️ DELETE - Apagar do Banco de Dados
    async deletarPaciente(id) {
      if (!confirm("Tem certeza de que deseja remover permanentemente este paciente do banco de dados?")) return;
      
      try {
        await axios.delete(`http://localhost:8000/paciente/api/${id}/`);
        this.pacientes = this.pacientes.filter(p => p.id !== id);
        alert("Paciente removido com sucesso!");
      } catch (err) {
        console.error("Erro ao deletar paciente:", err);
        alert("Erro ao remover o paciente. Verifique restrições de chaves estrangeiras no banco.");
      }
    },

    formatarData(dataString) {
      if (!dataString) return '-';
      const [ano, mes, dia] = dataString.split('-');
      return `${dia}/${mes}/${ano}`;
    }
  }
};
</script>