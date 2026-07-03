// composables/FandomLists.ts
import { computed } from "vue";

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
  const { data: fandomData } = await useFetch("/api/fandom-data");

  // List 1: EVERYTHING (For "Countries That Can Form")
  const allCountriesList = computed(() => {
    if (!fandomData.value) return [];
    const nations = Object.entries(
      fandomData.value.Nationdata?.nationdata || {},
    )
      .filter(([, v]: any) => v.nation === true)
      .map(([k]) => k);
    const releasables = Object.entries(
      fandomData.value.Nationdata?.nationdata || {},
    )
      .filter(([, v]: any) => v.nation === false)
      .map(([k]) => k);
    const formables = Object.values(fandomData.value.Tagdata?.Tags || {})
      .filter((f: any) => f.FormableName && !f.Removed)
      .map((f: any) => f.FormableName);

    return [...new Set([...nations, ...releasables, ...formables])].sort();
  });

  // List 2: BASE NATIONS & RELEASABLES ONLY (For "Countries Required to Form")
  const baseCountriesList = computed(() => {
    if (!fandomData.value) return [];
    const nations = Object.entries(
      fandomData.value.Nationdata?.nationdata || {},
    )
      .filter(([, v]: any) => v.nation === true)
      .map(([k]) => k);
    const releasables = Object.entries(
      fandomData.value.Nationdata?.nationdata || {},
    )
      .filter(([, v]: any) => v.nation === false)
      .map(([k]) => k);

    return [...new Set([...nations, ...releasables])].sort();
  });

  // List 3: FORMABLES ONLY (For "Exclusive Formables")
  const formablesList = computed(() => {
    if (!fandomData.value) return [];
    const formables = Object.values(fandomData.value.Tagdata?.Tags || {})
      .filter((f: any) => f.FormableName && !f.Removed)
      .map((f: any) => f.FormableName);

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
  const allTilesList = computed(() => {
    if (!fandomData.value) return [];
    const tiles = new Set<string>();

    Object.values(fandomData.value.Nationdata?.nationdata || {}).forEach(
      (data: any) => {
        const tilesArray = getTilesArray(data.tiles);
        tilesArray.forEach((t: string) => tiles.add(t));
      },
    );

    return [...tiles].sort((a, b) => {
      const partsA = a.split(".");
      const partsB = b.split(".");

      const nameA = partsA[0] || "";
      const numA = parseInt(partsA[1]) || 0;

      const nameB = partsB[0] || "";
      const numB = parseInt(partsB[1]) || 0;

      if (numA !== numB) {
        return numA - numB;
      }
      return nameA.localeCompare(nameB);
    });
  });

  // Map: TILE ID -> NATION NAMES (For displaying flags on tiles)
  const tileOwnersMap = computed(() => {
    if (!fandomData.value) return {};
    const map: Record<string, string[]> = {};
    Object.entries(fandomData.value.Nationdata?.nationdata || {}).forEach(
      ([nation, data]: [string, any]) => {
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
      .map((m: any) => {
        const normalizedEffects: Record<string, any> = {};
        if (m.Effects) {
          for (const [k, v] of Object.entries(m.Effects)) {
            if (
              typeof v === "object" &&
              v !== null &&
              !Array.isArray(v) &&
              "1" in v
            ) {
              normalizedEffects[k] = [v["1"], v["2"]];
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
  const startingCountriesList = computed(() => {
    if (!fandomData.value) return [];
    const nations = Object.entries(
      fandomData.value.Nationdata?.nationdata || {},
    )
      .filter(([, v]: any) => v.nation === true)
      .map(([k]) => k);

    return [...new Set([...nations])].sort();
  });

  // List 6: ALL LEADERS
  const leadersList = computed(() => {
    if (!fandomData.value) return [];
    return Object.values(fandomData.value.Leaderdata?.leaderdata || {})
      .map((l: any) => l.Title || "Unknown")
      .sort();
  });

  // List 7: ALL POLITICAL LAWS
  const politicalLawsList = computed(() => {
    if (!fandomData.value) return [];
    return Object.values(
      fandomData.value.PoliticalLawdata?.politicallawdata || {},
    )
      .map((l: any) => l.Title || "Unknown")
      .sort();
  });

  // List 8: ALL POLICIES
  const policiesList = computed(() => {
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
    formablesList,
    allTilesList,
    tileOwnersMap,
    modifiersList,
    modifierEffectsData,
    allResourcesList,
    leadersList,
    politicalLawsList,
    policiesList,
    ideologiesList,
  };
}
