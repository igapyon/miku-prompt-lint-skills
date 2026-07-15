import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const skillRoot = path.resolve(ROOT, "skills", "igapyon-miku-prompt-lint");
const fixturePath = path.resolve(ROOT, "tests", "fixtures", "rule-calibration.json");
const manualFixturePath = path.resolve(ROOT, "tests", "fixtures", "rule-calibration", "manual-semantic-gate.json");
const ownershipFixturePath = path.resolve(ROOT, "tests", "fixtures", "rule-calibration", "ownership-precedence.json");
const baselinePath = path.resolve(ROOT, "tests", "fixtures", "rule-calibration-baseline.json");

test("machine-readable calibration fixtures cover each active Rule positively and negatively", () => {
  const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  assert.equal(fixture.schemaVersion, 1);
  assert.ok(Array.isArray(fixture.cases) && fixture.cases.length > 0);
  const positives = new Set();
  const negatives = new Set();
  for (const item of fixture.cases) {
    assert.match(item.id, /^[a-z0-9-]+$/);
    assert.ok(["Prompt", "Context", "Agent Skill", "Repository/Harness"].includes(item.level));
    assert.ok(item.artifact.length > 20);
    for (const id of item.expectedFindings) positives.add(id);
    for (const id of item.expectedNotApplicable) negatives.add(id);
  }
  for (const id of activeRuleIds()) {
    assert.ok(positives.has(id), `missing positive calibration: ${id}`);
    assert.ok(negatives.has(id), `missing non-applicable calibration: ${id}`);
  }
  assert.ok(fixture.cases.some((item) => item.id === "boundary-validation-versus-evidence"), "missing ownership boundary fixture");
});

test("manual semantic fixture and baseline records use the reviewable contract", () => {
  const fixtures = [manualFixturePath, ownershipFixturePath].map((file) => JSON.parse(fs.readFileSync(file, "utf8")));
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  assert.equal(baseline.schemaVersion, 1);
  assert.ok(["partial-pass", "complete-pass"].includes(baseline.gateStatus));
  const caseIds = new Set();
  for (const fixture of fixtures) {
    assert.equal(fixture.schemaVersion, 1);
    for (const item of fixture.cases) {
    assert.equal(caseIds.has(item.id), false, `duplicate fixture case: ${item.id}`);
    caseIds.add(item.id);
    assert.ok(item.targetContext?.model && item.targetContext?.runtime, `${item.id} lacks target context`);
    assert.ok(item.rationale, `${item.id} lacks rationale`);
    for (const finding of item.expectedFindings) {
      assert.ok(activeRuleIds().has(finding.rule), `${item.id} uses inactive Rule ${finding.rule}`);
      assert.ok(item.artifact.includes(finding.evidenceContains), `${item.id} evidence is absent from raw artifact`);
    }
      for (const id of [...item.expectedNotApplicable, ...item.expectedNotAssessed, ...item.expectedSuppressed]) {
        assert.ok(activeRuleIds().has(id), `${item.id} uses inactive expected Rule ${id}`);
      }
    }
  }
  assert.equal(baseline.results.length, JSON.parse(fs.readFileSync(manualFixturePath, "utf8")).cases.length,
    "baseline must cover every executed manual case");
  for (const result of baseline.results) {
    assert.ok(caseIds.has(result.fixtureCaseId), `unknown baseline case: ${result.fixtureCaseId}`);
    assert.ok(["pass", "accepted-exception", "fail"].includes(result.status));
    assert.notEqual(result.status, "fail", `unresolved semantic failure: ${result.fixtureCaseId}`);
    for (const id of [...result.expectedRuleIds, ...result.actualRuleIds]) {
      assert.ok(activeRuleIds().has(id), `baseline uses inactive Rule ${id}`);
    }
  }
});

function activeRuleIds() {
  const files = ["prompt", "context", "agent-skills", "repository"];
  const ids = new Set();
  for (const section of files) {
    const text = fs.readFileSync(path.resolve(skillRoot, "references", section, "anti-patterns.md"), "utf8");
    for (const match of text.matchAll(/^## ((?:prompt|context|agent-skill|repository)\/[a-z0-9-]+)$/gm)) ids.add(match[1]);
  }
  return ids;
}
