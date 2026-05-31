// composables/FormablerOutput.ts
import { computed, type Ref } from "vue";

export interface FormablerState {
  type: string;
  name: string;
  Demonym: string;
  FlagId: string;
  buttonTitle: string;
  buttonDescription: string;
  alertTitle: string;
  alertDescription: string;
  alertButton: string;
  CountriesCanForm: string[]; 
  RequiredCountries: string[]; 
  RequiredTiles: string[];
  ExclusiveFormables: string[]; 
  Modifiers: string[];
}

export function FormablerOutput(state: Ref<FormablerState>) {
  const TAB = "\t";

  // Helper to turn BOTH comma-separated strings AND arrays into Lua arrays: {"A", "B"}
  const toLuaArray = (input: string | string[]) => {
    if (!input || input.length === 0) return null;

    const items = Array.isArray(input)
      ? input.map((s) => s.trim()).filter(Boolean)
      : input
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    if (!items.length) return null;
    return `{${items.map((i) => `"${i}"`).join(", ")}}`;
  };

  const validation = computed(() => {
    const errors: string[] = [];
    if (!state.value.name?.trim()) errors.push(`${state.value.type} Name`);
    if (!state.value.buttonTitle?.trim()) errors.push("Button Title");
    if (!state.value.buttonDescription?.trim())
      errors.push("Button Description");
    if (
      !state.value.CountriesCanForm ||
      state.value.CountriesCanForm.length === 0
    )
      errors.push("Countries That Can Form");

    return {
      hasErrors: errors.length > 0,
      errors,
    };
  });

  const luaCode = computed(() => {
    if (validation.value.hasErrors) return "";

    const s = state.value;
    const isMission = s.type === "Mission";
    const nameKey = isMission ? "MissionName" : "FormableName";

    const lines: string[] = [];
    lines.push(`{`);
    lines.push(`${TAB}${nameKey} = "${s.name}",`);

    const canForm = toLuaArray(s.CountriesCanForm);
    if (canForm) lines.push(`${TAB}CountriesCanForm = ${canForm},`);

    const reqNations = toLuaArray(s.RequiredCountries);
    if (reqNations) lines.push(`${TAB}RequiredCountries = ${reqNations},`);

    const reqTiles = toLuaArray(s.RequiredTiles);
    if (reqTiles) lines.push(`${TAB}RequiredTiles = ${reqTiles},`);

    const exclusive = toLuaArray(s.ExclusiveFormables);
    if (exclusive) lines.push(`${TAB}ExclusiveFormables = ${exclusive},`);

    lines.push(`${TAB}FormableButton = {`);
    lines.push(`${TAB}${TAB}ButtonName = "${s.buttonTitle}",`);
    lines.push(
      `${TAB}${TAB}ButtonDescription = "${s.buttonDescription.replace(/"/g, '\\"')}",`,
    );
    lines.push(`${TAB}},`);
    lines.push(``);

    if (s.alertTitle || s.alertDescription || s.alertButton) {
      lines.push(`${TAB}CustomAlert = {`);
      if (s.alertTitle) lines.push(`${TAB}${TAB}Title = "${s.alertTitle}",`);
      if (s.alertDescription)
        lines.push(
          `${TAB}${TAB}Desc = "${s.alertDescription.replace(/"/g, '\\"')}",`,
        );
      if (s.alertButton) lines.push(`${TAB}${TAB}Button = "${s.alertButton}",`);
      lines.push(`${TAB}},`);
    }

    // Parse modifiers assuming a default length of -1 (indefinite)
    const mods = s.Modifiers
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    if (mods.length > 0) {
      lines.push(``);
      lines.push(`${TAB}AddModifiers = {`);
      for (const mod of mods) {
        lines.push(`${TAB}${TAB}["${mod}"] = {`);
        lines.push(`${TAB}${TAB}${TAB}Length = -1`);
        lines.push(`${TAB}${TAB}},`);
      }
      lines.push(`${TAB}},`);
    }

    lines.push(`},`);
    return lines.join("\n");
  });

  const outputText = computed(() => {
    if (validation.value.hasErrors || !luaCode.value) return "";

    const metaData: string[] = [];
    if (state.value.type === "Formable") {
      if (state.value.Demonym)
        metaData.push(`Demonym: [${state.value.Demonym}]`);
      if (state.value.FlagId)
        metaData.push(`Flag: [https://create.roblox.com/store/asset/${state.value.FlagId}]`);
    }

    return [
      "```lua",
      luaCode.value,
      "--[[",
      metaData.length ? metaData.join("\n") : "",
      "]]",
      "```",
      "--[[",
      // "# __Other__",
      "> -# *Made using [Formabler](https://ronroblox-suggestor.pages.dev/Formabler/ )*",
      "]]",
    ].join("\n");
  });

  return { outputText, validation };
}
