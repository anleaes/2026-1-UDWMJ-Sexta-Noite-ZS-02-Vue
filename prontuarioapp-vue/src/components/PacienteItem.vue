<template>
  <div class="paciente-item">
    <div class="info">
      <h4>{{ paciente.nome }} {{ paciente.sobrenome }}</h4>
      <p class="meta-dados">
        <strong>CPF:</strong> {{ formatarCPF(paciente.cpf) }} | 
        <strong>E-mail:</strong> {{ paciente.email }}
      </p>
      <p><strong>Contato:</strong> {{ paciente.telefone }}</p>
      <p>
        <strong>Peso:</strong> {{ paciente.peso }} kg | 
        <strong>Altura:</strong> {{ paciente.altura }} m | 
        <strong>Idade:</strong> {{ calcularIdade(paciente.data_nascimento) }} anos
      </p>
      <p class="end"><strong>Endereço:</strong> {{ paciente.endereco }}</p>
    </div>
    <div class="acoes">
      <button @click="$emit('editar', paciente)" class="btn-edit">Editar</button>
      <button @click="$emit('deletar', paciente.id)" class="btn-delete">Excluir</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  paciente: {
    type: Object,
    required: true
  }
});

defineEmits(['editar', 'deletar']);

const formatarCPF = (cpf) => {
  if (!cpf || cpf.length !== 11) return cpf;
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const calcularIdade = (dataNasc) => {
  if (!dataNasc) return '';
  const hoje = new Date();
  const nascimento = new Date(dataNasc);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
};
</script>

<style scoped>
.paciente-item { border: 1px solid #e0e0e0; padding: 16px; margin-bottom: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 5px solid #2196f3; }
.info h4 { margin: 0 0 6px 0; color: #2c3e50; font-size: 18px; }
.info p { margin: 4px 0; color: #555; font-size: 14px; }
.meta-dados { color: #1e88e5 !important; font-weight: 500; }
.end { font-style: italic; color: #7f8c8d !important; }
.acoes button { margin-left: 8px; padding: 8px 16px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold; }
.btn-edit { background-color: #f39c12; color: #fff; }
.btn-edit:hover { background-color: #e67e22; }
.btn-delete { background-color: #c0392b; color: #fff; }
.btn-delete:hover { background-color: #a62c20; }
</style>