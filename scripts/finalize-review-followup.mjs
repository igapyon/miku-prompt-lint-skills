import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildManifest,
  canonicalJson,
  manifestSha256,
  scoreAssertions,
  sha256,
  validateBaseline,
  validateFixture
} from "./lib/review-followup-contract.mjs";
import { REVIEW_FOLLOWUP_WRAPPER } from "./lib/review-followup-wrapper.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = JSON.parse(fs.readFileSync(path.join(root, "tests/fixtures/review-followup.json"), "utf8"));
const skillRoot = path.join(root, "skills/igapyon-miku-prompt-lint");
const pendingPath = path.join(root, "tests/fixtures/review-followup-baseline.json");
const pending = JSON.parse(fs.readFileSync(pendingPath, "utf8"));
const indexPath = path.resolve(process.argv[2] ?? "");
const assessmentPath = path.resolve(process.argv[3] ?? "");
const retryIndexPaths = process.argv.slice(4).map((item) => path.resolve(item));
if (!process.argv[2] || !process.argv[3]) {
  throw new Error("Usage: node scripts/finalize-review-followup.mjs <reconciled-index.json> <human-assessments.json> [retry-index.json ...]");
}
const runRoot = path.dirname(indexPath);
const index = readReconciledIndex(indexPath);
const assessment = JSON.parse(fs.readFileSync(assessmentPath, "utf8"));
validateFixture(fixture, { skillRoot });
assert.equal(index.fixtureSha256, sha256(canonicalJson(fixture)));
assert.equal(index.sourceManifestSha256, manifestSha256(buildManifest(skillRoot)));
assert.equal(index.wrapperSha256, sha256(REVIEW_FOLLOWUP_WRAPPER));
assert.equal(assessment.runId, index.runId);
assert.deepEqual(assessment.cases.map(({ caseId }) => caseId), index.results.map(({ caseId }) => caseId));

const retryIndexes = new Map();
for (const retryPath of retryIndexPaths) {
  const retryIndex = readReconciledIndex(retryPath);
  assert.notEqual(retryIndex.runId, index.runId, "retry must use a fresh run ID");
  assert.equal(retryIndex.fixtureSha256, index.fixtureSha256, "retry fixture differs");
  assert.equal(retryIndex.sourceManifestSha256, index.sourceManifestSha256, "retry Skill snapshot differs");
  assert.equal(retryIndex.wrapperSha256, index.wrapperSha256, "retry wrapper differs");
  assert.equal(retryIndex.requestedModel, index.requestedModel, "retry model differs");
  assert.equal(retryIndex.requestedReasoning, index.requestedReasoning, "retry reasoning configuration differs");
  assert.equal(retryIndex.caseTimeoutMs, index.caseTimeoutMs, "retry case timeout differs");
  assert.deepEqual(retryIndex.codexArguments, index.codexArguments, "retry Codex arguments differ");
  assert.equal(retryIndexes.has(retryIndex.runId), false, "duplicate retry run ID");
  retryIndexes.set(retryIndex.runId, { index: retryIndex, root: path.dirname(retryPath) });
}

const assessmentByCase = new Map(assessment.cases.map((entry) => [entry.caseId, entry]));
assert.equal(assessmentByCase.size, assessment.cases.length, "duplicate human assessment case IDs");
const retryCaseResults = new Map();
for (const { index: retryIndex } of retryIndexes.values()) {
  for (const result of retryIndex.results) {
    assert.equal(retryCaseResults.has(result.caseId), false, `${result.caseId}: multiple retry records`);
    retryCaseResults.set(result.caseId, result);
  }
}
for (const [caseId, judged] of assessmentByCase) {
  const expectedRetryIds = (judged.retries ?? []).map(({ runId }) => runId).sort();
  const actualRetryIds = [...retryIndexes].filter(([, value]) => value.index.results.some(({ caseId: id }) => id === caseId)).map(([runId]) => runId).sort();
  assert.deepEqual(expectedRetryIds, actualRetryIds, `${caseId}: assessment retries differ from supplied retry indexes`);
}

const copiedRetryRuns = new Map();
for (const [retryRunId, value] of retryIndexes) copiedRetryRuns.set(retryRunId, copyRetryEvidence(runRoot, retryRunId, value));
copySessionEvidence(runRoot, index.runId, path.dirname(indexPath), index);

