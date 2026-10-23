// server/api/roblox-thumbnail.ts

interface ThumbnailResult {
  imageUrl: string;
  state: string;
  fullData: unknown;
}

async function fetchThumbnailWithRetry(
  imageID: string,
  size: string,
  maxRetries = 3,
  delayMs = 500,
): Promise<ThumbnailResult> {
  const apiUrl = `https://thumbnails.roblox.com/v1/assets?assetIds=${encodeURIComponent(imageID)}&size=${encodeURIComponent(size)}&format=Png&isCircular=false`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const data = await $fetch<{ data: { state: string; imageUrl: string }[] }>(
      apiUrl,
      { timeout: 4000 }
    );

    const thumbnail = data?.data?.[0];
    if (!thumbnail)
      throw createError({
        statusCode: 500,
        message: "Thumbnail data not found in response",
      });

    if (thumbnail.state === "Pending") {
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw createError({
        statusCode: 500,
        message: `Thumbnail still pending after ${maxRetries} attempts`,
      });
    }

    return {
      imageUrl: thumbnail.imageUrl,
      state: thumbnail.state,
      fullData: data,
    };
  }

  throw createError({ statusCode: 500, message: "Thumbnail fetch failed" });
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const imageID = query.assetid as string | undefined;
  const size = (query.size as string | undefined) ?? "700x700";

  if (!imageID) {
    throw createError({
      statusCode: 400,
      message: "assetid parameter required",
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

  const result = await fetchThumbnailWithRetry(imageID, size);

  const payload = {
    imageUrl: result.imageUrl,
    state: result.state,
    fullData: result.fullData,
  };

  const response = new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=604800, s-maxage=604800", // Cache for 7 days
      "Access-Control-Allow-Origin": "*",
    },
  });

  if (cfCache) {
    waitUntil(cfCache.put(reqUrl, response.clone()));
  }

  return response;
});
