import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";

const ROOT = process.cwd();
const repoName = "miku-prompt-lint";
const skillName = "igapyon-miku-prompt-lint";
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(ROOT, "package.json"), "utf8")
);
const zipPath = path.resolve(ROOT, `bundle/igapyon-${repoName}-${packageJson.version}.zip`);

test("release zip contains installable skill files and excludes development-only files", () => {
  execFileSync("npm", ["run", "build:bundle:zip"], {
    cwd: ROOT,
    encoding: "utf8"
  });

  assert.equal(fs.existsSync(zipPath), true);

  const entries = execFileSync("unzip", ["-Z1", zipPath], {
    cwd: ROOT,
    encoding: "utf8"
  }).trim().split(/\n/).filter(Boolean);

  assertIncludes(entries, `skills/${skillName}/SKILL.md`);
  assertIncludes(entries, `skills/${skillName}/index.json`);
  assertIncludes(entries, `skills/${skillName}/references/prompt/anti-patterns.md`);
  assertIncludes(entries, `skills/${skillName}/references/prompt/checkpoints.md`);
  assertIncludes(entries, `skills/${skillName}/references/prompt/rewrite-patterns.md`);
  assertIncludes(entries, `skills/${skillName}/references/context/anti-patterns.md`);
  assertIncludes(entries, `skills/${skillName}/references/context/checkpoints.md`);
  assertIncludes(entries, `skills/${skillName}/references/agent-skills/anti-patterns.md`);
  assertIncludes(entries, `skills/${skillName}/references/agent-skills/checkpoints.md`);
  assertIncludes(entries, `skills/${skillName}/references/output-format.md`);
  assertIncludes(entries, `skills/${skillName}/templates/review-report.md`);
  assertIncludes(entries, `skills/${skillName}/templates/revised-context-structure.md`);
  assertIncludes(entries, `skills/${skillName}/templates/revised-agent-skill-structure.md`);
  assertIncludes(entries, `skills/${skillName}/examples/legacy-role-cot.md`);
  assertIncludes(entries, `skills/${skillName}/examples/context-navigation.md`);

  assert.equal(entries.some((entry) => entry.includes(".DS_Store")), false);
  assert.equal(entries.some((entry) => entry.startsWith("tests/")), false);
  assert.equal(entries.some((entry) => entry.startsWith("docs/")), false);
  assert.equal(entries.some((entry) => entry.startsWith("bundle/")), false);
  assert.equal(entries.some((entry) => entry.includes("node_modules/")), false);
  assert.equal(entries.some((entry) => entry.startsWith("workplace/")), false);
});

function assertIncludes(entries, expected) {
  assert.ok(entries.includes(expected), `missing zip entry: ${expected}`);
}
