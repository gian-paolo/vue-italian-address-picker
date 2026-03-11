<script setup lang="ts">
import { ref } from 'vue';
import AutoComplete from 'primevue/autocomplete';
import type { Municipality } from '@pallari/italian-address-client';

const props = defineProps<{
  modelValue: Municipality | null;
  suggestions: Municipality[];
  loading?: boolean;
  placeholder?: string;
  dropdown?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Municipality | null): void;
  (e: 'complete', query: string): void;
  (e: 'select', value: Municipality): void;
}>();

const onComplete = (event: { query: string }) => {
  emit('complete', event.query);
};

const onItemSelect = (event: { value: Municipality }) => {
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
    optionLabel="name"
    :placeholder="props.placeholder || 'Cerca Comune...'"
    :dropdown="props.dropdown"
    class="w-full"
  >
    <template #option="slotProps">
      <div class="flex flex-column">
        <span class="font-medium">{{ slotProps.option.name }}</span>
        <small class="text-color-secondary">{{ slotProps.option.province }} ({{ slotProps.option.region }})</small>
      </div>
    </template>
  </AutoComplete>
</template>
