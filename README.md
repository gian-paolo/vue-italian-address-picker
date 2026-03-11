# Vue Italian Address Picker (PrimeVue)

[![Latest Version on NPM](https://img.shields.io/npm/v/@pallari/vue-italian-address-picker.svg?style=flat-square)](https://www.npmjs.com/package/@pallari/vue-italian-address-picker)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)

A ready-to-use Vue 3 component for professional Italian address lookup and normalization. Built on top of **PrimeVue** and powered by the [ANNCSU API](https://anncsu.dataws.it).

## Features

- **Flexible Architecture**: Use the all-in-one `AnncsuiFullAddressPicker` or compose your own form with **Atomic Components**.
- **Unified & Cascaded Modes**: Support for standard civic selection or detailed variant selection (internals, scales).
- **Headless Logic**: Use the `useItalianAddress` composable for custom UIs without PrimeVue.
- **Cascading Search**: Municipality → Street → Civic number → Variant.
- **Certified Data**: Uses official ANNCSU/ISTAT data.
- **TypeScript Support**: Full type safety for address entities.

## Installation

```bash
npm install @pallari/vue-italian-address-picker @pallari/italian-address-client
```

## Usage

### 1. Ready-to-use Component (All-in-one)

```vue
<script setup>
import { ref } from 'vue';
import { AnncsuiFullAddressPicker } from '@pallari/vue-italian-address-picker';
import '@pallari/vue-italian-address-picker/dist/style.css';

const addressData = ref({
  municipality: null,
  street: null,
  address: null,
  variant: null
});
</script>

<template>
  <AnncsuiFullAddressPicker 
    v-model="addressData"
    mode="cascaded" 
    layout="grid"
  />
</template>
```

### 2. Atomic Components (Manual Composition)

For maximum flexibility, you can use the single components:

```vue
<script setup>
import { 
  AnncsuiMunicipality, 
  AnncsuiStreet, 
  useItalianAddress 
} from '@pallari/vue-italian-address-picker';

const { state, suggestions, loading, searchMunicipalities, searchStreets } = useItalianAddress();
</script>

<template>
  <AnncsuiMunicipality 
    v-model="state.municipality" 
    :suggestions="suggestions.municipalities"
    :loading="loading.municipalities"
    @complete="searchMunicipalities"
  />

  <AnncsuiStreet 
    v-model="state.street" 
    :suggestions="suggestions.streets"
    :loading="loading.streets"
    :disabled="!state.municipality"
    @complete="searchStreets"
  />
</template>
```

## Properties (`AnncsuiFullAddressPicker`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `baseUrl` | `string` | `https://anncsu-api.dataws.it/v1` | Custom API endpoint. |
| `mode` | `string` | `cascaded` | `cascaded` (Select N° -> Select Variant) or `unified` (Select everything in one list). |
| `layout` | `string` | `grid` | `grid` (Responsive grid) or `vertical` (Column). |
| `placeholderMunicipality` | `string` | `Cerca Comune...` | Placeholder for municipality field. |

## Composables (`useItalianAddress`)

The logic is exported as a Vue composable for headless use or custom UI integration. It manages state, cascading resets, and API calls.


## Development

To build the package:
```bash
npm install
npm run build
```

## License

MIT
