<script setup lang="ts">
import { ref, watch } from 'vue';
// Importiamo il client e i tipi dal pacchetto core agnostico
import { ItalianAddressClient } from '@pallari/italian-address-client';
import type { Municipality, Street, Address } from '@pallari/italian-address-client';
import AutoComplete from 'primevue/autocomplete';

const props = defineProps({
  baseUrl: { type: String, default: 'https://anncsu-api.dataws.it/v1' },
  modelValue: { 
    type: Object, 
    default: () => ({ municipality: null, street: null, address: null }) 
  },
  placeholderMunicipality: { type: String, default: 'Cerca Comune (es. Milano)' },
  placeholderStreet: { type: String, default: 'Via, Piazza, Corso...' },
  placeholderNumber: { type: String, default: 'N°' },
  enableCivicColors: { type: Boolean, default: true },
});

const emit = defineEmits(['update:modelValue', 'select', 'change']);

// Inizializziamo il client "motore"
const client = new ItalianAddressClient({ baseUrl: props.baseUrl });

// States
const loading = ref({ municipalities: false, streets: false, addresses: false });
const suggestions = ref<{ municipalities: Municipality[], streets: Street[], addresses: Address[] }>({
  municipalities: [],
  streets: [],
  addresses: []
});

const selected = ref({ ...props.modelValue });

// 1. Cerca Comuni (Usa il metodo nativo del client)
const onSearchMunicipality = async (event: any) => {
  if (event.query.trim().length < 2) return;
  loading.value.municipalities = true;
  try {
    suggestions.value.municipalities = await client.searchMunicipalities(event.query, { limit: 10 });
  } finally {
    loading.value.municipalities = false;
  }
};

// 2. Cerca Strade (Filtra per comune selezionato)
const onSearchStreet = async (event: any) => {
  if (!selected.value.municipality || event.query.trim().length < 3) return;
  loading.value.streets = true;
  try {
    suggestions.value.streets = await client.searchStreets(event.query, { 
      istat_code: selected.value.municipality.istat_code,
      limit: 15 
    });
  } finally {
    loading.value.streets = false;
  }
};

// 3. Cerca Numeri Civici (Usa il fetch interno del client per gli indirizzi)
const onSearchNumber = async (event: any) => {
  if (!selected.value.street) return;
  loading.value.addresses = true;
  try {
    suggestions.value.addresses = await client._fetch<Address>('addresses', { 
      street_id: `eq.${selected.value.street.id}`, 
      full_number: `ilike.${event.query}*`,
      limit: 20, 
      order: 'number.asc' 
    });
  } finally {
    loading.value.addresses = false;
  }
};

// Logica: Reset a cascata
watch(() => selected.value.municipality, (newVal) => {
  if (!newVal || typeof newVal === 'string') {
    selected.value.street = null;
    selected.value.address = null;
  }
});

watch(() => selected.value.street, (newVal) => {
  if (!newVal || typeof newVal === 'string') {
    selected.value.address = null;
  }
});

// Sincronizzazione con v-model
watch(selected, (newVal) => {
  emit('update:modelValue', newVal);
  emit('change', newVal);
}, { deep: true });

// Helper per i colori dei civici (SNARE/ANNCSU standard)
const getCivicClass = (address: Address) => {
  if (!props.enableCivicColors || !address.specificity) return '';
  const s = address.specificity.trim().toUpperCase();
  if (s === 'R' || s.startsWith('ROSS')) return 'anncsui-civic-red';
  if (s === 'N' || s.startsWith('NER')) return 'anncsui-civic-black';
  return '';
};
</script>

<template>
  <div class="anncsui-container p-fluid grid formgrid">
    <!-- COMUNE -->
    <div class="field col-12 md:col-4">
      <label class="font-bold block mb-2">Comune</label>
      <AutoComplete 
        v-model="selected.municipality"
        :suggestions="suggestions.municipalities"
        @complete="onSearchMunicipality"
        :loading="loading.municipalities"
        optionLabel="name"
        :placeholder="placeholderMunicipality"
        dropdown
        emptyMessage="Nessun comune trovato"
      >
        <template #option="slotProps">
          <div class="flex flex-column">
            <span class="font-medium">{{ slotProps.option.name }}</span>
            <small class="text-color-secondary">{{ slotProps.option.province }} ({{ slotProps.option.region }})</small>
          </div>
        </template>
      </AutoComplete>
    </div>

    <!-- STRADA -->
    <div class="field col-12 md:col-6">
      <label class="font-bold block mb-2">Indirizzo</label>
      <AutoComplete 
        v-model="selected.street"
        :suggestions="suggestions.streets"
        @complete="onSearchStreet"
        :loading="loading.streets"
        :disabled="!selected.municipality"
        optionLabel="full_street_name"
        :placeholder="placeholderStreet"
        emptyMessage="Nessuna strada trovata in questo comune"
      >
        <template #option="slotProps">
          <div class="flex align-items-center">
            <i class="pi pi-map-marker mr-2 text-primary"></i>
            <div>
               <span>{{ slotProps.option.full_street_name }}</span>
               <small v-if="slotProps.option.locality" class="block text-xs italic">{{ slotProps.option.locality }}</small>
            </div>
          </div>
        </template>
      </AutoComplete>
    </div>

    <!-- CIVICO -->
    <div class="field col-12 md:col-2">
      <label class="font-bold block mb-2">Civico</label>
      <AutoComplete 
        v-model="selected.address"
        :suggestions="suggestions.addresses"
        @complete="onSearchNumber"
        :loading="loading.addresses"
        :disabled="!selected.street"
        optionLabel="full_number"
        :placeholder="placeholderNumber"
        emptyMessage="-"
      >
        <template #option="slotProps">
          <div class="flex align-items-center justify-content-between w-full">
            <span :class="getCivicClass(slotProps.option)">
              {{ slotProps.option.full_number }}
            </span>
            <small v-if="slotProps.option.specificity" class="text-xs opacity-60 ml-2">
              {{ slotProps.option.specificity }}
            </small>
          </div>
        </template>
      </AutoComplete>
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

.anncsui-civic-red {
  color: #ef4444;
  font-weight: 700;
  border-bottom: 2px solid #ef4444;
}

.anncsui-civic-black {
  color: #1f2937;
  font-weight: 700;
  border-bottom: 2px solid #1f2937;
}

:deep(.p-autocomplete-input) {
  border-radius: 8px;
}

label {
  color: var(--text-color, #444);
  font-size: 0.9rem;
}
</style>
