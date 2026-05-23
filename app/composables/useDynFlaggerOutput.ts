// composables/useDynFlaggerOutput.ts
import { useDynFlagger } from "~/composables/useDynFlagger";
import type { FlagSpec } from "~/composables/useDynFlagger";

const TAB = "    ";

// Cache lives at module level so it survives across composable calls
const thumbnailCache = reactive<Record<string, string | null>>({});

async function fetchThumbnail(flagId: string): Promise<string | null> {
  if (flagId in thumbnailCache) return thumbnailCache[flagId];
  try {
    const data = await $fetch<{ imageUrl: string }>(
      `/api/roblox-thumbnail?assetid=${encodeURIComponent(flagId)}&size=700x700`,
    );
    thumbnailCache[flagId] = data.imageUrl;
  } catch {
    thumbnailCache[flagId] = null;
  }
  return thumbnailCache[flagId];
}

function buildSingleFlag(flag: FlagSpec): string {
  const id = flag.FlagID ? `rbxassetid://${flag.FlagID}` : "";
  const name = flag.FlagName ?? "";
  const hasIdeologies = flag.Ideologies?.length > 0;
  const hasLaws = Object.keys(flag.Laws ?? {}).length > 0;
  const hasNOTLaws = Object.keys(flag.NOTLaws ?? {}).length > 0;

  if (!hasIdeologies && !hasLaws && !hasNOTLaws) {
    return `${TAB}["${name}"] = {ID = "${id}",},`;
  }

  const lines = [
    `${TAB}["${name}"] = {ID = "${id}",`,
    `${TAB}${TAB}Requirements = {`,
  ];
  if (hasIdeologies)
    lines.push(
      `${TAB}${TAB}${TAB}${TAB}["Ideology"] = '[${flag.Ideologies.map((i) => `"${i}"`).join(", ")}]',`,
    );
  if (hasLaws)
    lines.push(
      `${TAB}${TAB}${TAB}${TAB}["Political_Law"] = '${JSON.stringify(flag.Laws)}',`,
    );
  if (hasNOTLaws)
    lines.push(
      `${TAB}${TAB}${TAB}${TAB}["NOT_Political_Law"] = '${JSON.stringify(flag.NOTLaws)}',`,
    );
  lines.push(`${TAB}${TAB}},`, `${TAB}},`);
  return lines.join("\n");
}

export function useDynFlaggerOutput() {
  const { state } = useDynFlagger();

  const validFlags = computed(() =>
    state.Flags.filter((f) => f.FlagName && f.FlagID),
  );

  const luaCode = computed(() => {
    if (!validFlags.value.length || !state.NationName) return "";
    return `["${state.NationName}"] = {\n${validFlags.value.map(buildSingleFlag).join("\n")}\n},`;
  });

  const imageLinks = ref<string[]>([]);

  watch(
    validFlags,
    async (flags) => {
      const urls = await Promise.all(
        flags.map((f) => fetchThumbnail(f.FlagID)),
      );
      imageLinks.value = flags
        .map((f, i) => (urls[i] ? `[${f.FlagName}](${urls[i]})` : null))
        .filter((x): x is string => Boolean(x));
    },
    { deep: true, immediate: true },
  );

  const outputText = computed(() => {
    if (!luaCode.value) return "";
    const descriptions = state.Flags.filter((f) => f.Description)
      .map((f) => `**${f.FlagName}:** ${f.Description}`)
      .join("\n");
    const imagesBlock = imageLinks.value.join(", ");

    return [
      "```lua",
      luaCode.value,
      "```",
      "--[[",
      "# __Description/Sources__",
      descriptions,
      "# __Images__",
      imagesBlock,
      "> -# *Made using [Dyn-Flagger](https://ronroblox-suggestor.pages.dev/Dyn-Flagger/ )*",
      "]]",
    ].join("\n");
  });

  return { outputText, luaCode };
}
