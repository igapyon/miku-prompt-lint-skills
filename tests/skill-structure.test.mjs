import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const skillRoot = path.resolve(ROOT, "skills", "igapyon-miku-prompt-lint");
const packageJson = JSON.parse(fs.readFileSync(path.resolve(ROOT, "package.json"), "utf8"));

test("skill package does not require a generated root index", () => {
  assert.equal(Object.hasOwn(packageJson, "mikuIndex"), false);
  assert.equal(fs.existsSync(path.resolve(skillRoot, "index.json")), false);
  const skill = fs.readFileSync(path.resolve(skillRoot, "SKILL.md"), "utf8");
  assert.doesNotMatch(skill, /read it for discovery/);
});

test("required review materials exist independently of an inventory", () => {
  for (const relative of [
    "SKILL.md", "references/rule-contract.md", "references/rule-migrations.json",
    "references/repository/INDEX.md", "references/repository/checkpoints.md",
    "references/repository/anti-patterns.md", "references/output-format.md",
    "templates/review-report.md", "examples/repository-harness-race.md"
  ]) {
    assert.ok(fs.statSync(path.resolve(skillRoot, relative)).isFile(),
      `missing required review material: ${relative}`);
  }
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
