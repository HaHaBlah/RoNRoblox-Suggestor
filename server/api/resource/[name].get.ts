// server/api/resource/[name].get.ts

const TRANSPARENT_1X1_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, "name");
  if (!name) throw createError({ statusCode: 400, message: "Name required" });

  const reqUrl = getRequestURL(event).toString();

  // 1. Check Cloudflare Edge Cache API (caches.default)
  // @ts-ignore
  const cfCache = typeof caches !== "undefined" && caches.default ? caches.default : null;
  if (cfCache) {
    try {
      const cached = await cfCache.match(reqUrl);
      if (cached) {
        return cached;
      }
    } catch {
      // Ignore cache match errors
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

  try {
    const filename = `${name}_Resource_Icon.png`;
    const fandomApiUrl = `https://ronroblox.fandom.com/rest.php/v1/file/File:${encodeURIComponent(filename)}`;

    // 1. Get the actual image URL from Fandom
    const data = await $fetch<{ preferred?: { url: string } }>(fandomApiUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      timeout: 5000,
    });

    if (!data?.preferred?.url) {
      throw new Error("No URL found");
    }

    // 2. Fetch the actual image bytes with Fandom Referer
    const imgResponse = await fetch(data.preferred.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://ronroblox.fandom.com/",
      },
    });

    if (!imgResponse.ok || !imgResponse.body) {
      throw new Error(`Failed to fetch image: ${imgResponse.status}`);
    }

    const contentType = imgResponse.headers.get("Content-Type") || "image/png";

    // 3. Return native Web Response directly from stream — NO JS stream piping!
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
  } catch {
    // Return transparent 1x1 pixel and cache for 24h
    const fallbackResponse = new Response(TRANSPARENT_1X1_PNG, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });

    if (cfCache) {
      waitUntil(cfCache.put(reqUrl, fallbackResponse.clone()));
    }

    return fallbackResponse;
  }
});
