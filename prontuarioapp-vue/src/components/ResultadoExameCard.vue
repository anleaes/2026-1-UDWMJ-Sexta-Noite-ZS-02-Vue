<template>
  <q-card bordered class="q-mb-md">
    <q-card-section>
      <div class="text-h6">{{ modeloResultado.id ? 'Atualizar Laudo de Resultado' : 'Lançar Resultado de Exame' }}</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="submeterFormulario" class="q-gutter-md">
        <q-select
          outlined dense
          v-model="modeloResultado.exame_solicitado"
          :options="opcoesExames"
          label="Exame Solicitado Relacionado"
          emit-value map-options
          option-value="id" option-label="label"
          required
        />

        <q-separator dashed />

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input outlined dense v-model="modeloResultado.data_resultado" type="date" label="Data do Resultado" required />
          </div>
          <div class="col-12 col-md-4">
            <q-input outlined dense v-model.number="modeloResultado.valor" type="number" step="0.01" label="Valor Encontrado" required />
          </div>
          <div class="col-12 col-md-4">
            <q-input outlined dense v-model="modeloResultado.unidade_medida" label="Unidade de Medida" required />
          </div>
        </div>

        <q-separator dashed />

        <q-input
          outlined dense
          v-model="modeloResultado.conclusoes"
          type="textarea"
          rows="3"
          label="Conclusões do Laudo / Observações Clínicas"
          required
        />

        <div class="row q-gutter-sm">
          <q-btn type="submit" color="primary" :label="modeloResultado.id ? 'Salvar Alterações' : 'Lançar Laudo'" />
          <q-btn v-if="modeloResultado.id" color="grey" flat label="Cancelar" @click="cancelarAcao" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  listaExames: { type: Array, required: true }
})

const emit = defineEmits(['update:modelValue', 'salvar', 'cancelar'])

const modeloResultado = computed({
  get: () => props.modelValue,
  set: (valoresAtualizados) => emit('update:modelValue', valoresAtualizados)
})

const opcoesExames = computed(() =>
  props.listaExames.map(e => ({
    id: e.id,
    label: `ID #${e.id} — Exame: ${e.nome_exame} (Ref. Consulta #${e.consulta})`
  }))
)

const submeterFormulario = () => emit('salvar')
const cancelarAcao = () => emit('cancelar')
</script>
