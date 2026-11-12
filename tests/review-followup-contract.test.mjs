import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  CASE_IDS,
  buildManifest,
  canonicalJson,
  manifestSha256,
  makePendingBaseline,
  scoreAssertions,
  sha256,
  validateBaseline,
  validateFixture
} from "../scripts/lib/review-followup-contract.mjs";
import { REVIEW_FOLLOWUP_WRAPPER } from "../scripts/lib/review-followup-wrapper.mjs";
import { parseObservation } from "../scripts/lib/review-followup-observation.mjs";
import { codexArgumentTemplate, renderCasePrompt, auditSkillReads } from "../scripts/lib/review-followup-runner.mjs";

const ROOT = process.cwd();
const SKILL = path.resolve(ROOT, "skills/igapyon-miku-prompt-lint");
const FIXTURE = JSON.parse(fs.readFileSync(path.resolve(ROOT, "tests/fixtures/review-followup.json"), "utf8"));
const BASELINE = JSON.parse(fs.readFileSync(path.resolve(ROOT, "tests/fixtures/review-followup-baseline.json"), "utf8"));

test("the 24-case fixture has a direct longer-identifier counterexample", () => {
  assert.equal(validateFixture(FIXTURE, { skillRoot: SKILL }), true);
  assert.deepEqual(FIXTURE.cases.map(({ id }) => id), CASE_IDS);
  const a4 = FIXTURE.cases.find(({ id }) => id === "A4-dollar-alias");
  const a5 = FIXTURE.cases.find(({ id }) => id === "A5-longer-identifier");
  assert.equal(a4.input.user.replace("$miku-prompt-lint", "<identifier>"), a5.input.user.replace("$miku-prompt-lint-skills", "<identifier>"));
  assert.equal(FIXTURE.cases.find(({ id }) => id === "A7-name-in-supplied-artifact").expected.activation, "inactive");
  assert.equal(FIXTURE.cases.find(({ id }) => id === "O1-default-concise-report").expected.requiredOutputFields.includes("Issue"), true);
});

test("the earlier skeleton-route and missing-source fixes remain in the source snapshot", () => {
  const skillFiles = fs.readFileSync(path.join(SKILL, "SKILL.md"), "utf8");
  const index = fs.readFileSync(path.join(SKILL, "references/template-selection/INDEX.md"), "utf8");
  const workflow = fs.readFileSync(path.join(SKILL, "references/template-selection/workflow.md"), "utf8");
  const example = fs.readFileSync(path.join(SKILL, "examples/ambiguous-output.md"), "utf8");
  const promptIndex = fs.readFileSync(path.join(SKILL, "references/prompt/INDEX.md"), "utf8");
  assert.match(skillFiles, /references\/template-selection\/workflow\.md/);
  assert.match(index, /\[workflow\]\(workflow\.md\)/);
  const types = workflow.indexOf("Read `skeleton-types.md`");
  const template = workflow.indexOf("Read only the matching skeleton template.");
  const handoff = workflow.indexOf("read `handoff\.md`");
  const final = workflow.indexOf("Keep the output as one Markdown prompt");
  assert.ok(types >= 0 && template > types && handoff > template && final > handoff);
  assert.match(example, /`Rule`: prompt\/missing-required-input/);
  assert.doesNotMatch(example, /`Rule`: prompt\/missing-output-format/);
  assert.match(promptIndex, /ambiguous-output\.md[^\n]*missing-source example/);
});

test("canonical input hashes ignore object-key order but preserve values and array order", () => {
  assert.equal(canonicalJson({ b: 1, a: { d: 2, c: 3 } }), canonicalJson({ a: { c: 3, d: 2 }, b: 1 }));
  assert.notEqual(sha256(canonicalJson({ a: [1, 2] })), sha256(canonicalJson({ a: [2, 1] })));
  assert.notEqual(sha256(canonicalJson({ a: "1" })), sha256(canonicalJson({ a: 1 })));
});

