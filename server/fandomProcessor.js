// fandomProcessor.js

import luaparse from 'luaparse';

const fandomModules = {
  Lawnames: "Lawnames",
  Flagdata: "Flagdata",
  Nationdata: "Nationdata",
  Tagdata: "Tagdata"
}

/**
 * Fetches the preferred image URL from Fandom via your Cloudflare Workers proxy
 * @param {string} filename - The filename (e.g., "Afghanistan_Flag.png")
 * @returns {Promise<string>} The preferred image URL
 */
export async function getFandomImageUrl(filename, baseUrl = '', signal) {
  try {
    // Call the Cloudflare Workers endpoint
    const response = await fetch(
      `${baseUrl}/api/fandom-image?filename=${encodeURIComponent(filename)}`,
      { signal }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch image data: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return `/api/fandom-image?proxy=true&url=${encodeURIComponent(data.url)}`;
  } catch (error) {
    console.error(`Error fetching Fandom image URL for ${filename}:`, error);
    throw error;
  }
}

// fetch lua modules directly from fandom
async function loadAllModules(baseUrl) {
  const modulePromises = Object.entries(fandomModules).map(async ([name, moduleName]) => {
    const url = `${baseUrl}/api/fandom-module?module=${encodeURIComponent(moduleName)}&wiki=ronroblox`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`fandom-module returned ${response.status}`);
      }

      const data = await response.json();
      return [name, data.source];
    } catch (error) {
      console.error(`Error fetching ${name}:`, error);
      throw error;
    }
  });

  const moduleEntries = await Promise.all(modulePromises);
  return Object.fromEntries(moduleEntries);
}

// Recursively extract values from AST nodes
async function extractValue(node) {
  if (!node) return null;

  switch (node.type) {
    case 'StringLiteral':
      // Handle both value and raw (quoted string)
      let stringValue = null;
      if (node.value !== null) stringValue = node.value;
      else if (node.raw) {
        stringValue = node.raw.slice(1, -1);
      }
      return stringValue;

    case 'NumericLiteral':
      return node.value;

    case 'BooleanLiteral':
      return node.value;

    case 'NilLiteral':
      return null;

    case 'BinaryExpression':
      const left = await extractValue(node.left);
      const right = await extractValue(node.right);

      if (typeof left === 'number' && typeof right === 'number') {
        switch (node.operator) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/': return left / right;
          case '%': return left % right;
          case '^': return Math.pow(left, right);
          default: return null;
        }
      }
      return null;

    case 'TableConstructorExpression':
      return await extractTable(node);

    default:
      return null;
  }
}

// Convert table constructor to JS object/array
async function extractTable(tableNode) {
  const obj = {};

  for (const field of tableNode.fields) {
    let key, value;

    if (field.type === 'TableKey') {
      key = await extractValue(field.key);
      value = await extractValue(field.value);
      obj[key] = value;
    } else if (field.type === 'TableKeyString') {
      key = field.key.name;
      value = await extractValue(field.value);
      obj[key] = value;
    } else if (field.type === 'TableValue') {
      obj[tableNode.fields.indexOf(field) + 1] = await extractValue(field.value);
    }
  }

  return obj;
}

// Export the extracted data
export async function getFandomData(baseUrl = '') {
  const allModules = await loadAllModules(baseUrl);
  const extractedData = {};

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

// Function to convert Lua AST to usable data
async function extractDataFromAST(ast) {
  const result = {};

  for (const statement of ast.body) {
    if (statement.type === 'AssignmentStatement' || statement.type === 'LocalStatement') {
      const varName = statement.variables[0].name;
      const value = await extractValue(statement.init[0]);
      result[varName] = value;
    }
  }

  return result;
}
