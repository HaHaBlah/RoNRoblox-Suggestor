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
  delayMs = 1000,
): Promise<ThumbnailResult> {
  const apiUrl = `https://thumbnails.roblox.com/v1/assets?assetIds=${encodeURIComponent(imageID)}&size=${encodeURIComponent(size)}&format=Png&isCircular=false`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const data = await $fetch<{ data: { state: string; imageUrl: string }[] }>(
      apiUrl,
    );

    const thumbnail = data?.data?.[0];
    if (!thumbnail)
      throw createError({
        statusCode: 500,
        message: "Thumbnail data not found in response",
      });

    if (thumbnail.state === "Pending") {
      if (attempt < maxRetries) {
        console.log(
          `Thumbnail for ${imageID} is Pending (attempt ${attempt}/${maxRetries}). Retrying in ${delayMs}ms...`,
        );
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

  // Unreachable, but satisfies TS
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

  const result = await fetchThumbnailWithRetry(imageID, size);

  setResponseHeader(event, "Cache-Control", "public, max-age=3600");
  return {
    imageUrl: result.imageUrl,
    state: result.state,
    fullData: result.fullData,
  };
});