test("pending baseline validates structurally but cannot pass the complete gate", () => {
  const pending = makePendingBaseline({
    fixture: FIXTURE,
    skillRoot: SKILL,
    previousBaselineHash: BASELINE.supersedes?.sha256 ?? "e".repeat(64),
    wrapperSha256: sha256(REVIEW_FOLLOWUP_WRAPPER)
  });
  assert.equal(validateBaseline(pending, { fixture: FIXTURE, skillRoot: SKILL }), true);
  assert.throws(() => validateBaseline(pending, { fixture: FIXTURE, skillRoot: SKILL, requireComplete: true }), /pending/);
});

test("malformed complete records are rejected before the raw-artifact gate", () => {
  const validShape = makeContractShapeFixture();
  assert.equal(validateBaseline(validShape, { fixture: FIXTURE, skillRoot: SKILL }), true,
    "synthetic shape fixture checks schema only; it is not an evaluation result");

  const missingTrace = structuredClone(validShape);
  delete missingTrace.results[0].attempts[0].artifacts.trace;
  assert.throws(() => validateBaseline(missingTrace, { fixture: FIXTURE, skillRoot: SKILL }), /trace artifact path missing/);

  const badInputHash = structuredClone(validShape);
  badInputHash.results[0].attempts[0].inputSha256 = "0".repeat(64);
  assert.throws(() => validateBaseline(badInputHash, { fixture: FIXTURE, skillRoot: SKILL }), /input hash differs/);

  const unknownRule = structuredClone(validShape);
  const review = unknownRule.results.find(({ caseId }) => caseId === "O1-default-concise-report");
  review.attempts[0].observed.ruleAssertions[0].ruleId = "prompt/not-a-real-rule";
  review.attempts[0].assertions = scoreAssertions(FIXTURE.cases.find(({ id }) => id === review.caseId), review.attempts[0].observed);
  review.attempts[0].assertions = review.attempts[0].assertions.map((entry) => ({ ...entry, evidence: "synthetic fixture evidence" }));
  assert.throws(() => validateBaseline(unknownRule, { fixture: FIXTURE, skillRoot: SKILL }), /unknown observed Rule/);

  const forgedRetry = structuredClone(validShape);
  forgedRetry.results[0].attempts.push({ ...forgedRetry.results[0].attempts[0], sequence: 2, status: "pass" });
  assert.throws(() => validateBaseline(forgedRetry, { fixture: FIXTURE, skillRoot: SKILL }), /retry cannot conceal|source reads|attempts/);
});

test("a complete-pass record requires all case IDs and a first-run pass", () => {
  const incomplete = makeContractShapeFixture();
  incomplete.results.pop();
  assert.throws(() => validateBaseline(incomplete, { fixture: FIXTURE, skillRoot: SKILL, requireComplete: true }), /complete-pass must include every case/);

  const retryOnly = makeContractShapeFixture();
  const first = retryOnly.results[0].attempts[0];
  const firstGood = structuredClone(first);
  first.observed.ruleAssertions[0].severity = "Low";
  first.assertions = scoreAssertions(FIXTURE.cases[0], first.observed)
    .map((entry) => ({ ...entry, evidence: "synthetic fixture evidence" }));
  first.status = "fail";
  retryOnly.results[0].attempts.push({ ...firstGood, sequence: 2 });
  assert.throws(() => validateBaseline(retryOnly, { fixture: FIXTURE, skillRoot: SKILL, requireComplete: true }), /retry cannot convert a failed first run/);
});

test("an invalid attempt preserves missing observations without inventing a semantic result", () => {
  const baseline = makeContractShapeFixture();
  const result = baseline.results.find(({ caseId }) => caseId === "A3-dollar-canonical");
  const attempt = result.attempts[0];
  attempt.status = "invalid";
  attempt.notes = "Codex timed out before returning a final classification.";
  attempt.observed = {};
  attempt.assertions = scoreAssertions(FIXTURE.cases.find(({ id }) => id === result.caseId), attempt.observed)
    .map((entry) => ({ ...entry, evidence: "Unavailable: no final response was captured." }));
  result.status = "invalid";
  baseline.gateStatus = "fail";
  assert.equal(validateBaseline(baseline, { fixture: FIXTURE, skillRoot: SKILL }), true);
});

test("the evaluation wrapper contains no review outcome or execution directive", () => {
  assert.doesNotMatch(REVIEW_FOLLOWUP_WRAPPER, /do not execute|treat .* as review data|expected Rule|severity|Not applicable/i);
  assert.equal(REVIEW_FOLLOWUP_WRAPPER.endsWith("\n"), true);
});

