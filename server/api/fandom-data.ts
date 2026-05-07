// server/api/fandom-data.ts
import { getFandomData } from "../utils/fandomProcessor";

let cachedFandomData: any = null;
let cacheTime: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000;

export default defineEventHandler(async (event) => {
  if (cachedFandomData && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedFandomData;
  }

  const origin = getRequestURL(event).origin;
  const data = await getFandomData(origin);

  // We no longer build flagMap here! Just return the data.
  cachedFandomData = data;
  cacheTime = Date.now();

  return data;
});