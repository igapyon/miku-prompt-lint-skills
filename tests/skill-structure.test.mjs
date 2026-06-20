import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";

const ROOT = process.cwd();
const skillRoot = path.resolve(ROOT, "skills", "igapyon-miku-prompt-lint");

test("skill index is generated and current", () => {
  const before = fs.readFileSync(path.resolve(skillRoot, "index.json"), "utf8");
  execFileSync("npm", ["run", "generate:index"], {
    cwd: ROOT,
    encoding: "utf8"
  });
  const after = fs.readFileSync(path.resolve(skillRoot, "index.json"), "utf8");
  assert.equal(after, before);

  const index = JSON.parse(after);
  const paths = index.files.map((entry) => entry.path);
  assert.ok(paths.includes("SKILL.md"));
  assert.ok(paths.includes("references/prompt/INDEX.md"));
  assert.ok(paths.includes("references/prompt/anti-patterns.md"));
  assert.ok(paths.includes("references/prompt/checkpoints.md"));
  assert.ok(paths.includes("references/prompt/rewrite-patterns.md"));
  assert.ok(paths.includes("references/review-levels.md"));
  assert.ok(paths.includes("references/context/INDEX.md"));
  assert.ok(paths.includes("references/context/anti-patterns.md"));
  assert.ok(paths.includes("references/context/checkpoints.md"));
  assert.ok(paths.includes("references/agent-skills/INDEX.md"));
  assert.ok(paths.includes("references/agent-skills/anti-patterns.md"));
  assert.ok(paths.includes("references/agent-skills/checkpoints.md"));
  assert.ok(paths.includes("references/output-format.md"));
  assert.ok(paths.includes("references/template-selection/INDEX.md"));
  assert.ok(paths.includes("references/template-selection/workflow.md"));
  assert.ok(paths.includes("references/template-selection/skeleton-types.md"));
  assert.ok(paths.includes("references/template-selection/handoff.md"));
  assert.ok(paths.includes("templates/review-report.md"));
  assert.ok(paths.includes("templates/revised-context-structure.md"));
  assert.ok(paths.includes("templates/revised-agent-skill-structure.md"));
  assert.ok(paths.includes("templates/prompt-skeletons/basic.md"));
  assert.ok(paths.includes("templates/prompt-skeletons/template-first.md"));
  assert.ok(paths.includes("templates/prompt-skeletons/reviewer.md"));
  assert.ok(paths.includes("templates/prompt-skeletons/few-shot.md"));
  assert.ok(paths.includes("templates/prompt-skeletons/agent-workflow.md"));
  assert.ok(paths.includes("templates/prompt-skeletons/ipo.md"));
  assert.ok(paths.includes("examples/legacy-role-cot.md"));
  assert.ok(paths.includes("examples/ambiguous-output.md"));
  assert.ok(paths.includes("examples/agent-skill-bloat.md"));
  assert.ok(paths.includes("examples/context-navigation.md"));
});

test("skill frontmatter contains required fields only", () => {
  const skillMd = fs.readFileSync(path.resolve(skillRoot, "SKILL.md"), "utf8");
  const match = skillMd.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, "missing YAML frontmatter");

  const keys = match[1].split(/\n/).map((line) => line.split(":")[0]);
  assert.deepEqual(keys, ["name", "description"]);
  assert.match(match[1], /^name: igapyon-miku-prompt-lint$/m);
  assert.match(match[1], /^description: .+/m);
});