const results = [];
for (const run of index.results) {
  const item = fixture.cases.find(({ id }) => id === run.caseId);
  const judged = assessmentByCase.get(run.caseId);
  assert.ok(judged, `${item.id}: human assessment missing`);
  const attemptJudgments = [
    { run, runRoot, judged, evidencePrefix: "" },
    ...(judged.retries ?? []).map(({ runId, ...retryJudged }) => {
      const retryValue = retryIndexes.get(runId);
      const retryRun = retryValue.index.results.find(({ caseId }) => caseId === item.id);
      assert.ok(retryRun, `${item.id}: retry ${runId} has no raw result`);
      return {
        run: retryRun,
        runRoot: retryValue.root,
        judged: retryJudged,
        evidencePrefix: `retries/${runId}/`,
        copiedRunRoot: copiedRetryRuns.get(runId)
      };
    })
  ];
  const attempts = attemptJudgments.map((entry, indexInAttempts) => makeAttempt(item, entry, indexInAttempts + 1));
  const firstStatus = attempts[0].status;
  const status = firstStatus === "pass" && attempts.length === 1 ? "pass"
    : firstStatus === "invalid" || firstStatus === "unverifiable" ? firstStatus
      : "fail";
  results.push({ caseId: item.id, mode: run.mode, status, attempts });
}

const unexpectedRetries = [...retryCaseResults.keys()].filter((caseId) => !assessmentByCase.get(caseId)?.retries?.length);
assert.deepEqual(unexpectedRetries, [], "retry results must each have a reviewed assessment");
const gateStatus = results.length === fixture.cases.length && results.every(({ status }) => status === "pass")
  ? "complete-pass"
  : "fail";
const currentCommit = gitHead(root);
const baseline = {
  schemaVersion: 2,
  scope: "review-followup",
  gateStatus,
  runId: index.runId,
  retryRunIds: [...retryIndexes.keys()],
  supersedes: pending.supersedes,
  fixtureSha256: index.fixtureSha256,
  subjectSnapshot: {
    commit: currentCommit,
    skillFiles: index.sourceManifest,
    manifestSha256: index.sourceManifestSha256
  },
  protocol: {
    version: "review-followup-v2",
    wrapperSha256: index.wrapperSha256,
    model: index.requestedModel,
    reasoning: "Codex CLI default; no reasoning override was supplied",
    codexArguments: index.codexArguments,
    runtime: index.runtime,
    sandbox: "read-only",
    ignoreUserConfig: true,
    ephemeralSessions: true,
    caseTimeoutMs: index.caseTimeoutMs
  },
  results
};
validateBaseline(baseline, { fixture, skillRoot, requireComplete: false });
const outPath = pendingPath;
const temporary = `${outPath}.tmp`;
fs.writeFileSync(temporary, `${JSON.stringify(baseline, null, 2)}\n`, { flag: "wx" });
fs.renameSync(temporary, outPath);
process.stdout.write(`Wrote ${gateStatus} baseline for ${results.length}/${fixture.cases.length} cases; ${[...retryCaseResults.keys()].length} case retries retained.\n`);

function makeAttempt(item, entry, sequence) {
  const { run, runRoot: rawRunRoot, judged } = entry;
  assert.equal(typeof judged.observed, "object", `${item.id} attempt ${sequence}: observed data missing`);
  const exit = JSON.parse(readArtifact(rawRunRoot, run.artifacts.exit).toString("utf8"));
  const response = readArtifact(rawRunRoot, run.artifacts.response).toString("utf8");
  const trace = readArtifact(rawRunRoot, run.artifacts.trace).toString("utf8");
  const assertions = scoreAssertions(item, judged.observed).map((result) => {
    const supplied = judged.evidence?.[result.id];
    const evidence = typeof supplied === "string" ? { text: supplied } : supplied;
    assert.equal(typeof evidence?.text, "string", `${item.id}/${result.id}: add verbatim evidence or an unavailable-evidence reason`);
    assert.ok(evidence.text.trim(), `${item.id}/${result.id}: evidence is empty`);
    return { ...result, evidence: evidence.text, ...(evidence.source ? { evidenceSource: evidence.source } : {}) };
  });
  const semanticStatus = assertions.every(({ status }) => status === "pass") ? "pass" : "fail";
  const runtimeInvalid = run.sourceAudit.status !== "verified" || exit.exitCode !== 0 || exit.timedOut;
  const status = runtimeInvalid ? "invalid" : semanticStatus;
  const copiedArtifacts = Object.fromEntries(Object.entries(run.artifacts).map(([name, ref]) => [
    name,
    {
      path: `${entry.evidencePrefix}${ref.path}`,
      sha256: ref.sha256
    }
  ]));
  return {
    sequence,
    model: run.model,
    runtime: run.runtime,
    date: exit.startedAt.slice(0, 10),
    inputSha256: run.inputSha256,
    promptSha256: run.promptSha256,
    sourceManifestSha256: run.sourceManifestSha256,
    stagedSourceManifestSha256: run.stagedSourceManifestSha256,
    status,
    artifacts: copiedArtifacts,
    sourceAudit: portableSourceAudit(run, entry.evidencePrefix),
    observed: judged.observed,
    assertions,
    ...((judged.notes || status === "invalid" || status === "fail") ? {
      notes: judged.notes || (status === "invalid"
        ? run.evaluationNotes.join(" ") || "Codex process or source audit did not produce a valid attempt."
        : "One or more scoped assertions did not pass.")
    } : {})
  };
}

