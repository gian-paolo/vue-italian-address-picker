# Vue Italian Address Picker (PrimeVue)

[![Latest Version on NPM](https://img.shields.io/npm/v/@pallari/vue-italian-address-picker.svg?style=flat-square)](https://www.npmjs.com/package/@pallari/vue-italian-address-picker)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)

A ready-to-use Vue 3 component for professional Italian address lookup and normalization. Built on top of **PrimeVue** and powered by the [ANNCSU API](https://anncsu.dataws.it).

## Features

- **Cascading Search**: Municipality → Street → Civic number.
- **Certified Data**: Uses official ANNCSU/ISTAT data.
- **PrimeVue Integrated**: Works seamlessly with PrimeVue themes and styling.
- **TypeScript Support**: Full type safety for address entities.
- **Smart Colors**: Visual feedback for "Red" (commercial) and "Black" (residential) civic numbers (specific to cities like Florence or Genoa).

## Prerequisites

- Vue 3
- PrimeVue 3.x or 4.x
- A PrimeVue theme (e.g., Aura, Lara, Wind)

## Installation

```bash
npm install @pallari/vue-italian-address-picker @pallari/italian-address-client
```

## Usage

### 1. Register the component

```vue
<script setup>
import { ref } from 'vue';
import { AnncsuiFullAddressPicker } from '@pallari/vue-italian-address-picker';
import '@pallari/vue-italian-address-picker/dist/style.css';

const addressData = ref({
  municipality: null,
  street: null,
  address: null
});

const handleChange = (val) => {
  console.log('Selected address:', val);
};
</script>

<template>
  <div class="card">
    <h3>Indirizzo di Spedizione</h3>
    <AnncsuiFullAddressPicker 
      v-model="addressData"
      @change="handleChange"
    />
  </div>
</template>
```

### 2. Properties

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `baseUrl` | `string` | `https://anncsu-api.dataws.it/v1` | Custom API endpoint. |
| `placeholderMunicipality` | `string` | `Cerca Comune...` | Placeholder for municipality field. |
| `enableCivicColors` | `boolean` | `true` | Enable red/black color coding for civics. |

## Development

To build the package:
```bash
npm install
npm run build
```

## License

MIT
