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
  Modifiers: string;

  // Custom Attributes
  DoNotClearModifiers: boolean | string;
  Stability_Gain: number | string;
  PoliticalPower_Gain: number | string;
  Stability_Requirement: number | string;

  // Metadata
  SourcesDescription: string;
}

export function FormablerOutput(state: Ref<FormablerState>) {
  const TAB = "\t";

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

    const hasReqCountries =
      state.value.RequiredCountries && state.value.RequiredCountries.length > 0;
    const hasReqTiles =
      state.value.RequiredTiles && state.value.RequiredTiles.length > 0;

    if (!hasReqCountries && !hasReqTiles) {
      errors.push("Required Countries OR Required Tiles");
    }

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

    // FIX: Moved the blank line inside the conditional block
    if (s.alertTitle || s.alertDescription || s.alertButton) {
      lines.push(``);
      lines.push(`${TAB}CustomAlert = {`);
      if (s.alertTitle) lines.push(`${TAB}${TAB}Title = "${s.alertTitle}",`);
      if (s.alertDescription)
        lines.push(
          `${TAB}${TAB}Desc = "${s.alertDescription.replace(/"/g, '\\"')}",`,
        );
      if (s.alertButton) lines.push(`${TAB}${TAB}Button = "${s.alertButton}",`);
      lines.push(`${TAB}},`);
    }

    if (s.Modifiers) {
      const mods = s.Modifiers.split(",")
        .map((m) => m.trim())
        .filter(Boolean);

      if (mods.length > 0) {
        lines.push(``);
        lines.push(`${TAB}AddModifiers = {`);
        for (const mod of mods) {
          lines.push(`${TAB}${TAB}["${mod}"] = {`);

          if (s.DoNotClearModifiers) {
            lines.push(`${TAB}${TAB}${TAB}Length = -1,`);
            lines.push(`${TAB}${TAB}${TAB}DoNotClear = true,`);
          } else {
            lines.push(`${TAB}${TAB}${TAB}Length = -1`);
          }

          lines.push(`${TAB}${TAB}},`);
        }
        lines.push(`${TAB}},`);
      }
    }

    const customAttributes: string[] = [];
    if (s.Stability_Gain)
      customAttributes.push(
        `${TAB}${TAB}["Stability_Gain"] = ${s.Stability_Gain},`,
      );
    if (s.PoliticalPower_Gain)
      customAttributes.push(
        `${TAB}${TAB}["PoliticalPower_Gain"] = ${s.PoliticalPower_Gain},`,
      );
    if (s.Stability_Requirement)
      customAttributes.push(
        `${TAB}${TAB}["Stability_Requirement"] = ${s.Stability_Requirement},`,
      );

    if (customAttributes.length > 0) {
      lines.push(``);
      lines.push(`${TAB}CustomAttributes = {`);
      lines.push(...customAttributes);
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
      if (state.value.FlagId) {
        // Extract just the numeric ID from the input string/URL
        const match = state.value.FlagId.match(/\d+/);
        const parsedId = match ? match[0] : state.value.FlagId;

        metaData.push(
          `Flag: [https://create.roblox.com/store/asset/${parsedId}]`,
        );
      }
    }

    const outputLines: string[] = [];

    outputLines.push("```lua");
    outputLines.push(luaCode.value);

    if (metaData.length > 0) {
      outputLines.push("--[[");
      outputLines.push(metaData.join("\n"));
      outputLines.push("]]");
    }

    outputLines.push("```");

    outputLines.push("--[[");
    if (state.value.SourcesDescription) {
      outputLines.push("# __Description/Sources__");
      outputLines.push(state.value.SourcesDescription);
    }
    outputLines.push(
      "> -# *Made using [Formabler](https://ronroblox-suggestor.pages.dev/Formabler/ )*",
    );
    outputLines.push("]]");

    return outputLines.join("\n");
  });

  return { outputText, validation };
}
