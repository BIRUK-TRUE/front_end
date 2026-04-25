const fs = require("fs");
const path = require("path");

const enPath = path.join(__dirname, "..", "messages", "en.json");
const amPath = path.join(__dirname, "..", "messages", "am.json");
const reportPath = path.join(__dirname, "..", "messages", "am-untranslated-keys.txt");

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function mergeWithFallback(base, override, parentPath = "", stats) {
  const result = {};
  const keys = new Set([...Object.keys(base || {}), ...Object.keys(override || {})]);

  for (const key of keys) {
    const currentPath = parentPath ? `${parentPath}.${key}` : key;
    const baseValue = base?.[key];
    const overrideValue = override?.[key];

    if (isObject(baseValue) || isObject(overrideValue)) {
      result[key] = mergeWithFallback(
        isObject(baseValue) ? baseValue : {},
        isObject(overrideValue) ? overrideValue : {},
        currentPath,
        stats
      );
      continue;
    }

    if (overrideValue === undefined) {
      result[key] = baseValue;
      stats.inserted.push(currentPath);
      stats.untranslated.push(currentPath);
      continue;
    }

    result[key] = overrideValue;
    if (typeof baseValue === "string" && typeof overrideValue === "string" && baseValue === overrideValue) {
      stats.untranslated.push(currentPath);
    }
  }

  return result;
}

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const am = JSON.parse(fs.readFileSync(amPath, "utf8"));

const stats = { inserted: [], untranslated: [] };
const merged = mergeWithFallback(en, am, "", stats);

fs.writeFileSync(amPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
fs.writeFileSync(reportPath, `${stats.untranslated.sort().join("\n")}\n`, "utf8");

console.log(`Inserted missing keys into am.json: ${stats.inserted.length}`);
console.log(`Untranslated or English-equal keys: ${stats.untranslated.length}`);
console.log(`Saved report: ${reportPath}`);
