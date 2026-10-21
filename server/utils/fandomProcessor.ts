// server/utils/fandomProcessor.ts
import luaparse from "luaparse";
import { fetchWithFallback } from "../api/fandom-module";

const fandomModules: Record<string, string> = {
  Lawnames: "Lawnames",
  Flagdata: "Flagdata",
  Nationdata: "Nationdata",
  Tagdata: "Tagdata",
  Modifierdata: "Modifierdata",
  ModifierEffectsdata: "ModifierEffectsdata",
};

export async function getFandomImageUrl(filename: string, baseUrl = "") {
  const data = await $fetch<{ url: string; error?: string }>(
    `${baseUrl}/api/fandom-image?filename=${encodeURIComponent(filename)}`,
  );
  if (data.error) throw new Error(data.error);
  return `/api/fandom-image?proxy=true&url=${encodeURIComponent(data.url)}`;
}

async function loadAllModules() {
  const modulePromises = Object.entries(fandomModules).map(
    async ([name, moduleName]) => {
      const data = await fetchWithFallback(moduleName);
      return [name, data.source] as const;
    },
  );

  return Object.fromEntries(await Promise.all(modulePromises));
}

type LuaValue = string | number | boolean | null | LuaTable;
type LuaTable = { [key: string | number]: LuaValue };

function extractValue(node: any): LuaValue {
  if (!node) return null;

  switch (node.type) {
    case "StringLiteral":
      if (node.value !== null) return node.value;
      if (node.raw) return node.raw.slice(1, -1);
      return null;

    case "NumericLiteral":
      return node.value;

    case "BooleanLiteral":
      return node.value;

    case "NilLiteral":
      return null;

    // 1. Support for negative numbers (e.g., -10)
    case "UnaryExpression": {
      const argument = extractValue(node.argument);
      if (node.operator === "-" && typeof argument === "number") {
        return -argument;
      }
      return null;
    }

    // 2. Support for Color3.fromRGB(r, g, b)
    case "CallExpression": {
      if (
        node.base?.type === "MemberExpression" &&
        node.base?.base?.type === "Identifier" &&
        node.base?.base?.name === "Color3" &&
        node.base?.identifier?.type === "Identifier" &&
        node.base?.identifier?.name === "fromRGB"
      ) {
        const r = extractValue(node.arguments[0]);
        const g = extractValue(node.arguments[1]);
        const b = extractValue(node.arguments[2]);

        return { 1: r, 2: g, 3: b };
      }
      return null;
    }

    case "BinaryExpression": {
      const left = extractValue(node.left);
      const right = extractValue(node.right);
      if (typeof left === "number" && typeof right === "number") {
        switch (node.operator) {
          case "+":
            return left + right;
          case "-":
            return left - right;
          case "*":
            return left * right;
          case "/":
            return left / right;
          case "%":
            return left % right;
          case "^":
            return Math.pow(left, right);
        }
      }
      return null;
    }

    case "TableConstructorExpression":
      return extractTable(node);

    default:
      return null;
  }
}

function extractTable(tableNode: any): LuaTable {
  const obj: LuaTable = {};
  let arrayIndex = 1;

  for (let i = 0; i < tableNode.fields.length; i++) {
    const field = tableNode.fields[i];
    if (field.type === "TableKey") {
      const key = extractValue(field.key);
      obj[key as string | number] = extractValue(field.value);
    } else if (field.type === "TableKeyString") {
      obj[field.key.name] = extractValue(field.value);
    } else if (field.type === "TableValue") {
      // O(1) sequential Lua 1-based indexing instead of O(N^2) indexOf
      obj[arrayIndex++] = extractValue(field.value);
    }
  }

  return obj;
}

function extractDataFromAST(ast: any): Record<string, LuaValue> {
  const result: Record<string, LuaValue> = {};

  for (const statement of ast.body) {
    if (
      statement.type === "AssignmentStatement" ||
      statement.type === "LocalStatement"
    ) {
      const variable = statement.variables[0];
      const initValue = extractValue(statement.init[0]);

      if (variable.type === "Identifier") {
        result[variable.name] = initValue;
      } else if (variable.type === "MemberExpression") {
        const baseName = variable.base.name;
        const key = variable.identifier.name;

        if (result[baseName] && typeof result[baseName] === "object") {
          (result[baseName] as LuaTable)[key] = initValue;
        }
      } else if (variable.type === "IndexExpression") {
        const baseName = variable.base.name;
        const key = extractValue(variable.index);

        if (
          result[baseName] &&
          typeof result[baseName] === "object" &&
          key !== null
        ) {
          (result[baseName] as LuaTable)[key as string | number] = initValue;
        }
      }
    }
  }

  return result;
}

export async function getFandomData(_baseUrl = "") {
  const allModules = await loadAllModules();
  const extractedData: Record<string, Record<string, LuaValue>> = {};

  for (const [name, source] of Object.entries(allModules)) {
    try {
      const ast = luaparse.parse(source);
      extractedData[name] = extractDataFromAST(ast);
    } catch (error) {
      console.error(`Error parsing ${name}:`, error);
    }
  }

  return extractedData;
}
