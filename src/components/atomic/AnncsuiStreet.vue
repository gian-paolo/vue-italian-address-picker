<script setup lang="ts">
import { ref } from 'vue';
import AutoComplete from 'primevue/autocomplete';
import type { Street } from '@pallari/italian-address-client';

const props = defineProps<{
  modelValue: Street | null;
  suggestions: Street[];
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Street | null): void;
  (e: 'complete', query: string): void;
  (e: 'select', value: Street): void;
}>();

const onComplete = (event: { query: string }) => {
  emit('complete', event.query);
};

const onItemSelect = (event: { value: Street }) => {
  emit('select', event.value);
};
</script>

<template>
  <AutoComplete
    :modelValue="props.modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    :suggestions="props.suggestions"
    @complete="onComplete"
    @item-select="onItemSelect"
    :loading="props.loading"
    :disabled="props.disabled"
    optionLabel="full_street_name"
    :placeholder="props.placeholder || 'Via, Piazza, Corso...'"
    class="w-full"
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
</template>
