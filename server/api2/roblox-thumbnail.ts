// roblox-thumbnail.js
/**
 *  Helper function to fetch with retry logic for pending thumbnails
*/
async function fetchThumbnailWithRetry(imageID, size, maxRetries = 5, delayMs = 1000) {
    const robloxThumbnailApiUrl = `https://thumbnails.roblox.com/v1/assets?assetIds=${encodeURIComponent(imageID)}&size=${encodeURIComponent(size)}&format=Png&isCircular=false`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const response = await fetch(robloxThumbnailApiUrl);

        if (!response.ok) {
            throw new Error(`Roblox API returned ${response.status}`);
        }

        const data = await response.json();

        if (data.data && data.data[0]) {
            const thumbnail = data.data[0];

            // Check if thumbnail is still pending
            if (thumbnail.state === 'Pending') {
                console.log(`Thumbnail for ${imageID} is Pending (attempt ${attempt}/${maxRetries}). Retrying in ${delayMs}ms...`);

                if (attempt < maxRetries) {
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    continue;
                } else {
                    // Max retries reached, throw error
                    throw new Error(`Thumbnail still pending after ${maxRetries} attempts`);
                }
            }

            // Thumbnail is ready
            return {
                imageUrl: thumbnail.imageUrl,
                state: thumbnail.state,
                fullData: data
            };
        } else {
            throw new Error('Thumbnail data not found in response');
        }
    }
}

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

    // Get imageID from query parameter
    const imageID = url.searchParams.get('assetid');
    const size = url.searchParams.get('size') || '700x700';

    if (!imageID) {
        return new Response(JSON.stringify({ error: 'assetid parameter required' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    try {
        const result = await fetchThumbnailWithRetry(imageID, size);

        return new Response(JSON.stringify({
            imageUrl: result.imageUrl,
            state: result.state,
            fullData: result.fullData
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
            }
        });

    } catch (error) {
        console.error(`Error fetching Roblox Thumbnail image for ${imageID}:`, error);
        return new Response(JSON.stringify({
            error: error.message,
            imageID: imageID
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}