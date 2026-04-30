// server/api/fandom-data.ts
import { getFandomData } from "../utils/fandomProcessor";

let cachedFandomData: any = null;
let cacheTime: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000;

export default defineEventHandler(async (event) => {
  if (
    cachedFandomData &&
    cacheTime &&
    Date.now() - cacheTime < CACHE_DURATION
  ) {
    return cachedFandomData;
  }

  const origin = getRequestURL(event).origin;
  const data = await getFandomData(origin);

  // 1. Safe access to Nationdata
  // Use optional chaining and nullish coalescing to avoid 'undefined' errors
  const nationKeys = data?.Nationdata?.nationdata
    ? Object.keys(data.Nationdata.nationdata)
    : [];

  // 2. Safe access to Tagdata/Tags
  // We cast the values to 'any' temporarily or a specific interface
  // to access 'FormableName' without the LuaTable union error
  const tagEntries = data?.Tagdata?.Tags
    ? Object.values(data.Tagdata.Tags)
    : [];

  const formables = tagEntries
    .map((f: any) => {
      // Check if f is an object and has the property we need
      if (f && typeof f === "object" && "FormableName" in f) {
        return f.FormableName;
      }
      return null;
    })
    .filter((name): name is string => Boolean(name));

  // 3. Merge and deduplicate
  const allNames = Array.from(new Set([...nationKeys, ...formables]));
  const flagMap: Record<string, string> = {};

  // 4. Batch fetch URLs
  await Promise.all(
    allNames.map(async (name) => {
      try {
        const filename = `${name}_Flag.png`;
        const fandomRes = await $fetch<any>(
          `https://ronroblox.fandom.com/rest.php/v1/file/File:${encodeURIComponent(filename)}`,
        );

        if (fandomRes?.preferred?.url) {
          flagMap[name] =
            `/api/fandom-image?proxy=true&url=${encodeURIComponent(fandomRes.preferred.url)}`;
        }
      } catch (e) {
        flagMap[name] = "";
      }
    }),
  );

  const response = { ...data, flagMap };

  cachedFandomData = response;
  cacheTime = Date.now();

  return response;
});
