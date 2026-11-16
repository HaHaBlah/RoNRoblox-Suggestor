// server/api/roblox-decal.ts
export default defineEventHandler(async (event) => {
  const { decalid } = getQuery(event);

  if (!decalid || typeof decalid !== "string") {
    throw createError({
      statusCode: 400,
      message: "decalid parameter required",
    });
  }

  const matchId = String(decalid).match(/\d+/);
  const cleanDecalId = matchId ? matchId[0] : "";

  if (!cleanDecalId) {
    throw createError({
      statusCode: 400,
      message: "Valid numeric decalid parameter required",
    });
  }

  const reqUrl = getRequestURL(event).toString();

  // 1. Check Cloudflare Edge Cache API
  // @ts-ignore
  const cfCache = typeof caches !== "undefined" && caches.default ? caches.default : null;
  if (cfCache) {
    try {
      const cached = await cfCache.match(reqUrl);
      if (cached) {
        return cached;
      }
    } catch {
      // Ignore cache match error
    }
  }

  const waitUntil = (promise: Promise<any>) => {
    const cfContext = (event.context as any).cloudflare?.context;
    if (cfContext?.waitUntil) {
      cfContext.waitUntil(promise);
    } else if ((event as any).waitUntil) {
      (event as any).waitUntil(promise);
    }
  };

  const config = useRuntimeConfig();

  try {
    // Resolve decal → CDN location
    const assetData = await $fetch<{ location?: string }>(
      `https://apis.roblox.com/asset-delivery-api/v1/assetId/${encodeURIComponent(cleanDecalId)}`,
      {
        headers: config.robloxApiKey ? { "x-api-key": config.robloxApiKey } : undefined,
        timeout: 4000,
      },
    );

    const cdnUrl = assetData?.location;
    if (cdnUrl) {
      // Fetch decal XML from CDN
      const xml = await $fetch<string>(cdnUrl, {
        responseType: "text",
        timeout: 4000,
      });

      const match = xml.match(
        /name="Texture"[\s\S]*?<url>[^<]*?id=(\d+)[^<]*<\/url>/,
      );

      if (match && match[1]) {
        // Successfully resolved Decal ID → Image ID
        const payload = { imageId: match[1], decalId: cleanDecalId, isDecal: true };
        const response = new Response(JSON.stringify(payload), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable", // Decals never change
            "Access-Control-Allow-Origin": "*",
          },
        });

        if (cfCache) {
          waitUntil(cfCache.put(reqUrl, response.clone()));
        }

        return response;
      }
    }
  } catch {
    // Asset delivery or XML parsing failed (e.g. asset is already an Image ID, or API key unavailable)
  }

  // Fallback: If it's not a decal XML (it's already an Image ID), return the ID directly as imageId
  return new Response(
    JSON.stringify({ imageId: cleanDecalId, decalId: cleanDecalId, isDecal: false }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
});