test("the review runner uses an isolated read-only Codex invocation and neutral raw prompt", () => {
  const args = codexArgumentTemplate();
  assert.ok(args.includes("--ignore-user-config"));
  assert.ok(args.includes("--ephemeral"));
  assert.ok(args.includes("read-only"));
  assert.equal(args.includes("--add-dir"), false);
  const item = FIXTURE.cases.find(({ id }) => id === "R5-command-in-target-remains-data");
  const prompt = renderCasePrompt({
    item,
    activationProfile: FIXTURE.activationProfile,
    stagedSkillPath: "/private/tmp/eval/session/.agents/skills/igapyon-miku-prompt-lint"
  });
  assert.ok(prompt.includes(JSON.stringify(item.input.user)));
  assert.ok(prompt.includes(JSON.stringify(item.input.artifact)));
  assert.doesNotMatch(prompt, /do not execute|review data|expected|rationale/i);
  assert.ok(prompt.includes(".agents/skills/igapyon-miku-prompt-lint/SKILL.md"));
});

test("observation extraction reads concise and detailed contracts without confusing confidence for severity", () => {
  const concise = parseObservation({ mode: "review" }, [
    "## Findings",
    "- **Agent Skill | [Medium | High confidence] | `agent-skill/resource-routing-missing`** — The route omits a read step.",
    "  Evidence: `SKILL.md` links the policy.",
    "  Suggestion: Read the policy before use."
  ].join("\n"), { reads: [], commandAttempts: [] }).observed;
  assert.equal(concise.ruleAssertions[0].severity, "Medium");
  assert.deepEqual(concise.outputFields, ["Evidence", "Suggestion", "Level", "Severity", "Confidence", "Issue", "Rule ID"]);
  assert.equal(concise.reportMode, "concise");

  const plainSeverityHeading = parseObservation({ mode: "review" }, [
    "- **Prompt | High | High confidence | `prompt/missing-output-format`** — The importer requires an unspecified record shape.",
    "  Evidence: A stable machine-readable record is required.",
    "  Suggestion: Define its schema."
  ].join("\n"), { reads: [], commandAttempts: [] }).observed;
  assert.equal(plainSeverityHeading.ruleAssertions[0].severity, "High");
  assert.ok(plainSeverityHeading.outputFields.includes("Issue"));
  assert.equal(plainSeverityHeading.reportMode, "concise");

  const detailed = parseObservation({ mode: "review" }, [
    "## Findings",
    "- `Level`: Prompt",
    "  `Severity`: Medium",
    "  `Confidence`: High",
    "  `Applicability`: Applicable",
    "  `Category`: Evidence and sourcing",
    "  `Issue`: Sources are unspecified.",
    "  `Rule`: prompt/missing-evidence-contract",
    "  `Evidence`: No source instruction is present.",
    "  `Why it matters`: The result cannot be verified.",
    "  `Suggestion`: Require citations.",
    "  `Change type`: reliability"
  ].join("\n"), { reads: [], commandAttempts: [] }).observed;
  assert.equal(detailed.ruleAssertions[0].severity, "Medium");
  assert.equal(detailed.reportMode, "detailed");
  for (const field of FIXTURE.cases.find(({ id }) => id === "O2-explicit-detailed-report").expected.requiredOutputFields) {
    assert.ok(detailed.outputFields.includes(field), `missing detailed field ${field}`);
  }
});

