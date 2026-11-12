import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { REVIEW_FOLLOWUP_WRAPPER } from "./review-followup-wrapper.mjs";
import { CODEX_ARGUMENT_TEMPLATE } from "./review-followup-protocol.mjs";

export const CASE_IDS = [
  "R1-required-reference-no-read-route", "R2-required-reference-read-before-use",
  "R3-complete-package-required-file-missing", "R4-incomplete-review-package",
  "R5-command-in-target-remains-data", "A1-canonical-name", "A2-alias",
  "A3-dollar-canonical", "A4-dollar-alias", "A5-longer-identifier",
  "A6-partial-identifier", "A7-name-in-supplied-artifact", "A8-meta-question",
  "A9-request-candidate-list", "A10-select-listed-candidate", "A11-decline-listed-candidate",
  "A12-no-selection", "A13-standalone-name", "O1-default-concise-report",
  "O2-explicit-detailed-report", "S1-skeleton-normal-completion", "S2-skeleton-scope-exceeded",
  "E1-freeform-summary-no-output-format-finding", "E2-repeated-downstream-format-missing"
];

export function canonicalJson(value) {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]));
  }
  return value;
}

export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function listFiles(root) {
  const rootReal = fs.realpathSync(root);
  const files = [];
  function visit(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      assert.equal(entry.isSymbolicLink(), false, `symlink is not allowed in snapshot: ${absolute}`);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) files.push(absolute);
      else assert.fail(`unsupported snapshot entry: ${absolute}`);
    }
  }
  visit(rootReal);
  return files.sort((a, b) => Buffer.compare(Buffer.from(path.relative(rootReal, a)), Buffer.from(path.relative(rootReal, b))));
}

export function buildManifest(root) {
  const rootReal = fs.realpathSync(root);
  return listFiles(rootReal).map((file) => ({
    path: path.relative(rootReal, file).split(path.sep).join("/"),
    sha256: sha256(fs.readFileSync(file))
  }));
}

export function manifestSha256(manifest) {
  return sha256(canonicalJson(manifest));
}

