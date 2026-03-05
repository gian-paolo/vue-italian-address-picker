import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueItalianAddressPicker',
      fileName: 'vue-italian-address-picker',
    },
    rollupOptions: {
      external: ['vue', 'primevue', '@pallari/italian-address-client', 'primevue/autocomplete'],
      output: {
        globals: {
          vue: 'Vue',
          primevue: 'PrimeVue',
          '@pallari/italian-address-client': 'ItalianAddressClient',
          'primevue/autocomplete': 'AutoComplete',
        },
      },
    },
  },
});