test("source audit rejects global reads and ties staged reads to their returned file bytes", (t) => {
  const sessionDir = fs.mkdtempSync(path.join(os.tmpdir(), "review-followup-read-audit-"));
  t.after(() => fs.rmSync(sessionDir, { recursive: true, force: true }));
  const stagedSkill = path.join(sessionDir, ".agents/skills/igapyon-miku-prompt-lint");
  fs.mkdirSync(stagedSkill, { recursive: true });
  const contents = "# Isolated staged entrypoint\n";
  fs.writeFileSync(path.join(stagedSkill, "SKILL.md"), contents);
  const policyPath = path.join(stagedSkill, "references/policy.md");
  fs.mkdirSync(path.dirname(policyPath), { recursive: true });
  const policy = "# Policy\nApply rounding before reporting.\n";
  fs.writeFileSync(policyPath, policy);
  const manifest = [
    { path: "SKILL.md", sha256: sha256(contents) },
    { path: "references/policy.md", sha256: sha256(policy) }
  ];
  const localEvent = {
    type: "item.completed",
    item: {
      id: "read-local", type: "command_execution", exit_code: 1,
      command: "cat .agents/skills/igapyon-miku-prompt-lint/references/policy.md .agents/skills/igapyon-miku-prompt-lint/SKILL.md && rg --files .",
      aggregated_output: `${policy}${contents}`
    }
  };
  const local = auditSkillReads([localEvent], {
    sessionDir,
    stagedSkill,
    manifest,
    mode: "review"
  });
  assert.equal(local.status, "verified");
  assert.deepEqual(local.reads, [
    { path: "references/policy.md", sha256: manifest[1].sha256, eventIds: ["read-local"] },
    { path: "SKILL.md", sha256: manifest[0].sha256, eventIds: ["read-local"] }
  ]);

  const globalEvent = {
    type: "item.completed",
    item: {
      id: "read-global", type: "command_execution", exit_code: 0,
      command: "cat /Users/igapyon/.codex/skills/igapyon-miku-prompt-lint/SKILL.md"
    }
  };
  const tainted = auditSkillReads([localEvent, globalEvent], {
    sessionDir,
    stagedSkill,
    manifest,
    mode: "review"
  });
  assert.equal(tainted.status, "unverifiable");
  assert.equal(tainted.externalSkillReads.length, 1);
});

test("the local completion gate validates raw bytes and audits trace paths", (t) => {
  const runRoot = fs.mkdtempSync(path.join(os.tmpdir(), "review-followup-gate-"));
  t.after(() => fs.rmSync(runRoot, { recursive: true, force: true }));
  const baseline = makeContractShapeFixture();
  for (const result of baseline.results) {
    const item = FIXTURE.cases.find(({ id }) => id === result.caseId);
    const attempt = result.attempts[0];
    const caseDir = path.join(runRoot, "cases", item.id);
    fs.mkdirSync(caseDir, { recursive: true });
    if (attempt.sourceAudit.stagedSkillPath) {
      const stagedRoot = path.join(runRoot, attempt.sourceAudit.stagedSkillPath);
      fs.mkdirSync(path.dirname(stagedRoot), { recursive: true });
      fs.cpSync(SKILL, stagedRoot, { recursive: true, dereference: false, errorOnExist: true, force: false });
    }
    writeArtifact(caseDir, runRoot, attempt.artifacts.input, "raw-input.json", `${canonicalJson(item.input)}\n`);
    writeArtifact(caseDir, runRoot, attempt.artifacts.prompt, "prompt.txt", `${REVIEW_FOLLOWUP_WRAPPER}${JSON.stringify(item.input.user)}\n`);
    attempt.promptSha256 = attempt.artifacts.prompt.sha256;
    writeArtifact(caseDir, runRoot, attempt.artifacts.response, "answer.txt", "synthetic fixture evidence\n");
    const readsByEvent = new Map();
    for (const read of attempt.sourceAudit.reads) {
      const eventId = read.eventIds[0];
      if (!readsByEvent.has(eventId)) readsByEvent.set(eventId, []);
      readsByEvent.get(eventId).push(read);
    }
    const events = [...readsByEvent].map(([eventId, reads]) => ({
      type: "item.completed",
      item: {
        id: eventId,
        type: "command_execution",
        command: `cat ${reads.map(({ path: readPath }) => `${attempt.sourceAudit.stagedSkillPath}/${readPath}`).join(" ")}`,
        exit_code: 0,
        aggregated_output: reads.map(({ path: readPath }) => fs.readFileSync(path.join(SKILL, ...readPath.split("/")), "utf8")).join("")
      }
    }));
    attempt.sourceAudit.commandAttempts = events.map(({ item: event }) => ({
      eventId: event.id,
      command: event.command,
      exitCode: event.exit_code,
      ranSentinel: event.command.includes("/tmp/prompt-lint-target-was-run")
    }));
    writeArtifact(caseDir, runRoot, attempt.artifacts.trace, "events.jsonl", `${events.map((e) => JSON.stringify(e)).join("\n")}\n`);
  }
  assert.equal(validateBaseline(baseline, {
    fixture: FIXTURE,
    skillRoot: SKILL,
    requireComplete: true,
    runRoot,
    verifyArtifacts: true
  }), true);

  const tainted = baseline.results[0].attempts[0];
  const tracePath = path.join(runRoot, tainted.artifacts.trace.path);
  const old = fs.readFileSync(tracePath, "utf8");
  const globalRead = { type: "item.completed", item: { id: "global", type: "command_execution", command: "cat /Users/igapyon/.codex/skills/igapyon-miku-prompt-lint/SKILL.md", exit_code: 0 } };
  fs.writeFileSync(tracePath, `${old}${JSON.stringify(globalRead)}\n`);
  tainted.artifacts.trace.sha256 = sha256(fs.readFileSync(tracePath));
  assert.throws(() => validateBaseline(baseline, {
    fixture: FIXTURE,
    skillRoot: SKILL,
    requireComplete: true,
    runRoot,
    verifyArtifacts: true
  }), /external\/global prompt-lint Skill path/);
});

