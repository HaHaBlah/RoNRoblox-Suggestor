// composables/useDynFlaggerOutput.ts
import { useDynFlagger } from "~/composables/useDynFlagger";
import type { FlagSpec } from "~/composables/useDynFlagger";

const TAB = "\t";

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

function buildSingleFlag(flag: FlagSpec, index: number): string {
  const id = flag.FlagID
    ? `rbxassetid://${flag.FlagID}`
    : `MISSING_ID_FLAG_${index + 1}`;
  const name = flag.FlagName?.trim() || `MISSING_NAME_FLAG_${index + 1}`;
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

  const validation = computed(() => {
    const isNationMissing = !state.NationName?.trim();
    const errors: string[] = [];

    if (isNationMissing) errors.push("Nation Name");

    const flagErrors = state.Flags.map((f, i) => {
      const missingName = !f.FlagName?.trim();
      const missingId = !f.FlagID?.trim();

      if (missingName) errors.push(`Flag ${i + 1} Name`);
      if (missingId) errors.push(`Flag ${i + 1} Image ID`);

      return { missingName, missingId };
    });

    return {
      hasErrors: errors.length > 0,
      errors,
      isNationMissing,
      flagErrors,
    };
  });

  const luaCode = computed(() => {
    if (!state.Flags.length) return "";

    const nationName = state.NationName?.trim() || "MISSING_NATION_NAME";
    const flagBlocks = state.Flags.map((f, i) => buildSingleFlag(f, i)).join(
      "\n",
    );

    //  The outer block is required for proper Lua table formatting, but the inner blocks are optional based on the presence of requirements.
    return `["${nationName}"] = {\n${flagBlocks}\n},`;
  });

  const imageLinks = ref<string[]>([]);

  watch(
    () => state.Flags,
    async (flags) => {
      const urls = await Promise.all(
        flags.map((f) =>
          f.FlagID ? fetchThumbnail(f.FlagID) : Promise.resolve(null),
        ),
      );
      imageLinks.value = flags
        .map((f, i) =>
          urls[i] ? `[${f.FlagName || `Flag ${i + 1}`}](${urls[i]})` : null,
        )
        .filter((x): x is string => Boolean(x));
    },
    { deep: true, immediate: true },
  );

  const outputText = computed(() => {
    // Return empty string if invalid
    if (validation.value.hasErrors || !luaCode.value) return "";

    const descriptions = state.Flags.filter((f) => f.Description)
      .map((f) => `**${f.FlagName || "Unnamed Flag"}:** ${f.Description}`)
      .join("\n");
    const imagesBlock = imageLinks.value.join(", ");

    return [
      "```lua",
      luaCode.value,
      "```",
      "--[[",
      ...(descriptions ? ["# __Description/Sources__", descriptions] : []),
      "# __Images__",
      imagesBlock || "None",
      "> -# *Made using [Dyn-Flagger](https://ronroblox-suggestor.pages.dev/Dyn-Flagger/ )*",
      "]]",
    ].join("\n");
  });

  return { outputText, luaCode, validation };
}
