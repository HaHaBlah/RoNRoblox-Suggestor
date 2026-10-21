// server/api/fandom-data.ts
import fallbackData from "../data/fandom-data.json";
import { getFandomData } from "../utils/fandomProcessor";

let cachedFandomData: any = fallbackData;
let cacheTime: number = Date.now();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export default defineEventHandler(async (event) => {
  // Instruct Cloudflare Edge CDN and browser to cache response aggressively
  setResponseHeader(
    event,
    "Cache-Control",
    "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
  );

  // If we already have cached data in memory, return immediately (0 ms CPU time)
  if (cachedFandomData) {
    return cachedFandomData;
  }

  // Fallback to runtime extraction only if static data was missing
  try {
    const origin = getRequestURL(event).origin;
    const data = await getFandomData(origin);
    cachedFandomData = data;
    cacheTime = Date.now();
    return data;
  } catch (err) {
    console.error("Error in getFandomData fallback:", err);
    return fallbackData;
  }
});