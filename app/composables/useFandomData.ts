// app/composables/useFandomData.ts
import { useState } from '#app';
import type { FandomData } from '~/composables/FandomLists';

let pendingFetch: Promise<FandomData | null> | null = null;

export function useFandomData() {
  const fandomData = useState<FandomData | null>('ron_shared_fandom_data', () => null);
  const isLoading = useState<boolean>('ron_shared_fandom_data_loading', () => false);
  const error = useState<string | null>('ron_shared_fandom_data_error', () => null);

  const fetchData = async (): Promise<FandomData | null> => {
    // If already populated in Nuxt state, return immediately
    if (fandomData.value) {
      return fandomData.value;
    }

    // If fetch is already in flight, await the existing promise
    if (pendingFetch) {
      return await pendingFetch;
    }

    // Do not attempt to fetch static public asset on SSR server
    if (!import.meta.client) {
      return null;
    }

    isLoading.value = true;
    error.value = null;

    pendingFetch = (async () => {
      try {
        const data = await $fetch<FandomData>('/data/fandom-data.json');
        fandomData.value = data;
        return data;
      } catch (err: any) {
        console.warn('[useFandomData] Initial fetch failed, retrying once...', err?.message);
        try {
          await new Promise((r) => setTimeout(r, 200));
          const data = await $fetch<FandomData>('/data/fandom-data.json');
          fandomData.value = data;
          return data;
        } catch (retryErr: any) {
          console.error('[useFandomData] Failed to load /data/fandom-data.json:', retryErr?.message);
          error.value = retryErr?.message || 'Failed to load fandom data';
          return null;
        }
      } finally {
        isLoading.value = false;
        pendingFetch = null;
      }
    })();

    return await pendingFetch;
  };

  // If on client and not yet loaded or fetching, trigger fetch automatically
  if (import.meta.client && !fandomData.value && !pendingFetch) {
    fetchData();
  }

  return {
    fandomData,
    isLoading,
    error,
    fetchData,
  };
}
