// composables/useDynFlagger.ts

export interface FlagSpec {
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

export function useDynFlagger() {
  function addFlag(data: Partial<FlagSpec> = {}): FlagSpec {
    const newFlag: FlagSpec = {
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

  return { state, addFlag, removeFlag };
}
