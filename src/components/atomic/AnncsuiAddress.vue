<script setup lang="ts">
import { ref, computed } from 'vue';
import AutoComplete from 'primevue/autocomplete';
import Dropdown from 'primevue/dropdown';
import type { Address } from '@pallari/italian-address-client';

const props = defineProps<{
  modelValue: Address | null;
  suggestions: Address[];
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  isSelect?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Address | null): void;
  (e: 'complete', query: string): void;
  (e: 'select', value: Address): void;
}>();

const onComplete = (event: { query: string }) => {
  emit('complete', event.query);
};

const onItemSelect = (event: { value: Address }) => {
  emit('select', event.value);
};

const onChange = (event: { value: Address }) => {
  emit('update:modelValue', event.value);
  emit('select', event.value);
};
</script>

<template>
  <div class="w-full">
    <template v-if="props.isSelect">
      <Dropdown
        :modelValue="props.modelValue"
        @change="onChange"
        :options="props.suggestions"
        :loading="props.loading"
        :disabled="props.disabled"
        optionLabel="full_number"
        :placeholder="props.placeholder || 'Seleziona...'"
        class="w-full"
      />
    </template>
    <template v-else>
      <AutoComplete
        :modelValue="props.modelValue"
        @update:modelValue="emit('update:modelValue', $event)"
        :suggestions="props.suggestions"
        @complete="onComplete"
        @item-select="onItemSelect"
        :loading="props.loading"
        :disabled="props.disabled"
        optionLabel="full_number"
        :placeholder="props.placeholder || 'N°'"
        class="w-full"
      />
    </template>
  </div>
</template>
