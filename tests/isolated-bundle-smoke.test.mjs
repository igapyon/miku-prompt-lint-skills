import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const repoName = "miku-prompt-lint-skills";
const skillName = "igapyon-miku-prompt-lint";

test("existing bundle installs under the documented agent-home layout", () => {
  const sourceBundle = path.resolve(ROOT, "bundle", repoName);
  assert.equal(fs.existsSync(sourceBundle), true, "build the bundle before verification");
  const agentHome = fs.mkdtempSync(path.join(os.tmpdir(), `${repoName}-bundle-`));
  try {
    fs.cpSync(sourceBundle, agentHome, { recursive: true });
    const installedSkillRoot = path.resolve(agentHome, "skills", skillName);
    assert.equal(fs.existsSync(path.resolve(installedSkillRoot, "SKILL.md")), true);
    assert.equal(fs.existsSync(path.resolve(installedSkillRoot, "index.json")), true);
    assert.equal(fs.existsSync(path.resolve(agentHome, "skills", "skills", skillName, "SKILL.md")), false);
  } finally {
    fs.rmSync(agentHome, { recursive: true, force: true });
  }
});

test("bundle skill directory installs directly under the documented skills root", () => {
  const sourceSkill = path.resolve(ROOT, "bundle", repoName, "skills", skillName);
  assert.equal(fs.existsSync(sourceSkill), true, "build the bundle before verification");
  const agentHome = fs.mkdtempSync(path.join(os.tmpdir(), `${repoName}-skills-`));
  try {
    const skillsRoot = path.resolve(agentHome, "skills");
    fs.mkdirSync(skillsRoot, { recursive: true });
    fs.cpSync(sourceSkill, path.resolve(skillsRoot, skillName), { recursive: true });
    assert.equal(fs.existsSync(path.resolve(skillsRoot, skillName, "SKILL.md")), true);
    assert.equal(fs.existsSync(path.resolve(skillsRoot, "skills", skillName, "SKILL.md")), false);
  } finally {
    fs.rmSync(agentHome, { recursive: true, force: true });
  }
});
