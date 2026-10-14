import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const skillRoot = path.resolve(ROOT, "skills", "igapyon-miku-prompt-lint");
const fixturePath = path.resolve(ROOT, "tests", "fixtures", "rule-calibration.json");
const manualFixturePaths = [
  path.resolve(ROOT, "tests", "fixtures", "rule-calibration", "manual-semantic-gate.json"),
  path.resolve(ROOT, "tests", "fixtures", "rule-calibration", "ownership-precedence.json")
];
const baselinePath = path.resolve(ROOT, "tests", "fixtures", "rule-calibration-baseline.json");

test("calibration cases have concrete evidence, sound dispositions, and positive/counterexample coverage", () => {
  const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  assert.equal(fixture.schemaVersion, 2);
  validateFixture(fixture, { requireUniqueIds: true });
  const active = activeRuleIds();
  assert.equal(active.size, 46, "update this explicit contract when the active Rule set changes");
  assert.deepEqual(Object.fromEntries([...active.values()].reduce((counts, level) => {
    counts.set(level, (counts.get(level) ?? 0) + 1);
    return counts;
  }, new Map())), {
    Prompt: 17,
    Context: 11,
    "Agent Skill": 12,
    "Repository/Harness": 6
  });

  const positives = new Set();
  const counterexamples = new Set();
  for (const item of fixture.cases) {
    for (const finding of item.expectedFindings) positives.add(finding.rule);
    for (const id of item.expectedNotApplicable) counterexamples.add(id);
  }
  for (const id of activeRuleIds().keys()) {
    assert.ok(positives.has(id), `missing positive calibration: ${id}`);
    assert.ok(counterexamples.has(id), `missing explicit counterexample: ${id}`);
  }
  assert.ok(fixture.cases.some((item) => item.id === "boundary-validation-versus-evidence"),
    "missing validation/evaluation ownership boundary fixture");
});

