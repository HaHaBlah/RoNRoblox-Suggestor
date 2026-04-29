// server/utils/fandomProcessor.ts
import luaparse from "luaparse";

const fandomModules: Record<string, string> = {
  Lawnames: "Lawnames",
  Flagdata: "Flagdata",
  Nationdata: "Nationdata",
  Tagdata: "Tagdata",
};

export async function getFandomImageUrl(filename: string, baseUrl = "") {
  const data = await $fetch<{ url: string; error?: string }>(
    `${baseUrl}/api/fandom-image?filename=${encodeURIComponent(filename)}`,
  );
  if (data.error) throw new Error(data.error);
  return `/api/fandom-image?proxy=true&url=${encodeURIComponent(data.url)}`;
}

async function loadAllModules(baseUrl: string) {
  const modulePromises = Object.entries(fandomModules).map(
    async ([name, moduleName]) => {
      const data = await $fetch<{ source: string }>(
        `${baseUrl}/api/fandom-module?module=${encodeURIComponent(moduleName)}`,
      );
      return [name, data.source] as const;
    },
  );

  return Object.fromEntries(await Promise.all(modulePromises));
}

type LuaValue = string | number | boolean | null | LuaTable;
type LuaTable = { [key: string | number]: LuaValue };

async function extractValue(node: any): Promise<LuaValue> {
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

    case "BinaryExpression": {
      const left = await extractValue(node.left);
      const right = await extractValue(node.right);
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
      return await extractTable(node);

    default:
      return null;
  }
}

async function extractTable(tableNode: any): Promise<LuaTable> {
  const obj: LuaTable = {};

  for (const field of tableNode.fields) {
    if (field.type === "TableKey") {
      const key = await extractValue(field.key);
      obj[key as string | number] = await extractValue(field.value);
    } else if (field.type === "TableKeyString") {
      obj[field.key.name] = await extractValue(field.value);
    } else if (field.type === "TableValue") {
      obj[tableNode.fields.indexOf(field) + 1] = await extractValue(
        field.value,
      );
    }
  }

  return obj;
}

async function extractDataFromAST(ast: any): Promise<Record<string, LuaValue>> {
  const result: Record<string, LuaValue> = {};

  for (const statement of ast.body) {
    if (
      statement.type === "AssignmentStatement" ||
      statement.type === "LocalStatement"
    ) {
      const varName = statement.variables[0].name;
      result[varName] = await extractValue(statement.init[0]);
    }
  }

  return result;
}

export async function getFandomData(baseUrl = "") {
  const allModules = await loadAllModules(baseUrl);
  const extractedData: Record<string, Record<string, LuaValue>> = {};

  for (const [name, source] of Object.entries(allModules)) {
    try {
      const ast = luaparse.parse(source);
      extractedData[name] = await extractDataFromAST(ast);
    } catch (error) {
      console.error(`Error parsing ${name}:`, error);
    }
  }

  return extractedData;
}
