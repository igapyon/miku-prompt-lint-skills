import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";

const ROOT = process.cwd();
const skillRoot = path.resolve(ROOT, "skills", "igapyon-miku-prompt-lint");
const packageJson = JSON.parse(fs.readFileSync(path.resolve(ROOT, "package.json"), "utf8"));
const indexConfig = packageJson.mikuIndex;

test("miku-indexgen verification follows the declared conditional index contract", () => {
  assert.ok(indexConfig?.path, "package.json must declare mikuIndex.path");
  assert.equal(typeof indexConfig.required, "boolean", "package.json must declare mikuIndex.required");
  execFileSync("npm", ["run", "check:index"], { cwd: ROOT, encoding: "utf8" });
  const indexPath = path.resolve(ROOT, indexConfig.path);
  if (!fs.existsSync(indexPath)) {
    assert.equal(indexConfig.required, false, "a missing index can only be optional");
    return;
  }
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  assert.equal(index.generator, "miku-indexgen");
  assert.equal(index.generation?.schemaVersion, 1);
  assert.deepEqual(index.generation?.includeExtensions, ["md", "mjs", "json", "yaml"]);
  const paths = index.files.map((entry) => entry.path);
  for (const requiredPath of [
    "SKILL.md", "references/rule-contract.md", "references/rule-migrations.json", "references/repository/INDEX.md",
    "references/repository/checkpoints.md", "references/repository/anti-patterns.md", "references/output-format.md",
    "templates/review-report.md", "examples/repository-harness-race.md"
  ]) assert.ok(paths.includes(requiredPath), `index lacks ${requiredPath}`);
});

test("skill frontmatter contains required fields only", () => {
  const skillMd = fs.readFileSync(path.resolve(skillRoot, "SKILL.md"), "utf8");
  const match = skillMd.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, "missing YAML frontmatter");
  const keys = match[1].split(/\n/).map((line) => line.split(":")[0]);
  assert.deepEqual(keys, ["name", "description"]);
  assert.match(match[1], /^name: igapyon-miku-prompt-lint$/m);
  assert.match(match[1], /^description: .+/m);
  assert.match(match[1], /LLM prompt|AI-agent context package|Agent Skill/);
  assert.match(match[1], /Do not activate for generic code review/);
});
