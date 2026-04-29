// server/utils/robloxProcessor.ts
export async function getRobloxThumbnailURL(
  assetID: string | number,
  size = "700x700",
) {
  const data = await $fetch<{ imageUrl: string; error?: string }>(
    `/api/roblox-thumbnail?assetid=${encodeURIComponent(assetID)}&size=${encodeURIComponent(size)}`,
  );
  if (data.error) throw new Error(data.error);
  return data.imageUrl;
}

export async function getImageIdFromDecalId(
  decalId: string | number,
  signal?: AbortSignal,
) {
  const data = await $fetch<{ imageId: string; error?: string }>(
    `/api/roblox-decal?decalid=${encodeURIComponent(decalId)}`,
    { signal },
  );
  if (data.error) throw new Error(data.error);
  return data.imageId;
}
