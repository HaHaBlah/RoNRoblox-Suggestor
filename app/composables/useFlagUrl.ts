// composables/useFlagUrl.ts
const flagUrlCache = new Map<string, string>();

export function useFlagUrl() {
  const getUrl = async (name: string): Promise<string> => {
    if (flagUrlCache.has(name)) return flagUrlCache.get(name)!;

    const data = await $fetch<{ url: string }>(
      `/api/fandom-image?filename=${encodeURIComponent(`${name}_Flag.png`)}`,
    ).catch(() => null);

    const proxyUrl = data?.url
      ? `/api/fandom-image?proxy=true&url=${encodeURIComponent(data.url)}`
      : "";

    flagUrlCache.set(name, proxyUrl);
    return proxyUrl;
  };

  return { getUrl };
}
