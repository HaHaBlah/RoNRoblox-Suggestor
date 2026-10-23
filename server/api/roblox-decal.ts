// server/api/roblox-decal.ts
export default defineEventHandler(async (event) => {
  const { decalid } = getQuery(event);

  if (!decalid || typeof decalid !== "string") {
    throw createError({
      statusCode: 400,
      message: "decalid parameter required",
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

  // Resolve decal → CDN location
  const assetData = await $fetch<{ location?: string }>(
    `https://apis.roblox.com/asset-delivery-api/v1/assetId/${encodeURIComponent(decalid)}`,
    {
      headers: { "x-api-key": config.robloxApiKey },
    },
  ).catch((err) => {
    throw createError({
      statusCode: 500,
      message: `Asset delivery error: ${err.message}`,
    });
  });

  const cdnUrl = assetData?.location;
  if (!cdnUrl)
    throw createError({
      statusCode: 500,
      message: "No CDN location found in response",
    });

  // Fetch the decal XML from the CDN
  const xml = await $fetch<string>(cdnUrl, { responseType: "text" }).catch(
    (err) => {
      throw createError({
        statusCode: 500,
        message: `CDN fetch error: ${err.message}`,
      });
    },
  );

  const match = xml.match(
    /name="Texture"[\s\S]*?<url>[^<]*?id=(\d+)[^<]*<\/url>/,
  );
  if (!match)
    throw createError({
      statusCode: 500,
      message: "Could not find Texture ID in decal XML",
    });

  const payload = { imageId: match[1], decalId: decalid };

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
});
