import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const skillRoot = path.resolve(ROOT, "skills", "igapyon-miku-prompt-lint");
const migrationsPath = path.resolve(skillRoot, "references", "rule-migrations.json");
const ruleFiles = [
  "references/prompt/anti-patterns.md",
  "references/context/anti-patterns.md",
  "references/agent-skills/anti-patterns.md",
  "references/repository/anti-patterns.md"
];

test("rule migrations are complete and resolve only to active canonical IDs", () => {
  const migrations = JSON.parse(fs.readFileSync(migrationsPath, "utf8"));
  assert.equal(migrations.schemaVersion, 1);
  assert.ok(Array.isArray(migrations.migrations) && migrations.migrations.length > 0);
  const active = activeRuleIds();
  const legacy = new Set();
  for (const entry of migrations.migrations) {
    assert.match(entry.legacyId, /^(prompt|context|agent-skill|repository)\/[a-z0-9-]+$/);
    assert.equal(legacy.has(entry.legacyId), false, `duplicate migration: ${entry.legacyId}`);
    legacy.add(entry.legacyId);
    assert.ok(["retired", "alias", "split"].includes(entry.disposition), `invalid disposition: ${entry.legacyId}`);
    assert.ok(Array.isArray(entry.canonicalIds));
    if (entry.disposition === "retired") assert.equal(entry.canonicalIds.length, 0, `${entry.legacyId} must not map`);
    else assert.ok(entry.canonicalIds.length > 0, `${entry.legacyId} must map to an active rule`);
    for (const id of entry.canonicalIds) assert.ok(active.has(id), `${entry.legacyId} maps to inactive ${id}`);
  }
});

test("legacy Rule IDs occur only in the migration map", () => {
  const migrations = JSON.parse(fs.readFileSync(migrationsPath, "utf8"));
  const legacy = migrations.migrations.map((entry) => entry.legacyId);
  for (const file of filesUnder(skillRoot)) {
    if (file === migrationsPath || !file.endsWith(".md")) continue;
    const text = fs.readFileSync(file, "utf8");
    for (const id of legacy) assert.equal(text.includes(id), false, `${relative(file)} retains legacy Rule ID ${id}`);
  }
});

function activeRuleIds() {
  const ids = new Set();
  for (const file of ruleFiles) {
    const text = fs.readFileSync(path.resolve(skillRoot, file), "utf8");
    for (const match of text.matchAll(/^## ((?:prompt|context|agent-skill|repository)\/[a-z0-9-]+)$/gm)) ids.add(match[1]);
  }
  return ids;
}

function filesUnder(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(file) : [file];
  });
}

function relative(file) {
  return path.relative(ROOT, file);
}
