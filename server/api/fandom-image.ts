// server/api/fandom-image.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
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

  // Proxy mode: fetch and stream the actual image bytes
  if (query.proxy === "true") {
    const imageUrl = query.url as string | undefined;

    if (!imageUrl?.startsWith("https://static.wikia.nocookie.net/")) {
      throw createError({ statusCode: 400, message: "Invalid url" });
    }

    const imgResponse = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://ronroblox.fandom.com/",
      },
    });

    if (!imgResponse.ok || !imgResponse.body) {
      throw createError({ statusCode: imgResponse.status, message: "Failed to fetch image" });
    }

    const contentType = imgResponse.headers.get("Content-Type") ?? "image/png";

    const response = new Response(imgResponse.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });

    if (cfCache) {
      waitUntil(cfCache.put(reqUrl, response.clone()));
    }

    return response;
  }

  // URL resolution mode: return the preferred image URL from Fandom's API
  const filename = query.filename as string | undefined;

  if (!filename) {
    throw createError({
      statusCode: 400,
      message: "filename parameter required",
    });
  }

  const fandomApiUrl = `https://ronroblox.fandom.com/rest.php/v1/file/File:${encodeURIComponent(filename)}`;

  const data = await $fetch<{
    preferred?: {
      url: string;
      width: number;
      height: number;
      mediatype: string;
    };
  }>(fandomApiUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "application/json",
    },
    timeout: 5000,
  }).catch((err) => {
    throw createError({
      statusCode: 500,
      message: `Fandom API error: ${err.message}`,
    });
  });

  if (!data.preferred?.url) {
    throw createError({
      statusCode: 500,
      message: "Preferred URL not found in response",
    });
  }

  const payload = {
    url: data.preferred.url,
    width: data.preferred.width,
    height: data.preferred.height,
    mediatype: data.preferred.mediatype,
  };

  const response = new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=604800, s-maxage=604800",
      "Access-Control-Allow-Origin": "*",
    },
  });

  if (cfCache) {
    waitUntil(cfCache.put(reqUrl, response.clone()));
  }

  return response;
});
