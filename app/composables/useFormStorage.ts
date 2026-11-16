// composables/useFormStorage.ts
import { watch, toRaw, onMounted, onUnmounted, getCurrentInstance, type Ref } from 'vue';

/**
 * Recursively converts a reactive object / proxy to raw JS data.
 */
function toRawDeep<T>(val: T): T {
  const raw = toRaw(val);
  if (raw === null || typeof raw !== 'object') {
    return raw;
  }
  if (Array.isArray(raw)) {
    return raw.map(toRawDeep) as unknown as T;
  }
  const result: Record<string, any> = {};
  for (const key of Object.keys(raw)) {
    result[key] = toRawDeep((raw as any)[key]);
  }
  return result as T;
}

/**
 * Synchronizes a reactive object with localStorage.
 * Restores state on client mount and debounces writes on change.
 */
export function usePersistentReactive<T extends Record<string, any>>(
  storageKey: string,
  state: T
) {
  if (!import.meta.client) {
    return {
      reset: () => {},
      saveImmediate: () => {},
    };
  }

  // Clone initial defaults for reset capability
  const initialDefaults = toRawDeep(state);

  let isRestoring = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const saveImmediate = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    if (isRestoring) return;
    try {
      const serialized = JSON.stringify(toRawDeep(state));
      localStorage.setItem(storageKey, serialized);
    } catch (err) {
      console.warn(`[useFormStorage] Failed to save "${storageKey}":`, err);
    }
  };

  const saveDebounced = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(saveImmediate, 250);
  };

  const load = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        isRestoring = true;
        for (const key of Object.keys(parsed)) {
          if (key in state) {
            (state as Record<string, any>)[key] = parsed[key];
          }
        }
      }
    } catch (err) {
      console.warn(`[useFormStorage] Failed to load "${storageKey}":`, err);
    } finally {
      setTimeout(() => {
        isRestoring = false;
      }, 50);
    }
  };

  const reset = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    for (const key of Object.keys(initialDefaults)) {
      (state as Record<string, any>)[key] = structuredClone(initialDefaults[key]);
    }
  };

  // Restore state immediately
  load();

  // Watch for state changes and debounce write to localStorage
  watch(
    state,
    () => {
      saveDebounced();
    },
    { deep: true }
  );

  const handleBeforeUnload = () => {
    saveImmediate();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', handleBeforeUnload);
  }

  if (getCurrentInstance()) {
    onUnmounted(() => {
      saveImmediate();
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
    });
  }

  return {
    reset,
    saveImmediate,
  };
}

/**
 * Synchronizes a Ref (such as array or object) with localStorage.
 */
export function usePersistentRef<T>(
  storageKey: string,
  targetRef: Ref<T>,
  defaultValue?: T
) {
  if (!import.meta.client) {
    return {
      reset: () => {},
      saveImmediate: () => {},
    };
  }

  const initialDefault =
    defaultValue !== undefined
      ? structuredClone(defaultValue)
      : toRawDeep(targetRef.value);

  let isRestoring = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const saveImmediate = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    if (isRestoring) return;
    try {
      const serialized = JSON.stringify(toRawDeep(targetRef.value));
      localStorage.setItem(storageKey, serialized);
    } catch (err) {
      console.warn(`[useFormStorage] Failed to save "${storageKey}":`, err);
    }
  };

  const saveDebounced = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(saveImmediate, 250);
  };

  const load = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (parsed !== undefined && parsed !== null) {
        isRestoring = true;
        targetRef.value = parsed;
      }
    } catch (err) {
      console.warn(`[useFormStorage] Failed to load "${storageKey}":`, err);
    } finally {
      setTimeout(() => {
        isRestoring = false;
      }, 50);
    }
  };

  const reset = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    targetRef.value = structuredClone(initialDefault);
  };

  // Restore state immediately
  load();

  // Watch for state changes
  watch(
    targetRef,
    () => {
      saveDebounced();
    },
    { deep: true }
  );

  const handleBeforeUnload = () => {
    saveImmediate();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', handleBeforeUnload);
  }

  if (getCurrentInstance()) {
    onUnmounted(() => {
      saveImmediate();
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
    });
  }

  return {
    reset,
    saveImmediate,
  };
}
