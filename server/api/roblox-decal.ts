// server/api/roblox-decal.ts
export default defineEventHandler(async (event) => {
  const { decalid } = getQuery(event);

  if (!decalid || typeof decalid !== "string") {
    throw createError({
      statusCode: 400,
      message: "decalid parameter required",
    });
  }

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

  setResponseHeader(event, "Cache-Control", "public, max-age=3600");
  return { imageId: match[1], decalId: decalid };
});
