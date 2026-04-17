export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    }

    const decalId = url.searchParams.get('decalid');
    if (!decalId) {
        return new Response(JSON.stringify({ error: 'decalid parameter required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

    try {
        const assetResponse = await fetch(
            `https://apis.roblox.com/asset-delivery-api/v1/assetId/${encodeURIComponent(decalId)}`,
            {
                headers: {
                    'x-api-key': context.env.ROBLOX_API_KEY,
                }
            }
        );

        if (!assetResponse.ok) {
            const body = await assetResponse.text();
            console.error(`Asset delivery response body:`, body);
            throw new Error(`Asset delivery returned ${assetResponse.status}`);
        }

        const assetData = await assetResponse.json();
        const cdnUrl = assetData?.location;
        if (!cdnUrl) throw new Error('No CDN location found in response');

        const cdnResponse = await fetch(cdnUrl);
        if (!cdnResponse.ok) throw new Error(`CDN fetch returned ${cdnResponse.status}`);

        const xml = await cdnResponse.text();
        // console.log('XML:', xml.slice(0, 500));

        const match = xml.match(/name="Texture"[\s\S]*?<url>[^<]*?id=(\d+)[^<]*<\/url>/);
        if (!match) throw new Error('Could not find Texture ID in decal XML');

        return new Response(JSON.stringify({ imageId: match[1], decalId }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=3600'
            }
        });

    } catch (error) {
        console.error(`Error resolving decal ${decalId}:`, error);
        return new Response(JSON.stringify({ error: error.message, decalId }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}