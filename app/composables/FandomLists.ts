// composables/FandomLists.ts
import { computed } from "vue";

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

    // Custom Sort: Number first, then Country Letters
    // This prevents a single country from flooding the 50-item limit in the dropdown.
    return [...tiles].sort((a, b) => {
      const partsA = a.split(".");
      const partsB = b.split(".");

      const nameA = partsA[0] || "";
      const numA = parseInt(partsA[1]) || 0;

      const nameB = partsB[0] || "";
      const numB = parseInt(partsB[1]) || 0;

      // If the numbers are different, sort by number (e.g. .001 comes before .002)
      if (numA !== numB) {
        return numA - numB;
      }

      // If the numbers are the same, sort alphabetically by country name
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

  return {
    allCountriesList,
    baseCountriesList,
    formablesList,
    allTilesList,
    tileOwnersMap,
  };
}
