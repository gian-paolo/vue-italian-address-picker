<script setup lang="ts">
import Dropdown from 'primevue/dropdown';
import type { AccessPoint } from '@pallari/italian-address-client';

const props = defineProps<{
  modelValue: AccessPoint | null;
  suggestions: AccessPoint[];
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: AccessPoint | null): void;
  (e: 'select', value: AccessPoint): void;
}>();

const onChange = (event: { value: AccessPoint }) => {
  emit('update:modelValue', event.value);
  emit('select', event.value);
};
</script>

<template>
  <Dropdown
    :modelValue="props.modelValue"
    @change="onChange"
    :options="props.suggestions"
    :loading="props.loading"
    :disabled="props.disabled"
    optionLabel="label"
    :placeholder="props.placeholder || 'Variante...'"
    class="w-full"
  />
</template>