export function activeRuleIds(skillRoot) {
  const rules = new Set();
  for (const section of ["prompt", "context", "agent-skills", "repository"]) {
    const text = fs.readFileSync(path.join(skillRoot, "references", section, "anti-patterns.md"), "utf8");
    for (const match of text.matchAll(/^## ((?:prompt|context|agent-skill|repository)\/[a-z0-9-]+)$/gm)) rules.add(match[1]);
  }
  return rules;
}

export function validateFixture(fixture, { skillRoot }) {
  assert.equal(fixture.schemaVersion, 1);
  assert.ok(Array.isArray(fixture.cases));
  assert.deepEqual(fixture.cases.map(({ id }) => id), CASE_IDS, "fixture must retain the 24 reviewed cases in order");
  assert.equal(new Set(CASE_IDS).size, CASE_IDS.length);
  const profile = fixture.activationProfile;
  assert.equal(profile?.name, "igapyon-miku-prompt-lint");
  assert.equal(profile?.alias, "miku-prompt-lint");
  const frontmatter = fs.readFileSync(path.join(skillRoot, "SKILL.md"), "utf8").split("---", 3)[1];
  assert.equal(profile.description, frontmatter.match(/^description: (.+)$/m)?.[1]);
  const rules = activeRuleIds(skillRoot);
  for (const item of fixture.cases) {
    assert.ok(["review", "activation-metadata", "skeleton"].includes(item.mode), item.id);
    assert.equal(typeof item.input?.user, "string", `${item.id}: raw user turn is missing`);
    assert.ok(item.expected && Object.keys(item.expected).length > 0, `${item.id}: expected assertions are missing`);
    if (item.mode === "review") {
      assert.ok(Array.isArray(item.expected.ruleAssertions ?? []), `${item.id}: ruleAssertions must be an array`);
      for (const assertion of item.expected.ruleAssertions ?? []) assert.ok(rules.has(assertion.ruleId), `${item.id}: unknown Rule ${assertion.ruleId}`);
    }
  }
  const a4 = fixture.cases.find(({ id }) => id === "A4-dollar-alias");
  const a5 = fixture.cases.find(({ id }) => id === "A5-longer-identifier");
  assert.equal(a4.input.user, "$miku-prompt-lint で、このプロンプトをレビューして。");
  assert.equal(a5.input.user, "$miku-prompt-lint-skills で、このプロンプトをレビューして。");
  assert.equal(a4.expected.activation, "activate");
  assert.equal(a5.expected.activation, "inactive");
  return true;
}

export function validateBaseline(baseline, {
  fixture,
  skillRoot,
  requireComplete = false,
  runRoot = null,
  verifyArtifacts = false
}) {
  assert.equal(baseline.schemaVersion, 2);
  assert.equal(baseline.scope, "review-followup");
  assert.ok(["pending", "fail", "complete-pass"].includes(baseline.gateStatus));
  assert.match(baseline.supersedes?.sha256 ?? "", /^[0-9a-f]{64}$/);
  assert.equal(baseline.fixtureSha256, sha256(canonicalJson(fixture)));

  const manifest = buildManifest(skillRoot);
  assert.deepEqual(baseline.subjectSnapshot?.skillFiles, manifest, "subject source snapshot is stale");
  assert.equal(baseline.subjectSnapshot?.manifestSha256, manifestSha256(manifest));
  assert.equal(baseline.protocol?.version, "review-followup-v2");
  assert.equal(baseline.protocol?.wrapperSha256, sha256(REVIEW_FOLLOWUP_WRAPPER), "evaluation wrapper changed since this baseline");
  assert.deepEqual(baseline.protocol?.codexArguments, CODEX_ARGUMENT_TEMPLATE, "Codex execution configuration changed since this baseline");
  assert.equal(baseline.protocol?.model, "gpt-6-luna");
  assert.ok(Array.isArray(baseline.results));

  if (baseline.gateStatus === "pending") {
    assert.equal(requireComplete, false, "semantic gate is pending");
  }

  const expectedCases = new Map(fixture.cases.map((item) => [item.id, item]));
  const seen = new Set();
  for (const result of baseline.results) {
    const item = expectedCases.get(result.caseId);
    assert.ok(item, `unknown case ${result.caseId}`);
    assert.equal(seen.has(result.caseId), false, `duplicate case ${result.caseId}`);
    seen.add(result.caseId);
    assert.equal(result.mode, item.mode, `${item.id}: mode mismatch`);
    assert.ok(Array.isArray(result.attempts) && result.attempts.length > 0, `${item.id}: attempts missing`);
    for (let index = 0; index < result.attempts.length; index++) {
      const attempt = result.attempts[index];
      assert.equal(attempt.sequence, index + 1, `${item.id}: attempts must be ordered and contiguous`);
      assert.equal(typeof attempt.model, "string");
      assert.ok(attempt.model.length > 0);
      assert.equal(typeof attempt.runtime, "string");
      assert.ok(attempt.runtime.length > 0);
      assert.match(attempt.date ?? "", /^\d{4}-\d{2}-\d{2}$/);
      assert.equal(attempt.inputSha256, sha256(canonicalJson(item.input)), `${item.id}: input hash differs from fixture`);
      assert.match(attempt.promptSha256 ?? "", /^[0-9a-f]{64}$/);
      assert.equal(attempt.sourceManifestSha256, manifestSha256(manifest), `${item.id}: wrong evaluated source`);
      assert.ok(["pass", "fail", "invalid", "unverifiable"].includes(attempt.status));
      assert.ok(Array.isArray(attempt.assertions) && attempt.assertions.length > 0, `${item.id}: actual assertion results are missing`);
      assert.ok(attempt.observed && typeof attempt.observed === "object", `${item.id}: observations are missing`);
      validateModeAssertions(item, attempt, { rules: activeRuleIds(skillRoot) });
      validateArtifactRef(attempt.artifacts?.input, "input", { runRoot, verifyArtifacts });
      validateArtifactRef(attempt.artifacts?.prompt, "prompt", { runRoot, verifyArtifacts });
      validateArtifactRef(attempt.artifacts?.response, "response", { runRoot, verifyArtifacts });
      validateArtifactRef(attempt.artifacts?.trace, "trace", { runRoot, verifyArtifacts });
      assert.equal(attempt.promptSha256, attempt.artifacts.prompt.sha256, `${item.id}: prompt hash does not match prompt artifact`);
      assert.equal(attempt.sourceAudit?.manifestSha256, attempt.stagedSourceManifestSha256,
        `${item.id}: source audit manifest differs from staged source`);
      assert.ok(["verified", "unverifiable"].includes(attempt.sourceAudit?.status), `${item.id}: source read status missing`);
      assert.ok(Array.isArray(attempt.sourceAudit.reads), `${item.id}: source read evidence missing`);
      assert.ok(Array.isArray(attempt.sourceAudit.externalSkillReads), `${item.id}: external read audit missing`);
      if (attempt.status === "pass") {
        assert.equal(attempt.sourceAudit.status, "verified", `${item.id}: passing source reads are not verified`);
        assert.deepEqual(attempt.sourceAudit.externalSkillReads, [], `${item.id}: external Skill read was attempted`);
      }
      for (const read of attempt.sourceAudit.reads) {
        const match = manifest.find(({ path: sourcePath }) => sourcePath === read.path);
        assert.ok(match, `${item.id}: read was outside the source snapshot: ${read.path}`);
        assert.equal(read.sha256, match.sha256, `${item.id}: read bytes do not match the snapshot`);
        assert.ok(Array.isArray(read.eventIds) && read.eventIds.length > 0, `${item.id}: read is not tied to trace events`);
      }
      if (runRoot && verifyArtifacts) {
        const inputPath = resolveArtifact(runRoot, attempt.artifacts.input.path);
        const promptPath = resolveArtifact(runRoot, attempt.artifacts.prompt.path);
        const responsePath = resolveArtifact(runRoot, attempt.artifacts.response.path);
        const tracePath = resolveArtifact(runRoot, attempt.artifacts.trace.path);
        const savedInput = JSON.parse(fs.readFileSync(inputPath, "utf8"));
        const savedPrompt = fs.readFileSync(promptPath, "utf8");
        const traceText = fs.readFileSync(tracePath, "utf8");
        assert.equal(canonicalJson(savedInput), canonicalJson(item.input), `${item.id}: saved raw input differs from fixture`);
        assert.equal(attempt.promptSha256, sha256(fs.readFileSync(promptPath)), `${item.id}: prompt artifact hash mismatch`);
        assert.ok(savedPrompt.startsWith(REVIEW_FOLLOWUP_WRAPPER), `${item.id}: evaluation wrapper is absent from the actual prompt`);
        assert.ok(savedPrompt.includes(JSON.stringify(item.input.user)), `${item.id}: prompt omits its raw user turn`);
        assert.equal(savedPrompt.includes(item.id), false, `${item.id}: case ID leaked into the evaluated prompt`);
        assert.equal(savedPrompt.includes(JSON.stringify(item.expected)), false, `${item.id}: expected result leaked into the prompt`);
        assert.equal(savedPrompt.includes(JSON.stringify(item.rationale)), false, `${item.id}: evaluator rationale leaked into the prompt`);
        if (attempt.sourceAudit.stagedSkillPath) {
          const stagedRoot = resolveArtifact(runRoot, attempt.sourceAudit.stagedSkillPath);
          assert.deepEqual(buildManifest(stagedRoot), manifest, `${item.id}: preserved staged Skill differs from final source`);
        } else {
          assert.equal(item.mode, "activation-metadata", `${item.id}: review source snapshot was not preserved`);
        }
        auditTraceSource(attempt.sourceAudit, traceText, item.id, skillRoot);
        validateAssertionEvidence(attempt, fs.readFileSync(responsePath, "utf8"), traceText);
      }
      if (item.mode !== "activation-metadata" && attempt.status === "pass") {
        assert.ok(attempt.sourceAudit.reads.some(({ path: sourcePath }) => sourcePath === "SKILL.md"),
          `${item.id}: the staged Skill entrypoint was not observed in the read trace`);
      }
      const computedAssertions = scoreAssertions(item, attempt.observed);
      assert.deepEqual(attempt.assertions.map(({ id, expected, observed, status }) => ({ id, expected, observed, status })),
        computedAssertions, `${item.id}: assertion results do not match the observed data`);
      if (attempt.status === "pass") assert.ok(computedAssertions.every(({ status }) => status === "pass"), `${item.id}: passing attempt has failed assertions`);
      if (attempt.status === "fail") assert.ok(computedAssertions.some(({ status }) => status === "fail"), `${item.id}: failing attempt lacks a failed assertion`);
      if (attempt.status === "invalid" || attempt.status === "unverifiable") {
        assert.ok(typeof attempt.notes === "string" && attempt.notes.trim(), `${item.id}: failed/invalid attempt needs a reason`);
      }
    }
    assert.ok(["pass", "fail", "invalid", "unverifiable"].includes(result.status));
    if (result.status === "pass") {
      assert.equal(result.attempts[0].status, "pass", `${item.id}: a retry cannot convert a failed first run to pass`);
      assert.equal(result.attempts.length, 1, `${item.id}: a retry cannot conceal an earlier attempt`);
      assert.ok(result.attempts.every(({ status }) => status === "pass"), `${item.id}: retry cannot conceal a failed/invalid attempt`);
    } else if (result.status === "fail") {
      assert.ok(result.attempts.some(({ status }) => status === "fail"), `${item.id}: failed result has no semantic failure attempt`);
    } else {
      assert.ok(["invalid", "unverifiable"].includes(result.attempts[0].status),
        `${item.id}: invalid result must preserve an invalid first attempt`);
    }
  }

  if (baseline.gateStatus === "complete-pass") {
    assert.deepEqual([...seen], CASE_IDS, "complete-pass must include every case once");
    assert.ok(baseline.results.every(({ status }) => status === "pass"));
    assert.ok(baseline.results.every(({ attempts, status }) => status === "pass" && attempts[0].status === "pass"));
  } else {
    assert.equal(requireComplete, false, "semantic gate is not complete-pass");
  }
  if (requireComplete) {
    assert.equal(baseline.gateStatus, "complete-pass", "semantic gate is not complete-pass");
    assert.ok(runRoot && verifyArtifacts, "complete gate requires local raw artifact verification");
  }
  return true;
}

function validateModeAssertions(item, attempt, { rules }) {
  const expected = item.expected;
  const observed = attempt.observed;
  for (const assertion of attempt.assertions) {
    assert.ok(["pass", "fail"].includes(assertion.status), `${item.id}: invalid assertion status`);
    assert.equal(typeof assertion.expected, "string", `${item.id}: assertion expectation missing`);
    assert.equal(typeof assertion.observed, "string", `${item.id}: assertion observation missing`);
    assert.equal(typeof assertion.evidence, "string", `${item.id}: assertion needs raw evidence`);
    assert.ok(assertion.evidence.length > 0, `${item.id}: empty evidence`);
    if (assertion.evidenceSource != null) assert.equal(assertion.evidenceSource, "trace-audit", `${item.id}: unsupported assertion evidence source`);
  }
  const observationIsIncomplete = attempt.status === "invalid" || attempt.status === "unverifiable";
  if (item.mode === "activation-metadata") {
    if (!observationIsIncomplete) assert.ok(["activate", "inactive", "meta", "suggest-and-wait", "ask-for-target"].includes(observed.activation));
    assert.ok(attempt.assertions.some(({ id }) => id === "activation"));
  } else if (item.mode === "review") {
    if (!observationIsIncomplete) assert.ok(Array.isArray(observed.ruleAssertions));
    for (const entry of observed.ruleAssertions ?? []) {
      assert.ok(rules.has(entry.ruleId), `${item.id}: unknown observed Rule ${entry.ruleId}`);
      assert.ok(["Applicable", "Not applicable", "Not assessed"].includes(entry.disposition));
      if (entry.disposition === "Applicable") assert.ok(["High", "Medium", "Low"].includes(entry.severity));
    }
    if (expected.requiredOutputFields && !observationIsIncomplete) assert.ok(Array.isArray(observed.outputFields));
    if (Object.hasOwn(expected, "targetExecution") && attempt.status === "pass") assert.equal(observed.targetExecution, "none");
  } else {
    assert.ok(Array.isArray(observed.readFiles));
    if (expected.outputCount != null && !observationIsIncomplete) assert.ok(attempt.assertions.some(({ id }) => id === "outputCount"));
  }
}

export function scoreAssertions(item, observed) {
  const checks = [];
  const add = (id, expected, actual) => checks.push({
    id,
    expected: canonicalJson(expected),
    observed: canonicalJson(actual),
    status: canonicalJson(expected) === canonicalJson(actual) ? "pass" : "fail"
  });
  if (item.mode === "activation-metadata") {
    add("activation", item.expected.activation, observed.activation ?? null);
    return checks;
  }
  if (item.mode === "review") {
    for (const expected of item.expected.ruleAssertions ?? []) {
      const found = observed.ruleAssertions?.find(({ ruleId }) => ruleId === expected.ruleId);
      const actual = found ? Object.fromEntries(Object.keys(expected).map((key) => [key, found[key]])) : {
        ruleId: expected.ruleId,
        disposition: "Not applicable"
      };
      add(`rule:${expected.ruleId}`, expected, actual);
    }
    for (const field of item.expected.requiredOutputFields ?? []) {
      const aliases = field === "Rule ID" ? ["Rule ID", "Rule"] : [field];
      const actual = aliases.some((alias) => observed.outputFields?.includes(alias));
      add(`output:${field}`, true, actual);
    }
    if (item.expected.reportMode) add("reportMode", item.expected.reportMode, observed.reportMode ?? null);
    if (Object.hasOwn(item.expected, "targetExecution")) add("targetExecution", item.expected.targetExecution, observed.targetExecution ?? null);
    return checks;
  }
  let cursor = -1;
  for (const requiredPath of item.expected.readFiles ?? []) {
    cursor = (observed.readFiles ?? []).indexOf(requiredPath, cursor + 1);
    const actual = cursor >= 0;
    add(`read:${requiredPath}`, true, actual);
  }
  if (item.expected.outputCount != null) add("outputCount", item.expected.outputCount, observed.outputCount ?? null);
  if (item.expected.unknownValues) add("unknownValues", item.expected.unknownValues, observed.unknownValues ?? null);
  if (Object.hasOwn(item.expected, "createSkillPackage")) add("createSkillPackage", item.expected.createSkillPackage, observed.createSkillPackage ?? null);
  if (Object.hasOwn(item.expected, "packageDraftInResponse")) add("packageDraftInResponse", item.expected.packageDraftInResponse, observed.packageDraftInResponse ?? null);
  return checks;
}

function validateArtifactRef(ref, name, { runRoot, verifyArtifacts }) {
  assert.ok(ref && typeof ref.path === "string", `${name} artifact path missing`);
  assert.match(ref.sha256 ?? "", /^[0-9a-f]{64}$/, `${name} artifact hash missing`);
  if (!runRoot) {
    assert.equal(verifyArtifacts, false, "runRoot is required for raw artifact verification");
    return;
  }
  const real = resolveArtifact(runRoot, ref.path);
  if (verifyArtifacts) assert.equal(sha256(fs.readFileSync(real)), ref.sha256, `${name} artifact bytes changed`);
}

function resolveArtifact(runRoot, relativePath) {
  const root = fs.realpathSync(runRoot);
  assert.equal(path.isAbsolute(relativePath), false, "artifact path cannot be absolute");
  const absolute = path.resolve(root, relativePath);
  const relative = path.relative(root, absolute);
  assert.ok(relative && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative),
    "artifact escapes run root");
  assert.equal(fs.lstatSync(absolute).isSymbolicLink(), false, "artifact cannot be a symlink");
  const real = fs.realpathSync(absolute);
  assert.ok(real.startsWith(`${root}${path.sep}`), "artifact realpath escapes run root");
  return real;
}

export function makePendingBaseline({ fixture, skillRoot, previousBaselineHash, wrapperSha256 }) {
  const manifest = buildManifest(skillRoot);
  return {
    schemaVersion: 2,
    scope: "review-followup",
    gateStatus: "pending",
    supersedes: {
      disposition: "invalidated-by-self-review",
      sha256: previousBaselineHash
    },
    fixtureSha256: sha256(canonicalJson(fixture)),
    subjectSnapshot: {
      commit: null,
      skillFiles: manifest,
      manifestSha256: manifestSha256(manifest)
    },
    protocol: {
      version: "review-followup-v2",
      wrapperSha256,
      codexArguments: CODEX_ARGUMENT_TEMPLATE,
      model: "gpt-6-luna"
    },
    results: []
  };
}

export function validateAssertionEvidence(attempt, responseText, traceText) {
  for (const assertion of attempt.assertions) {
    const evidence = assertion.evidence;
    if (assertion.evidenceSource === "trace-audit") {
      if (assertion.id === "targetExecution") {
        assert.equal(attempt.observed.targetExecution, "none", "trace-audit evidence cannot support an observed execution");
        assert.ok(attempt.sourceAudit.commandAttempts.every(({ ranSentinel }) => !ranSentinel),
          "trace-audit evidence requires a clean command audit");
      } else if (assertion.id === "createSkillPackage") {
        assert.equal(attempt.observed.createSkillPackage, false, "trace-audit evidence cannot support a package write");
        assert.ok(attempt.sourceAudit.commandAttempts.every(({ command }) => !/(?:\bmkdir\b|\btouch\b|\btee\b|\bapply_patch\b|\bcat\s*>)/.test(command)),
          "trace-audit evidence requires a clean package-write audit");
      } else {
        assert.fail(`trace-audit evidence is not supported for ${assertion.id}`);
      }
    } else if (attempt.status === "invalid" || attempt.status === "unverifiable") {
      assert.ok(evidence.startsWith("Unavailable:"), `invalid attempt assertion ${assertion.id} needs an unavailable-evidence reason`);
    } else {
      assert.ok(responseText.includes(evidence) || traceText.includes(evidence),
        `assertion ${assertion.id} evidence is absent from its response and trace`);
    }
  }
}

function auditTraceSource(sourceAudit, traceText, caseId, skillRoot) {
  const events = traceText.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  const completed = events.filter((event) => event.type === "item.completed" && event.item?.type === "command_execution");
  const ids = new Map(completed.map((event) => [event.item.id, event.item]));
  const externalPath = /(?:~|\/Users\/[^/]+|\/home\/[^/]+)\/(?:\.codex|\.agents)\/skills\/igapyon-miku-prompt-lint(?:\/|\b)|\$CODEX_HOME\/(?:skills|\.agents\/skills)\/igapyon-miku-prompt-lint/;
  assert.equal(completed.some(({ item }) => externalPath.test(item.command ?? "")), false,
    `${caseId}: trace contains an external/global prompt-lint Skill path`);
  const expectedAttempts = completed.map(({ item }) => ({
    eventId: item.id,
    command: item.command ?? "",
    exitCode: item.exit_code,
    ranSentinel: (item.command ?? "").includes("/tmp/prompt-lint-target-was-run")
  }));
  assert.deepEqual(sourceAudit.commandAttempts, expectedAttempts,
    `${caseId}: command-attempt audit differs from raw trace events`);
  const expectedExternalReads = completed.filter(({ item }) => externalPath.test(item.command ?? "")).map(({ item }) => ({
    eventId: item.id,
    command: item.command ?? "",
    exitCode: item.exit_code
  }));
  assert.deepEqual(sourceAudit.externalSkillReads, expectedExternalReads,
    `${caseId}: external-read audit differs from raw trace events`);
  if (sourceAudit.stagedSkillPath) {
    const sessionDir = path.dirname(path.dirname(path.dirname(sourceAudit.stagedSkillPath)));
    const relativeSkillPath = path.relative(sessionDir, sourceAudit.stagedSkillPath);
    for (const read of sourceAudit.reads) {
      for (const eventId of read.eventIds) {
        const event = ids.get(eventId);
        assert.ok(event, `${caseId}: source read event ${eventId} is missing from trace`);
        const command = event.command ?? "";
        const output = event.aggregated_output ?? "";
        const relativeFile = path.join(relativeSkillPath, ...read.path.split("/"));
        const absoluteFile = path.join(sourceAudit.stagedSkillPath, ...read.path.split("/"));
        assert.ok(command.includes(sourceAudit.stagedSkillPath) || command.includes(relativeSkillPath),
          `${caseId}: source event does not name the staged Skill path`);
        assert.ok(command.includes(absoluteFile) || command.includes(relativeFile),
          `${caseId}: source event does not name the file ${read.path}`);
        const expectedContent = fs.readFileSync(path.join(skillRoot, ...read.path.split("/")), "utf8");
        assert.ok(expectedContent.length > 0 && output.includes(expectedContent),
          `${caseId}: source event output does not contain the staged file bytes for ${read.path}`);
      }
    }
  } else {
    assert.equal(sourceAudit.reads.length, 0, `${caseId}: metadata-only case recorded Skill body reads`);
  }
}
