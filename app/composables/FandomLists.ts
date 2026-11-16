// composables/FandomLists.ts
import { computed } from "vue";

export interface NationDataEntry {
  nation?: boolean;
  tiles?: string[] | Record<string, string> | string;
  [key: string]: any;
}

export interface TagDataEntry {
  FormableName?: string;
  Removed?: boolean;
  [key: string]: any;
}

export interface ModifierDataEntry {
  Title?: string;
  Description?: string;
  Icon?: { ID?: string | number };
  Effects?: Record<string, any>;
  [key: string]: any;
}

export interface LawNamesEntry {
  Name: string;
  Types: Record<string, string>;
}

export interface FandomData {
  Nationdata?: {
    nationdata?: Record<string, NationDataEntry>;
  };
  Tagdata?: {
    Tags?: Record<string, TagDataEntry>;
  };
  Modifierdata?: {
    modifierdata?: Record<string, ModifierDataEntry>;
  };
  ModifierEffectsdata?: Record<string, any>;
  Lawnames?: {
    lawNames?: Record<string, LawNamesEntry>;
  };
  Flagdata?: {
    Flags?: Record<string, any>;
  };
  Leaderdata?: {
    leaderdata?: Record<string, any>;
  };
  PoliticalLawdata?: {
    politicallawdata?: Record<string, any>;
  };
  Policydata?: {
    policydata?: Record<string, any>;
  };
  [key: string]: any;
}

const allResourcesList = [
  "Aluminum",
  "Chromium",
  "Copper",
  "Diamond",
  "Gold",
  "Iron",
  "Oil",
  "Phosphate",
  "Titanium",
  "Tungsten",
  "Uranium",
];

const ideologiesList = [
  "Democracy",
  "Liberalism",
  "Fascism",
  "Nationalism",
  "Communism",
  "Socialism",
  "Non-Aligned",
];

