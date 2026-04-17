// fandom-data.js
import { getFandomData } from '../../fandomProcessor.js';

let cachedFandomData = null;
let cacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function onRequest(context) {
  try {
    // Return cached data if fresh
    if (cachedFandomData && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
      return new Response(JSON.stringify(cachedFandomData), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Fetch fresh data
    const origin = new URL(context.request.url).origin;
    cachedFandomData = await getFandomData(origin);
    cacheTime = Date.now();

    return new Response(JSON.stringify(cachedFandomData), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error in fandom-data endpoint:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}