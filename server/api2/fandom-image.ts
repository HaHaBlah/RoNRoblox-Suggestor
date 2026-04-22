// fandom-image.js
export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);

    // OPTIONS must be first
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    }

    // If proxy=true, fetch and return the actual image bytes
    if (url.searchParams.get('proxy') === 'true') {
        const imageUrl = url.searchParams.get('url');
        if (!imageUrl || !imageUrl.startsWith('https://static.wikia.nocookie.net/')) {
            return new Response('Invalid url', { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
        }
        const imgResponse = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Referer': 'https://ronroblox.fandom.com/',
            },
            cf: { cacheTtl: 3600, cacheEverything: true }
        });
        return new Response(imgResponse.body, {
            headers: {
                'Content-Type': imgResponse.headers.get('Content-Type') ?? 'image/png',
                'Cache-Control': 'public, max-age=3600',
                'Access-Control-Allow-Origin': '*',
            }
        });
    }

    const filename = url.searchParams.get('filename');

    if (!filename) {
        return new Response(JSON.stringify({ error: 'filename parameter required' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    try {
        const fandomApiUrl = `https://ronroblox.fandom.com/rest.php/v1/file/File:${encodeURIComponent(filename)}`;

        const response = await fetch(fandomApiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            },
            cf: {
                cacheTtl: 3600,
                cacheEverything: true
            }
        });

        if (!response.ok) {
            const body = await response.text();
            console.error(`Fandom API error body: ${body.slice(0, 500)}`);
            throw new Error(`Fandom API returned ${response.status}`);
        }

        const data = await response.json();

        if (data.preferred && data.preferred.url) {
            return new Response(JSON.stringify({
                url: data.preferred.url,
                width: data.preferred.width,
                height: data.preferred.height,
                mediatype: data.preferred.mediatype,
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=3600'
                }
            });
        } else {
            throw new Error('Preferred URL not found in response');
        }

    } catch (error) {
        console.error(`Error fetching Fandom image for ${filename}:`, error);
        return new Response(JSON.stringify({
            error: error.message,
            filename: filename
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}