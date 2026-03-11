import { ref, watch } from 'vue';
import { ItalianAddressClient } from '@pallari/italian-address-client';
import type { Municipality, Street, Address, AccessPoint } from '@pallari/italian-address-client';

export interface UseItalianAddressOptions {
  baseUrl?: string;
  onStateChange?: (state: any) => void;
  onStreetChange?: (street: Street | null) => void;
  onMunicipalityChange?: (municipality: Municipality | null) => void;
  onAddressChange?: (address: Address | null) => void;
  onVariantChange?: (variant: AccessPoint | null) => void;
  initialState?: {
    municipality?: Municipality | null;
    street?: Street | null;
    address?: Address | null;
    variant?: AccessPoint | null;
  };
}

export function useItalianAddress(options: UseItalianAddressOptions = {}) {
  const client = new ItalianAddressClient({ baseUrl: options.baseUrl });

  const state = ref({
    municipality: options.initialState?.municipality || null as Municipality | null,
    street: options.initialState?.street || null as Street | null,
    address: options.initialState?.address || null as Address | null,
    variant: options.initialState?.variant || null as AccessPoint | null,
    dug_id: null as number | null,
  });

  const loading = ref({
    municipalities: false,
    streets: false,
    addresses: false,
    variants: false,
  });

  const suggestions = ref({
    municipalities: [] as Municipality[],
    streets: [] as Street[],
    addresses: [] as Address[],
    variants: [] as AccessPoint[],
  });

  // Trackers for race conditions
  const requests = { municipalities: 0, streets: 0, addresses: 0, variants: 0 };
  const displayed = { municipalities: 0, streets: 0, addresses: 0, variants: 0 };

  // Search logic
  const searchMunicipalities = async (query: string) => {
    if (query.trim().length < 2) return;
    const requestId = ++requests.municipalities;
    loading.value.municipalities = true;
    try {
      const data = await client.searchMunicipalities(query, { limit: 10 });
      if (requestId > displayed.municipalities) {
        displayed.municipalities = requestId;
        suggestions.value.municipalities = data;
      }
    } finally {
      if (requestId === requests.municipalities) {
        loading.value.municipalities = false;
      }
    }
  };

  const searchStreets = async (query: string, dug_id?: number) => {
    if (!state.value.municipality || query.trim().length < 3) return;
    const requestId = ++requests.streets;
    loading.value.streets = true;
    try {
      const data = await client.searchStreets(query, {
        istat_code: state.value.municipality.istat_code,
        dug_id: dug_id || state.value.dug_id || undefined,
        limit: 15,
      });
      if (requestId > displayed.streets) {
        displayed.streets = requestId;
        suggestions.value.streets = data;
      }
    } finally {
      if (requestId === requests.streets) {
        loading.value.streets = false;
      }
    }
  };

  const searchAddresses = async (query: string, unified = false) => {
    if (!state.value.street) return;
    const requestId = ++requests.addresses;
    loading.value.addresses = true;
    try {
      const endpoint = unified ? 'access_points' : 'addresses';
      const params: any = {
        street_id: `eq.${state.value.street.id}`,
        limit: unified ? 1000 : 20,
        order: 'number.asc',
      };
      if (query) {
        params[unified ? 'label' : 'full_number'] = `ilike.*${query}*`;
      }
      const data = await client._fetch(endpoint, params);
      if (requestId > displayed.addresses) {
        displayed.addresses = requestId;
        if (unified) {
          suggestions.value.variants = data;
        } else {
          suggestions.value.addresses = data;
        }
      }
    } finally {
      if (requestId === requests.addresses) {
        loading.value.addresses = false;
      }
    }
  };

  const fetchVariants = async (address: Address) => {
    if (!address) return;
    const requestId = ++requests.variants;
    loading.value.variants = true;
    try {
      const data = await client.getAccessPoints(address.street_id, address.number || 0, address.extension);
      if (requestId > displayed.variants) {
        displayed.variants = requestId;
        suggestions.value.variants = data;
      }
    } finally {
      if (requestId === requests.variants) {
        loading.value.variants = false;
      }
    }
  };

  // Watchers for cascading
  watch(() => state.value.municipality, (newVal) => {
    if (!newVal || typeof newVal === 'string') {
      state.value.street = null;
      state.value.address = null;
      state.value.variant = null;
      if (options.onMunicipalityChange) options.onMunicipalityChange(null);
    } else {
      if (options.onMunicipalityChange) options.onMunicipalityChange(newVal);
    }
  });

  watch(() => state.value.street, (newVal) => {
    if (!newVal || typeof newVal === 'string') {
      state.value.address = null;
      state.value.variant = null;
      if (options.onStreetChange) options.onStreetChange(null);
    } else {
      // Sync municipality if not present
      if (!state.value.municipality && newVal.istat_code) {
        state.value.municipality = { 
          istat_code: newVal.istat_code, 
          name: newVal.display_municipality || '',
        } as any;
      }
      if (options.onStreetChange) options.onStreetChange(newVal);
    }
  });

  watch(() => state.value.address, async (newVal) => {
    if (!newVal || typeof newVal === 'string') {
      state.value.variant = null;
      if (options.onAddressChange) options.onAddressChange(null);
    } else {
      if (options.onAddressChange) options.onAddressChange(newVal);
      if (newVal.other_entries_count > 0) {
        await fetchVariants(newVal);
      } else {
        suggestions.value.variants = [];
      }
    }
  });

  watch(() => state.value.variant, (newVal) => {
    if (options.onVariantChange) options.onVariantChange(newVal);
  });

  watch(state, (newVal) => {
    if (options.onStateChange) options.onStateChange(newVal);
  }, { deep: true });

  return {
    client,
    state,
    loading,
    suggestions,
    searchMunicipalities,
    searchStreets,
    searchAddresses,
    fetchVariants,
  };
}
