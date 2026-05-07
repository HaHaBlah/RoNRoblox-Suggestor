// composables/useFlagUrl.ts
export function useFlagUrl() {
  const getFlagData = async (name: string) => {
    if (!name) return "";
    return `/api/flag/${encodeURIComponent(name)}`;
  };

  return { getFlagData };
}