export async function FandomLists() {
  const { fandomData, isLoading, error, fetchData } = useFandomData();

  if (import.meta.client && !fandomData.value) {
    await fetchData();
  }

  // List 1: EVERYTHING (For "Countries That Can Form")
  const allCountriesList = computed<string[]>(() => {
    if (!fandomData.value) return [];
    const nations = Object.entries(
      fandomData.value.Nationdata?.nationdata || {},
    )
      .filter(([, v]) => v.nation === true)
      .map(([k]) => k);
    const releasables = Object.entries(
      fandomData.value.Nationdata?.nationdata || {},
    )
      .filter(([, v]) => v.nation === false)
      .map(([k]) => k);
    const formables = Object.values(fandomData.value.Tagdata?.Tags || {})
      .filter((f) => f.FormableName && !f.Removed)
      .map((f) => f.FormableName as string);

    return [...new Set([...nations, ...releasables, ...formables])].sort();
  });

  // List 2: BASE NATIONS & RELEASABLES ONLY (For "Countries Required to Form")
  const baseCountriesList = computed<string[]>(() => {
    if (!fandomData.value) return [];
    const nations = Object.entries(
      fandomData.value.Nationdata?.nationdata || {},
    )
      .filter(([, v]) => v.nation === true)
      .map(([k]) => k);
    const releasables = Object.entries(
      fandomData.value.Nationdata?.nationdata || {},
    )
      .filter(([, v]) => v.nation === false)
      .map(([k]) => k);

    return [...new Set([...nations, ...releasables])].sort();
  });

  // List 3: FORMABLES ONLY (For "Exclusive Formables")
  const formablesList = computed<string[]>(() => {
    if (!fandomData.value) return [];
    const formables = Object.values(fandomData.value.Tagdata?.Tags || {})
      .filter((f) => f.FormableName && !f.Removed)
      .map((f) => f.FormableName as string);

    return [...new Set([...formables])].sort();
  });

  // --- HELPER FUNCTION ---
  const getTilesArray = (tilesData: any): string[] => {
    if (!tilesData) return [];
    if (Array.isArray(tilesData)) return tilesData;
    if (typeof tilesData === "object") return Object.values(tilesData);
    if (typeof tilesData === "string") return [tilesData];
    return [];
  };

  // List 4: ALL UNIQUE TILES (For "Tiles Required to Form")
  const allTilesList = computed<string[]>(() => {
    if (!fandomData.value) return [];
    const tiles = new Set<string>();

    Object.values(fandomData.value.Nationdata?.nationdata || {}).forEach(
      (data) => {
        const tilesArray = getTilesArray(data.tiles);
        tilesArray.forEach((t: string) => tiles.add(t));
      },
    );

    return [...tiles].sort((a, b) => {
      const partsA = a.split(".");
      const partsB = b.split(".");

      const nameA = partsA[0] || "";
      const numA = parseInt(partsA[1] || "0") || 0;

      const nameB = partsB[0] || "";
      const numB = parseInt(partsB[1] || "0") || 0;

      if (numA !== numB) {
        return numA - numB;
      }
      return nameA.localeCompare(nameB);
    });
  });

  // Map: TILE ID -> NATION NAMES (For displaying flags on tiles)
  const tileOwnersMap = computed<Record<string, string[]>>(() => {
    if (!fandomData.value) return {};
    const map: Record<string, string[]> = {};
    Object.entries(fandomData.value.Nationdata?.nationdata || {}).forEach(
      ([nation, data]) => {
        const tilesArray = getTilesArray(data.tiles);
        tilesArray.forEach((t: string) => {
          if (!map[t]) map[t] = [];
          map[t].push(nation);
        });
      },
    );
    return map;
  });

  // --- MODIFIERS HELPER ---
  const extractRobloxId = (url: string | any) => {
    if (!url) return null;
    const match = String(url).match(/\d+/);
    return match ? match[0] : null;
  };

  // List 5: ALL MODIFIERS
  const modifiersList = computed(() => {
    if (!fandomData.value || !fandomData.value.Modifierdata?.modifierdata)
      return [];

    const mods = Object.values(fandomData.value.Modifierdata.modifierdata);

    return mods
      .map((m) => {
        const normalizedEffects: Record<string, any> = {};
        if (m.Effects) {
          for (const [k, v] of Object.entries(m.Effects)) {
            if (
              typeof v === "object" &&
              v !== null &&
              !Array.isArray(v) &&
              "1" in (v as Record<string, any>)
            ) {
              const vObj = v as Record<string, any>;
              normalizedEffects[k] = [vObj["1"], vObj["2"]];
            } else {
              normalizedEffects[k] = v;
            }
          }
        }

        return {
          Title: m.Title || "Unknown",
          Description: m.Description || "",
          IconID: extractRobloxId(m.Icon?.ID),
          Effects: normalizedEffects,
        };
      })
      .sort((a, b) => a.Title.localeCompare(b.Title));
  });

  // Expose ModifierEffectsAlignment
  const modifierEffectsData = computed(() => {
    if (!fandomData.value) return {};
    return fandomData.value.ModifierEffectsdata || {};
  });

  // List 3: STARTING COUNTRIES (For "Starting Countries")
  const startingCountriesList = computed<string[]>(() => {
    if (!fandomData.value) return [];
    const nations = Object.entries(
      fandomData.value.Nationdata?.nationdata || {},
    )
      .filter(([, v]) => v.nation === true)
      .map(([k]) => k);

    return [...new Set([...nations])].sort();
  });

  // List 7: RELEASABLES ONLY
  const releasablesList = computed<string[]>(() => {
    if (!fandomData.value) return [];
    const releasables = Object.entries(
      fandomData.value.Nationdata?.nationdata || {},
    )
      .filter(([, v]) => v.nation === false)
      .map(([k]) => k);

    return [...new Set([...releasables])].sort();
  });

  // List 8: ALL LEADERS
  const leadersList = computed<string[]>(() => {
    if (!fandomData.value) return [];
    return Object.values(fandomData.value.Leaderdata?.leaderdata || {})
      .map((l: any) => l.Title || "Unknown")
      .sort();
  });

  // List 9: ALL POLITICAL LAWS
  const politicalLawsList = computed<string[]>(() => {
    if (!fandomData.value) return [];
    return Object.values(
      fandomData.value.PoliticalLawdata?.politicallawdata || {},
    )
      .map((l: any) => l.Title || "Unknown")
      .sort();
  });

  // Map: LAW CODE -> { Name, Types } (For "Political Laws" requirement pickers)
  const lawnamesMap = computed<Record<string, LawNamesEntry>>(() => {
    if (!fandomData.value) return {};
    return fandomData.value.Lawnames?.lawNames || {};
  });

  // List 10: ALL POLICIES
  const policiesList = computed<string[]>(() => {
    if (!fandomData.value) return [];
    return Object.values(
      fandomData.value.Policydata?.policydata || {},
    )
      .map((l: any) => l.Title || "Unknown")
      .sort();
  });

  return {
    allCountriesList,
    baseCountriesList,
    startingCountriesList,
    releasablesList,
    formablesList,
    allTilesList,
    tileOwnersMap,
    modifiersList,
    modifierEffectsData,
    allResourcesList,
    leadersList,
    politicalLawsList,
    lawnamesMap,
    policiesList,
    ideologiesList,
    isLoading,
    error,
    fandomData,
  };
}
