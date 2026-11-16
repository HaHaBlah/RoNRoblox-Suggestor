// server/api/roblox-thumbnail.ts

interface ThumbnailResult {
  imageUrl: string;
  state: string;
  fullData: unknown;
}

async function fetchThumbnailWithRetry(
  imageID: string,
  size: string,
  maxRetries = 5,
  initialDelayMs = 600,
): Promise<ThumbnailResult> {
  const apiUrl = `https://thumbnails.roblox.com/v1/assets?assetIds=${encodeURIComponent(imageID)}&size=${encodeURIComponent(size)}&format=Png&isCircular=false`;

  let delayMs = initialDelayMs;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const data = await $fetch<{ data: { state: string; imageUrl: string }[] }>(
        apiUrl,
        {
          timeout: 4500,
          // CRITICAL: Never use cf: { cacheEverything: true } on internal fetches.
          // Caching upstream "Pending" or transient error responses causes Cloudflare to cache failures.
        }
      );

      const thumbnail = data?.data?.[0];
      if (!thumbnail) {
        throw createError({
          statusCode: 404,
          message: "Thumbnail data not found in Roblox response",
        });
      }

      // If Roblox is actively generating the thumbnail, wait and retry
      if (thumbnail.state === "Pending") {
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          delayMs = Math.min(delayMs * 1.3, 1500);
          continue;
        }
        return {
          imageUrl: "",
          state: "Pending",
          fullData: data,
        };
      }

      // If Roblox reported Blocked or Error
      if (thumbnail.state === "Blocked" || thumbnail.state === "Error") {
        return {
          imageUrl: "",
          state: thumbnail.state,
          fullData: data,
        };
      }

      // Check for broken image placeholders
      const img = thumbnail.imageUrl || "";
      if (img.includes("BrokenImage") || img.includes("UnavailableImage")) {
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          delayMs = Math.min(delayMs * 1.3, 1500);
          continue;
        }
        return {
          imageUrl: "",
          state: "Error",
          fullData: data,
        };
      }

      return {
        imageUrl: img,
        state: thumbnail.state || "Completed",
        fullData: data,
      };
    } catch (err: any) {
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs = Math.min(delayMs * 1.3, 1500);
        continue;
      }
      throw err;
    }
  }

  throw createError({ statusCode: 500, message: "Thumbnail fetch failed after retries" });
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const rawId = query.assetid as string | undefined;
  const match = rawId ? String(rawId).match(/\d+/) : null;
  const imageID = match ? match[0] : "";
  const size = (query.size as string | undefined) ?? "700x700";

  if (!imageID) {
    throw createError({
      statusCode: 400,
      message: "Valid numeric assetid parameter required",
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

  const isSuccess =
    result.state === "Completed" &&
    Boolean(result.imageUrl) &&
    !result.imageUrl.includes("BrokenImage") &&
    !result.imageUrl.includes("UnavailableImage");

  if (!isSuccess) {
    // If pending or failed, never cache in edge cache and inform client to retry if pending
    return new Response(
      JSON.stringify({
        imageUrl: "",
        state: result.state,
        retry: result.state === "Pending",
      }),
      {
        status: result.state === "Pending" ? 202 : 404,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  const payload = {
    imageUrl: result.imageUrl,
    state: result.state,
    fullData: result.fullData,
  };

  const response = new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=604800, s-maxage=604800", // Cache successful thumbnails for 7 days
      "Access-Control-Allow-Origin": "*",
    },
  });

  if (cfCache) {
    waitUntil(cfCache.put(reqUrl, response.clone()));
  }

  return response;
});
