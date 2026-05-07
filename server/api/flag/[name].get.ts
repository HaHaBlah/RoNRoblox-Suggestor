// server/api/flag/[name].get.ts
export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name');
  if (!name) throw createError({ statusCode: 400, message: "Name required" });

  // Tell Cloudflare to cache this image aggressively at the Edge for 1 year
  setResponseHeader(event, "Cache-Control", "public, max-age=31536000, s-maxage=31536000");

  try {
    const filename = `${name}_Flag.png`;
    const fandomApiUrl = `https://ronroblox.fandom.com/rest.php/v1/file/File:${encodeURIComponent(filename)}`;

    // 1. Get the actual image URL from Fandom
    const data = await $fetch<any>(fandomApiUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    if (!data?.preferred?.url) {
      throw new Error("No URL found");
    }

    // 2. Fetch the actual image bytes
    const imgResponse = await fetch(data.preferred.url, {
      headers: { 
        "User-Agent": "Mozilla/5.0", 
        "Referer": "https://ronroblox.fandom.com/" 
      }
    });

    // 3. Stream it directly to the browser
    setResponseHeader(event, "Content-Type", imgResponse.headers.get("Content-Type") ?? "image/png");
    return sendStream(event, imgResponse.body!);

  } catch (error) {
    // If it fails (e.g. flag doesn't exist), return a transparent 1x1 pixel so it doesn't show a broken image icon
    const transparentPixel = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
    setResponseHeader(event, "Content-Type", "image/png");
    return transparentPixel;
  }
});