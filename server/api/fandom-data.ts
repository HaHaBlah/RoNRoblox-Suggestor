// server/api/fandom-data.ts
import { getFandomData } from "../utils/fandomProcessor";

let cachedFandomData: Awaited<ReturnType<typeof getFandomData>> | null = null;
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
  cachedFandomData = await getFandomData(origin);
  cacheTime = Date.now();

  return cachedFandomData;
});