test("manual semantic fixtures and historical baseline retain their v1 contracts", () => {
  const fixtures = manualFixturePaths.map((file) => JSON.parse(fs.readFileSync(file, "utf8")));
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  assert.equal(baseline.schemaVersion, 1);
  assert.ok(["partial-pass", "complete-pass"].includes(baseline.gateStatus));
  const caseIds = new Set();
  for (const fixture of fixtures) {
    assert.equal(fixture.schemaVersion, 1);
    validateFixture(fixture, { requireUniqueIds: false });
    for (const item of fixture.cases) {
      assert.equal(caseIds.has(item.id), false, `duplicate fixture case: ${item.id}`);
      caseIds.add(item.id);
    }
  }
  assert.equal(baseline.results.length, JSON.parse(fs.readFileSync(manualFixturePaths[0], "utf8")).cases.length,
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

test("invalid calibration inputs are rejected", () => {
  const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  const validCase = fixture.cases[0];
  const cases = [
    { ...validCase, expectedNotApplicable: [validCase.expectedFindings[0].rule] },
    { ...validCase, expectedFindings: [{ ...validCase.expectedFindings[0], evidenceContains: "absent evidence" }] },
    { ...validCase, expectedFindings: [{ ...validCase.expectedFindings[0], rule: "prompt/inactive-rule" }] },
    { ...validCase, level: "Context" },
    { ...validCase, targetContext: undefined },
    { ...validCase, rationale: undefined },
    { ...validCase, expectedSuppressed: undefined }
  ];
  for (const invalid of cases) {
    assert.throws(() => validateFixture({ schemaVersion: 2, cases: [invalid] }, { requireUniqueIds: true }));
  }
  assert.throws(() => validateFixture({ schemaVersion: 2, cases: [validCase, { ...validCase }] }, { requireUniqueIds: true }));

  const missingPositive = structuredClone(fixture);
  missingPositive.cases = missingPositive.cases.filter((item) => !item.expectedFindings.some((entry) => entry.rule === "prompt/role-inflation"));
  assert.throws(() => validateCoverage(missingPositive));
  const missingCounterexample = structuredClone(fixture);
  missingCounterexample.cases = missingCounterexample.cases.map((item) => ({
    ...item,
    expectedNotApplicable: item.expectedNotApplicable.filter((id) => id !== "prompt/role-inflation"),
    expectedNotAssessed: item.id === "counterexample-prompt-role-inflation"
      ? [...item.expectedNotAssessed, "prompt/role-inflation"]
      : item.expectedNotAssessed
  }));
  assert.throws(() => validateCoverage(missingCounterexample));
});

function validateFixture(fixture, { requireUniqueIds }) {
  assert.ok(Array.isArray(fixture.cases) && fixture.cases.length > 0);
  const rules = activeRuleIds();
  const ids = new Set();
  for (const item of fixture.cases) {
    assert.match(item.id, /^[a-z0-9-]+$/);
    if (requireUniqueIds) {
      assert.equal(ids.has(item.id), false, `duplicate case ID: ${item.id}`);
      ids.add(item.id);
    }
    assert.ok(rulesHasLevel(rules, item.level), `invalid Level: ${item.level}`);
    assert.ok(typeof item.artifact === "string" && item.artifact.trim().length > 0, `${item.id} lacks raw artifact`);
    assert.equal(typeof item.targetContext?.model, "string", `${item.id} lacks target model`);
    assert.equal(typeof item.targetContext?.runtime, "string", `${item.id} lacks target runtime`);
    assert.ok(typeof item.rationale === "string" && item.rationale.trim().length > 0, `${item.id} lacks rationale`);
    for (const field of ["expectedFindings", "expectedNotApplicable", "expectedNotAssessed", "expectedSuppressed"]) {
      assert.ok(Array.isArray(item[field]), `${item.id} lacks ${field}`);
    }
    const dispositions = [
      ...item.expectedFindings.map(({ rule }) => rule),
      ...item.expectedNotApplicable,
      ...item.expectedNotAssessed,
      ...item.expectedSuppressed
    ];
    assert.equal(new Set(dispositions).size, dispositions.length, `${item.id} has overlapping or duplicate dispositions`);
    for (const finding of item.expectedFindings) {
      assert.ok(finding && typeof finding.rule === "string" && typeof finding.evidenceContains === "string",
        `${item.id} has malformed expected finding`);
      assert.ok(rules.has(finding.rule), `${item.id} uses inactive Rule ${finding.rule}`);
      assert.equal(rules.get(finding.rule), item.level, `${item.id} finding has wrong owning Level: ${finding.rule}`);
      assert.ok(finding.evidenceContains.trim(), `${item.id} finding has empty evidence`);
      assert.ok(item.artifact.includes(finding.evidenceContains), `${item.id} evidence is absent from raw artifact`);
    }
    for (const id of [...item.expectedNotApplicable, ...item.expectedNotAssessed, ...item.expectedSuppressed]) {
      assert.ok(rules.has(id), `${item.id} uses inactive expected Rule ${id}`);
    }
  }
}

function rulesHasLevel(rules, level) {
  return [...rules.values()].includes(level);
}

function validateCoverage(fixture) {
  const positives = new Set(fixture.cases.flatMap((item) => item.expectedFindings.map(({ rule }) => rule)));
  const counterexamples = new Set(fixture.cases.flatMap((item) => item.expectedNotApplicable));
  for (const id of activeRuleIds().keys()) {
    assert.ok(positives.has(id), `missing positive calibration: ${id}`);
    assert.ok(counterexamples.has(id), `missing explicit counterexample: ${id}`);
  }
}

function activeRuleIds() {
  const files = ["prompt", "context", "agent-skills", "repository"];
  const levels = { prompt: "Prompt", context: "Context", "agent-skill": "Agent Skill", repository: "Repository/Harness" };
  const ids = new Map();
  for (const section of files) {
    const text = fs.readFileSync(path.resolve(skillRoot, "references", section, "anti-patterns.md"), "utf8");
    for (const match of text.matchAll(/^## ((?:prompt|context|agent-skill|repository)\/[a-z0-9-]+)$/gm)) {
      ids.set(match[1], levels[match[1].split("/")[0]]);
    }
  }
  return ids;
}
