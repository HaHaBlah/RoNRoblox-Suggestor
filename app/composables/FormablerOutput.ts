// composables/FormablerOutput.ts
import { computed, type Ref } from "vue";

export interface ModifierEntry {
  type: "existing" | "new";
  Title: string;
  Description: string;
  IconID: string;
  Effects: Record<string, any>;
  length: number | string; // Ensure this can be a string for empty state
  infinite: boolean;
  DoNotClear: boolean;
}

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
  Modifiers: ModifierEntry[];

  // Custom Attributes
  DoNotClearModifiers: boolean | string;
  Stability_Gain: number | string;
  PoliticalPower_Gain: number | string;
  Stability_Requirement: number | string;
  Rename_Cities: Record<string, string>[];

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

  const toCityRenameLuaArray = (input: Record<string, string>[]) => {
    if (!input || input.length === 0) return null;

    const items: string[] = [];
    input.forEach((obj) => {
      const city = obj.city?.trim();
      const newName = obj.newName?.trim();
      if (city && newName) {
        items.push(`["${city}", "${newName}"],`);
      }
    });

    if (!items.length) return null;
    return items.join(`\n${TAB}${TAB}${TAB}${TAB}`);
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

    //  Length Validation for Modifiers
    if (state.value.Modifiers && state.value.Modifiers.length > 0) {
      state.value.Modifiers.forEach((mod) => {
        if (
          mod.length === "" ||
          mod.length === null ||
          mod.length === undefined
        ) {
          errors.push(`Length missing for Modifier: "${mod.Title}"`);
        }
      });
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

    if (s.Modifiers && s.Modifiers.length > 0) {
      lines.push(``);
      lines.push(`${TAB}AddModifiers = {`);
      for (const mod of s.Modifiers) {
        lines.push(`${TAB}${TAB}["${mod.Title}"] = {`);

        const len = mod.infinite ? -1 : mod.length;
        if (mod.DoNotClear) {
          lines.push(`${TAB}${TAB}${TAB}Length = ${len},`);
          lines.push(`${TAB}${TAB}${TAB}DoNotClear = true,`);
        } else {
          lines.push(`${TAB}${TAB}${TAB}Length = ${len}`);
        }

        lines.push(`${TAB}${TAB}},`);
      }
      lines.push(`${TAB}},`);
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
    if (s.DoNotClearModifiers)
      customAttributes.push(
        `${TAB}${TAB}["DoNotClearModifiers"] = ${s.DoNotClearModifiers},`,
      );
      
    if (s.Rename_Cities && s.Rename_Cities.length > 0) {
      const renameCitiesArray = toCityRenameLuaArray(s.Rename_Cities);

      if (renameCitiesArray) {
        customAttributes.push(
          `${TAB}${TAB}["Rename_Cities"] = [[\n` +
            `${TAB}${TAB}${TAB}[\n` +
            `${TAB}${TAB}${TAB}${TAB}${renameCitiesArray}\n` +
            `${TAB}${TAB}${TAB}]\n` +
            `${TAB}${TAB}]],`,
        );
      }
    }

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

    const newMods =
      state.value.Modifiers?.filter((m) => m.type === "new") || [];
    if (newMods.length > 0) {
      outputLines.push("\n# --__New Modifiers__");
      outputLines.push("```lua");
      newMods.forEach((mod) => {
        outputLines.push(`{`);
        outputLines.push(`${TAB}Title = "${mod.Title}",`);
        outputLines.push(
          `${TAB}Description = "${mod.Description.replace(/"/g, '\\"')}",`,
        );
        if (mod.IconID) {
          outputLines.push(`${TAB}Icon = {`);
          outputLines.push(
            `${TAB}${TAB}ID = "http://www.roblox.com/asset/?id=${mod.IconID}",`,
          );
          outputLines.push(`${TAB}${TAB}Color = Color3.fromRGB(255, 255, 255)`);
          outputLines.push(`${TAB}},`);
        }
        outputLines.push(`${TAB}Effects = {`);

        for (const [key, val] of Object.entries(mod.Effects)) {
          let valueArr: any;
          if (Array.isArray(val)) {
            if (!val[1] || val[1] === "Base") {
              valueArr = `{${val[0]}}`;
            } else {
              valueArr = `{${val[0]}, "${val[1]}"}`;
            }
          } else {
            valueArr = val;
          }

          outputLines.push(`${TAB}${TAB}["${key}"] = ${valueArr},`);
        }

        outputLines.push(`${TAB}},`);
        outputLines.push(`},`);
      });
      outputLines.push("```");
    }

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