function copyRetryEvidence(destinationRoot, runId, { index, root: sourceRoot }) {
  const destination = path.join(destinationRoot, "retries", runId);
  const sourceSessions = path.join(path.dirname(sourceRoot), `miku-prompt-lint-sessions-${runId}`);
  const destinationSessions = path.join(destination, "session-evidence");
  if (fs.existsSync(destination)) {
    for (const result of index.results) {
      for (const ref of Object.values(result.artifacts)) {
        const sourceBytes = readArtifact(sourceRoot, ref);
        const copiedBytes = readArtifact(destination, ref);
        assert.deepEqual(copiedBytes, sourceBytes, `copied retry evidence changed: ${runId}/${ref.path}`);
      }
    }
    if (fs.existsSync(sourceSessions)) assert.ok(fs.existsSync(destinationSessions), `retry sessions are missing: ${runId}`);
  } else {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.cpSync(sourceRoot, destination, { recursive: true, dereference: false, force: false, errorOnExist: true });
    if (fs.existsSync(sourceSessions)) fs.cpSync(sourceSessions, destinationSessions,
      { recursive: true, dereference: false, force: false, errorOnExist: true });
  }
  return destination;
}

function copySessionEvidence(destinationRoot, runId, sourceRunRoot, runIndex) {
  const source = path.join(path.dirname(sourceRunRoot), `miku-prompt-lint-sessions-${runId}`);
  const destination = path.join(destinationRoot, "session-evidence");
  if (!fs.existsSync(destination)) {
    fs.cpSync(source, destination, { recursive: true, dereference: false, force: false, errorOnExist: true });
  }
  for (const result of runIndex.results) {
    if (result.mode === "activation-metadata") continue;
    const staged = path.join(destination, result.sessionPath, ".agents/skills/igapyon-miku-prompt-lint");
    assert.deepEqual(buildManifest(staged), runIndex.sourceManifest, `${result.caseId}: copied staged Skill changed`);
  }
}

function portableSourceAudit(run, evidencePrefix) {
  const sourceAudit = structuredClone(run.sourceAudit);
  sourceAudit.stagedSkillPath = run.mode === "activation-metadata"
    ? null
    : path.posix.join(evidencePrefix, "session-evidence", run.sessionPath.replaceAll(path.sep, "/"), ".agents/skills/igapyon-miku-prompt-lint");
  return sourceAudit;
}

function readReconciledIndex(filePath) {
  const value = JSON.parse(fs.readFileSync(filePath, "utf8"));
  assert.equal(value.scope, "review-followup");
  assert.equal(value.reconciliation?.parser, "review-followup-observation-v2", "reconcile raw evidence before finalizing");
  return value;
}

function readArtifact(base, ref) {
  assert.ok(ref && typeof ref.path === "string", "artifact reference is missing");
  assert.equal(path.isAbsolute(ref.path), false, "artifact path must be relative");
  const absolute = path.resolve(base, ref.path);
  const relative = path.relative(base, absolute);
  assert.ok(relative && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative),
    "artifact path escapes its run root");
  assert.equal(fs.lstatSync(absolute).isSymbolicLink(), false, "artifact cannot be a symlink");
  const real = fs.realpathSync(absolute);
  assert.ok(real.startsWith(`${fs.realpathSync(base)}${path.sep}`), "artifact realpath escapes its run root");
  const bytes = fs.readFileSync(real);
  assert.equal(sha256(bytes), ref.sha256, `artifact bytes changed: ${ref.path}`);
  return bytes;
}

function gitHead(directory) {
  try { return execFileSync("git", ["rev-parse", "HEAD"], { cwd: directory, encoding: "utf8" }).trim(); }
  catch { return null; }
}
