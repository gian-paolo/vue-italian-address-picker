<script setup lang="ts">
import { useItalianAddress } from '../composables/useItalianAddress';
import AnncsuiMunicipality from './atomic/AnncsuiMunicipality.vue';
import AnncsuiStreet from './atomic/AnncsuiStreet.vue';
import AnncsuiAddress from './atomic/AnncsuiAddress.vue';
import AnncsuiVariant from './atomic/AnncsuiVariant.vue';
import { watch } from 'vue';

const props = defineProps({
  baseUrl: { type: String, default: 'https://anncsu-api.dataws.it/v1' },
  modelValue: { 
    type: Object, 
    default: () => ({ municipality: null, street: null, address: null, variant: null }) 
  },
  mode: { type: String, default: 'cascaded', validator: (v: string) => ['cascaded', 'unified'].includes(v) },
  layout: { type: String, default: 'grid', validator: (v: string) => ['grid', 'vertical'].includes(v) },
  placeholderMunicipality: { type: String },
  placeholderStreet: { type: String },
  placeholderNumber: { type: String },
  placeholderVariant: { type: String },
});

const emit = defineEmits(['update:modelValue', 'change', 'select']);

const { 
  state, 
  loading, 
  suggestions, 
  searchMunicipalities, 
  searchStreets, 
  searchAddresses 
} = useItalianAddress({
  baseUrl: props.baseUrl,
  initialState: props.modelValue,
  onStateChange: (newState) => {
    emit('update:modelValue', newState);
    emit('change', newState);
    emit('select', newState);
  }
});

// Update internal state if props.modelValue changes from outside
watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(state.value)) {
    state.value = { ...state.value, ...newVal };
  }
}, { deep: true });

</script>

<template>
  <div class="anncsui-container" :class="layout === 'grid' ? 'p-fluid grid formgrid' : 'flex flex-column gap-3'">
    <!-- COMUNE -->
    <div :class="layout === 'grid' ? 'field col-12 md:col-4' : 'field w-full'">
      <label class="font-bold block mb-2">Comune</label>
      <AnncsuiMunicipality
        v-model="state.municipality"
        :suggestions="suggestions.municipalities"
        :loading="loading.municipalities"
        :placeholder="placeholderMunicipality"
        @complete="searchMunicipalities"
      />
    </div>

    <!-- STRADA -->
    <div :class="layout === 'grid' ? 'field col-12 md:col-6' : 'field w-full'">
      <label class="font-bold block mb-2">Indirizzo</label>
      <AnncsuiStreet
        v-model="state.street"
        :suggestions="suggestions.streets"
        :loading="loading.streets"
        :disabled="!state.municipality"
        :placeholder="placeholderStreet"
        @complete="searchStreets"
      />
    </div>

    <!-- CIVICO -->
    <div :class="layout === 'grid' ? (mode === 'cascaded' ? 'field col-12 md:col-2' : 'field col-12 md:col-2') : 'field w-full'">
      <label class="font-bold block mb-2">Civico</label>
      <AnncsuiAddress
        v-model="state.address"
        :suggestions="mode === 'unified' ? suggestions.variants : suggestions.addresses"
        :loading="loading.addresses"
        :disabled="!state.street"
        :isSelect="mode === 'cascaded'"
        :placeholder="placeholderNumber"
        @complete="searchAddresses($event, mode === 'unified')"
      />
    </div>

    <!-- VARIANTE (Only in cascaded mode and if variants exist) -->
    <div v-if="mode === 'cascaded' && (state.variant || suggestions.variants.length > 0)" 
         :class="layout === 'grid' ? 'field col-12 md:col-2' : 'field w-full'">
      <label class="font-bold block mb-2">Variante</label>
      <AnncsuiVariant
        v-model="state.variant"
        :suggestions="suggestions.variants"
        :loading="loading.variants"
        :placeholder="placeholderVariant"
      />
    </div>
  </div>
</template>

<style scoped>
.anncsui-container {
  background: var(--surface-card, #fff);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border: 1px solid var(--surface-border, #eee);
}
label {
  color: var(--text-color, #444);
  font-size: 0.9rem;
}
</style>
