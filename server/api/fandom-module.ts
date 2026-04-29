// server/api/fandom-module.ts
export default defineEventHandler(async (event) => {
  const { module: moduleName } = getQuery(event);

  if (!moduleName || typeof moduleName !== "string") {
    throw createError({ statusCode: 400, message: "Module name is required" });
  }

  return await fetchWithFallback(moduleName);
});

async function fetchWithFallback(moduleName: string) {
  // Primary: REST API
  try {
    const primaryUrl = `https://ronroblox.fandom.com/rest.php/v1/page/Module%3A${encodeURIComponent(moduleName)}`;

    const data = await $fetch<{
      source: string;
      latest?: { timestamp: string };
    }>(primaryUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
    });

    return {
      module: moduleName,
      source: data.source,
      timestamp: data.latest?.timestamp ?? null,
    };
  } catch (primaryError) {
    console.warn(
      `Primary API failed for "${moduleName}", trying backup:`,
      (primaryError as Error).message,
    );

    // Backup: action=query API
    const fallbackUrl = `https://ronroblox.fandom.com/api.php?action=query&prop=revisions&titles=Module%3A${encodeURIComponent(moduleName)}&rvslots=main&rvprop=content&format=json`;

    const fallbackData = await $fetch<any>(fallbackUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
    });

    const pages = fallbackData?.query?.pages;
    if (!pages)
      throw createError({
        statusCode: 500,
        message: "Fallback API returned unexpected structure",
      });

    const page = Object.values(pages)[0] as any;
    const source = page?.revisions?.[0]?.slots?.main?.["*"];

    if (!source) {
      throw createError({
        statusCode: 500,
        message: `No content found in fallback response for module "${moduleName}"`,
      });
    }

    return { module: moduleName, source, timestamp: null };
  }
}
