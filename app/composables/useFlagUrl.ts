// composables/useFlagUrl.ts
export function useFlagUrl() {
  const getFlagData = async (name: string) => {
    const data = await $fetch<{ url: string }>(
      `/api/fandom-image?filename=${encodeURIComponent(`${name}_Flag.png`)}`,
    ).catch(() => null);

    return data?.url
      ? `/api/fandom-image?proxy=true&url=${encodeURIComponent(data.url)}`
      : "";
  };

  return { getFlagData };
}