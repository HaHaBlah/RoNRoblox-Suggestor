// composables/useDynFlagger.ts
import { useState } from "#app";
import { usePersistentReactive } from "~/composables/useFormStorage";

export interface FlagSpec {
  _id: string;
  FlagName: string;
  FlagID: string;
  Description: string;
  Ideologies: string[];
  Laws: Record<string, string[]>;
  NOTLaws: Record<string, string[]>;
}

export interface FlaggerState {
  NationName: string;
  Flags: FlagSpec[];
}

let isStorageInitialized = false;

export function useDynFlagger() {
  const flaggerRef = useState<FlaggerState>("ron_dynflagger_state", () => ({
    NationName: "",
    Flags: [],
  }));

  const state = flaggerRef.value;

  if (import.meta.client && !isStorageInitialized) {
    isStorageInitialized = true;
    usePersistentReactive("ron_dynflagger_state", state);
  }

  function addFlag(data: Partial<FlagSpec> = {}): FlagSpec {
    const newFlag: FlagSpec = {
      _id: crypto.randomUUID(),
      FlagName: data.FlagName ?? "",
      FlagID: data.FlagID ?? "",
      Description: data.Description ?? "",
      Ideologies: data.Ideologies ?? [],
      Laws: data.Laws ?? {},
      NOTLaws: data.NOTLaws ?? {},
    };
    state.Flags.push(newFlag);
    return newFlag;
  }

  function removeFlag(index: number) {
    state.Flags.splice(index, 1);
  }

  function resetState() {
    if (import.meta.client) {
      try {
        localStorage.removeItem("ron_dynflagger_state");
      } catch {}
    }
    state.NationName = "";
    state.Flags = [];
    addFlag();
  }

  return { state, addFlag, removeFlag, resetState };
}
