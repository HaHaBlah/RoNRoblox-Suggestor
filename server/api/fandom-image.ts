// server/api/fandom-image.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event);

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

    setResponseHeader(
      event,
      "Content-Type",
      imgResponse.headers.get("Content-Type") ?? "image/png",
    );
    setResponseHeader(event, "Cache-Control", "public, max-age=3600");
    return sendStream(event, imgResponse.body!);
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

  setResponseHeader(event, "Cache-Control", "public, max-age=3600");

  return {
    url: data.preferred.url,
    width: data.preferred.width,
    height: data.preferred.height,
    mediatype: data.preferred.mediatype,
  };
});
