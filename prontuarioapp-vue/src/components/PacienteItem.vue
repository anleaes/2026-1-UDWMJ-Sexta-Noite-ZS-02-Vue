<template>
  <q-card class="my-card q-mb-md" bordered>
    <q-card-section>
      <div class="text-h6">{{ paciente.nome }} {{ paciente.sobrenome }}</div>
      <div class="text-primary text-weight-medium q-mt-xs">
        <strong>CPF:</strong> {{ formatarCPF(paciente.cpf) }} |
        <strong>E-mail:</strong> {{ paciente.email }}
      </div>
      <p class="q-mb-xs"><strong>Contato:</strong> {{ paciente.telefone }}</p>
      <p class="q-mb-xs">
        <strong>Peso:</strong> {{ paciente.peso }} kg |
        <strong>Altura:</strong> {{ paciente.altura }} m |
        <strong>Idade:</strong> {{ calcularIdade(paciente.data_nascimento) }} anos
      </p>
      <p class="text-grey-7 text-italic q-mb-none"><strong>Endereço:</strong> {{ paciente.endereco }}</p>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat color="warning" label="Editar" icon="edit" @click="$emit('editar', paciente)" />
      <q-btn flat color="negative" label="Excluir" icon="delete" @click="$emit('deletar', paciente.id)" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
defineProps({ paciente: { type: Object, required: true } })
defineEmits(['editar', 'deletar'])

const formatarCPF = (cpf) => {
  if (!cpf || cpf.length !== 11) return cpf
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const calcularIdade = (dataNasc) => {
  if (!dataNasc) return ''
  const hoje = new Date()
  const nascimento = new Date(dataNasc)
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const m = hoje.getMonth() - nascimento.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--
  return idade
}
</script>