function makeContractShapeFixture() {
  const manifest = buildManifest(SKILL);
  const fullHash = manifestSha256(manifest);
  const results = FIXTURE.cases.map((item) => {
    const observed = structuredClone(item.expected);
    if (item.mode === "review") {
      observed.ruleAssertions ??= [];
      observed.outputFields = [...(item.expected.requiredOutputFields ?? [])];
      observed.reportMode ??= "concise";
    }
    if (item.mode === "skeleton") {
      observed.readFiles = ["SKILL.md", ...(item.expected.readFiles ?? [])];
    }
    const reads = item.mode === "activation-metadata" ? [] : ["SKILL.md", ...(item.expected.readFiles ?? [])];
    const actualReads = [...new Set(reads)].map((readPath, index) => ({
      path: readPath,
      sha256: manifest.find(({ path: sourcePath }) => sourcePath === readPath).sha256,
      eventIds: [`event-${item.id}-${index}`]
    }));
    const stagedSourceManifestSha256 = item.mode === "activation-metadata" ? sha256("[]") : fullHash;
    const attempt = {
      sequence: 1,
      model: "synthetic-contract-model",
      runtime: "synthetic-contract-runtime",
      date: "2026-11-12",
      inputSha256: sha256(canonicalJson(item.input)),
      promptSha256: "a".repeat(64),
      sourceManifestSha256: fullHash,
      stagedSourceManifestSha256,
      status: "pass",
      artifacts: {
        input: { path: `cases/${item.id}/raw-input.json`, sha256: "b".repeat(64) },
        prompt: { path: `cases/${item.id}/prompt.txt`, sha256: "a".repeat(64) },
        response: { path: `cases/${item.id}/answer.txt`, sha256: "c".repeat(64) },
        trace: { path: `cases/${item.id}/events.jsonl`, sha256: "d".repeat(64) }
      },
      sourceAudit: {
        status: "verified",
        manifestSha256: stagedSourceManifestSha256,
        stagedSkillPath: item.mode === "activation-metadata" ? null : `session-evidence/${item.id}/.agents/skills/igapyon-miku-prompt-lint`,
        reads: actualReads,
        externalSkillReads: [],
        commandAttempts: []
      },
      observed,
      assertions: scoreAssertions(item, observed).map((entry) => ({ ...entry, evidence: "synthetic fixture evidence" }))
    };
    return { caseId: item.id, mode: item.mode, status: "pass", attempts: [attempt] };
  });
  const pending = makePendingBaseline({
    fixture: FIXTURE,
    skillRoot: SKILL,
    previousBaselineHash: BASELINE.supersedes?.sha256 ?? "e".repeat(64),
    wrapperSha256: sha256(REVIEW_FOLLOWUP_WRAPPER)
  });
  return { ...pending, gateStatus: "complete-pass", results };
}

function writeArtifact(caseDir, runRoot, ref, filename, contents) {
  const absolute = path.join(caseDir, filename);
  fs.writeFileSync(absolute, contents);
  ref.path = path.relative(runRoot, absolute).split(path.sep).join("/");
  ref.sha256 = sha256(fs.readFileSync(absolute));
}
