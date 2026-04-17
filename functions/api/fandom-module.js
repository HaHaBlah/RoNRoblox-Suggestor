// fandom-module.js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const moduleName = url.searchParams.get('module');
  
  if (!moduleName) {
    return new Response(JSON.stringify({ error: 'Module name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const result = await fetchWithFallback(moduleName);
    
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'X-Cache': 'MISS'
      }
    });
    
  } catch (error) {
    console.error('Error fetching Fandom module:', error);
    return new Response(JSON.stringify({
      error: error.message,
      module: moduleName
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function fetchWithFallback(moduleName) {
  // Primary API. Rest
  try {
    const primaryUrl = `https://ronroblox.fandom.com/rest.php/v1/page/Module%3A${encodeURIComponent(moduleName)}`;

    const primaryResponse = await fetch(primaryUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      cf: {
        cacheTtl: 3600,
        cacheEverything: true
      }
    });

    if (!primaryResponse.ok) {
      throw new Error(`Primary API returned ${primaryResponse.status}`);
    }

    const data = await primaryResponse.json();

    return {
      module: moduleName,
      source: data.source,
      timestamp: data.latest?.timestamp
    };

  } catch (primaryError) {
    console.warn(`Primary API failed for "${moduleName}", trying Backup:`, primaryError.message);

    // Backup API. The one that i hate using cuz it's not as pretty
    const fallbackUrl = `https://ronroblox.fandom.com/api.php?action=query&prop=revisions&titles=Module%3A${encodeURIComponent(moduleName)}&rvslots=main&rvprop=content&format=json`;

    const fallbackResponse = await fetch(fallbackUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      cf: {
        cacheTtl: 3600,
        cacheEverything: true
      }
    });

    if (!fallbackResponse.ok) {
      throw new Error(`Fallback API also failed with ${fallbackResponse.status}`);
    }

    const fallbackData = await fallbackResponse.json();

    // Navigate the json
    const pages = fallbackData?.query?.pages;
    if (!pages) {
      throw new Error('Fallback API returned unexpected structure');
    }

    // Grab the first thing in pages since it's a random number so we can't exactly do a clean path now can we
    const page = Object.values(pages)[0];
    const source = page?.revisions?.[0]?.slots?.main?.['*'];

    if (!source) {
      throw new Error(`No content found in backup api response for module "${moduleName}"`);
    }

    return {
      module: moduleName,
      source,
      timestamp: null 
    };
  }
}