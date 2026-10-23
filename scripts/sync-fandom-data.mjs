// scripts/sync-fandom-data.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import luaparse from "luaparse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "server", "data");
const targetFile = path.join(dataDir, "fandom-data.json");
const publicDataDir = path.join(projectRoot, "public", "data");
const publicTargetFile = path.join(publicDataDir, "fandom-data.json");

const fandomModules = {
  Lawnames: "Lawnames",
  Flagdata: "Flagdata",
  Nationdata: "Nationdata",
  Tagdata: "Tagdata",
  Modifierdata: "Modifierdata",
  ModifierEffectsdata: "ModifierEffectsdata",
};

function extractValueSync(node) {
  if (!node) return null;
  switch (node.type) {
    case "StringLiteral":
      if (node.value !== null) return node.value;
      if (node.raw) return node.raw.slice(1, -1);
      return null;
    case "NumericLiteral":
    case "BooleanLiteral":
      return node.value;
    case "NilLiteral":
      return null;
    case "UnaryExpression": {
      const argument = extractValueSync(node.argument);
      if (node.operator === "-" && typeof argument === "number") return -argument;
      return null;
    }
    case "CallExpression": {
      if (
        node.base?.type === "MemberExpression" &&
        node.base?.base?.name === "Color3" &&
        node.base?.identifier?.name === "fromRGB"
      ) {
        const r = extractValueSync(node.arguments[0]);
        const g = extractValueSync(node.arguments[1]);
        const b = extractValueSync(node.arguments[2]);
        return { 1: r, 2: g, 3: b };
      }
      return null;
    }
    case "BinaryExpression": {
      const left = extractValueSync(node.left);
      const right = extractValueSync(node.right);
      if (typeof left === "number" && typeof right === "number") {
        switch (node.operator) {
          case "+": return left + right;
          case "-": return left - right;
          case "*": return left * right;
          case "/": return left / right;
          case "%": return left % right;
          case "^": return Math.pow(left, right);
        }
      }
      return null;
    }
    case "TableConstructorExpression":
      return extractTableSync(node);
    default:
      return null;
  }
}

function extractTableSync(tableNode) {
  const obj = {};
  let arrayIndex = 1;
  for (let i = 0; i < tableNode.fields.length; i++) {
    const field = tableNode.fields[i];
    if (field.type === "TableKey") {
      const key = extractValueSync(field.key);
      obj[key] = extractValueSync(field.value);
    } else if (field.type === "TableKeyString") {
      obj[field.key.name] = extractValueSync(field.value);
    } else if (field.type === "TableValue") {
      obj[arrayIndex++] = extractValueSync(field.value);
    }
  }
  return obj;
}

function extractDataFromASTSync(ast) {
  const result = {};
  for (const statement of ast.body) {
    if (
      statement.type === "AssignmentStatement" ||
      statement.type === "LocalStatement"
    ) {
      const variable = statement.variables[0];
      const initValue = extractValueSync(statement.init[0]);
      if (variable.type === "Identifier") {
        result[variable.name] = initValue;
      } else if (variable.type === "MemberExpression") {
        const baseName = variable.base.name;
        const key = variable.identifier.name;
        if (result[baseName] && typeof result[baseName] === "object") {
          result[baseName][key] = initValue;
        }
      } else if (variable.type === "IndexExpression") {
        const baseName = variable.base.name;
        const key = extractValueSync(variable.index);
        if (
          result[baseName] &&
          typeof result[baseName] === "object" &&
          key !== null
        ) {
          result[baseName][key] = initValue;
        }
      }
    }
  }
  return result;
}

async function fetchModule(name) {
  const primaryUrl = `https://ronroblox.fandom.com/rest.php/v1/page/Module%3A${encodeURIComponent(name)}`;
  try {
    const res = await fetch(primaryUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.source) return data.source;
    throw new Error("No source field");
  } catch (err) {
    console.warn(`Primary API failed for Module:${name} (${err.message}), trying fallback...`);
    const fallbackUrl = `https://ronroblox.fandom.com/api.php?action=query&prop=revisions&titles=Module%3A${encodeURIComponent(name)}&rvslots=main&rvprop=content&format=json`;
    const res = await fetch(fallbackUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
    });
    const data = await res.json();
    const page = Object.values(data?.query?.pages || {})[0];
    const source = page?.revisions?.[0]?.slots?.main?.["*"];
    if (!source) throw new Error(`Could not fetch module ${name}`);
    return source;
  }
}

async function main() {
  console.log("Syncing Fandom Wiki Lua data...");
  try {
    const extracted = {};
    for (const [key, moduleName] of Object.entries(fandomModules)) {
      console.log(`- Fetching & parsing Module:${moduleName}...`);
      const src = await fetchModule(moduleName);
      const ast = luaparse.parse(src);
      extracted[key] = extractDataFromASTSync(ast);
    }

    const jsonString = JSON.stringify(extracted);
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(targetFile, jsonString);
    fs.mkdirSync(publicDataDir, { recursive: true });
    fs.writeFileSync(publicTargetFile, jsonString);
    console.log(`Successfully synced Fandom data to ${targetFile} and ${publicTargetFile} (${fs.statSync(targetFile).size} bytes).`);
  } catch (error) {
    if (fs.existsSync(targetFile)) {
      if (!fs.existsSync(publicTargetFile)) {
        fs.mkdirSync(publicDataDir, { recursive: true });
        fs.copyFileSync(targetFile, publicTargetFile);
      }
      console.warn(`Warning: Failed to sync latest Fandom data: ${error.message}`);
      console.warn(`Continuing build using existing ${targetFile}.`);
    } else {
      console.error(`Error: Failed to fetch Fandom data and no fallback exists:`, error);
      process.exit(1);
    }
  }
}

main();
