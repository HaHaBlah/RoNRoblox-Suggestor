// composables/useDynFlagger.ts
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

// Module-level singleton — one reactive object shared across all components
const state = reactive<FlaggerState>({
  NationName: "",
  Flags: [],
});

const { reset: resetFlagger } = usePersistentReactive("ron_dynflagger_state", state);

export function useDynFlagger() {
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
    resetFlagger();
    if (state.Flags.length === 0) {
      addFlag();
    }
  }

  return { state, addFlag, removeFlag, resetState };
}
