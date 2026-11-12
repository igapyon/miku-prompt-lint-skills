import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildManifest, canonicalJson, sha256 } from "./lib/review-followup-contract.mjs";
import { parseObservation } from "./lib/review-followup-observation.mjs";
import { auditSkillReads, finalAgentMessage, parseCodexEvents } from "./lib/review-followup-runner.mjs";
import { REVIEW_FOLLOWUP_WRAPPER } from "./lib/review-followup-wrapper.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = JSON.parse(fs.readFileSync(path.join(root, "tests/fixtures/review-followup.json"), "utf8"));
const skillRoot = path.join(root, "skills/igapyon-miku-prompt-lint");
const indexPath = path.resolve(process.argv[2] ?? "");
if (!process.argv[2]) throw new Error("Usage: node scripts/reconcile-review-followup.mjs <run-index.json>");
const runRoot = path.dirname(indexPath);
const sourceIndexBytes = fs.readFileSync(indexPath);
const index = JSON.parse(sourceIndexBytes.toString("utf8"));
const sessionsRoot = path.join(path.dirname(runRoot), `miku-prompt-lint-sessions-${index.runId}`);
const cases = new Map(fixture.cases.map((item) => [item.id, item]));
const timeoutValues = new Set();

assert.equal(index.scope, "review-followup");
assert.equal(index.fixtureSha256, sha256(canonicalJson(fixture)));
assert.equal(index.sourceManifestSha256, sha256(canonicalJson(buildManifest(skillRoot))));
assert.equal(index.wrapperSha256, sha256(REVIEW_FOLLOWUP_WRAPPER));

for (const result of index.results) {
  const item = cases.get(result.caseId);
  assert.ok(item, `unknown case ${result.caseId}`);
  const inputBytes = readArtifact(runRoot, result.artifacts.input);
  const promptBytes = readArtifact(runRoot, result.artifacts.prompt);
  const responseBytes = readArtifact(runRoot, result.artifacts.response);
  const traceBytes = readArtifact(runRoot, result.artifacts.trace);
  const exitBytes = readArtifact(runRoot, result.artifacts.exit);
  const rawInput = JSON.parse(inputBytes.toString("utf8"));
  const prompt = promptBytes.toString("utf8");
  const response = responseBytes.toString("utf8");
  assert.equal(canonicalJson(rawInput), canonicalJson(item.input), `${item.id}: raw input differs from fixture`);
  assert.equal(sha256(canonicalJson(rawInput)), result.inputSha256, `${item.id}: input hash mismatch`);
  assert.equal(sha256(promptBytes), result.promptSha256, `${item.id}: prompt hash mismatch`);
  assert.ok(prompt.startsWith(REVIEW_FOLLOWUP_WRAPPER), `${item.id}: wrapper mismatch`);
  assert.ok(prompt.includes(JSON.stringify(item.input.user)), `${item.id}: prompt omits raw user turn`);
  assert.equal(prompt.includes(item.id), false, `${item.id}: case ID leaked into prompt`);
  assert.equal(prompt.includes(JSON.stringify(item.expected)), false, `${item.id}: expected result leaked into prompt`);
  assert.equal(item.rationale ? prompt.includes(JSON.stringify(item.rationale)) : false, false,
    `${item.id}: rationale leaked into prompt`);

  const events = parseCodexEvents(traceBytes.toString("utf8"));
  const sessionDir = path.resolve(sessionsRoot, result.sessionPath);
  const relativeSession = path.relative(sessionsRoot, sessionDir);
  assert.ok(relativeSession && !relativeSession.startsWith(`..${path.sep}`) && !path.isAbsolute(relativeSession),
    `${item.id}: session path escapes the session root`);
  const stagedSkill = item.mode === "activation-metadata"
    ? null
    : path.join(sessionDir, ".agents/skills/igapyon-miku-prompt-lint");
  const stagedManifest = stagedSkill ? buildManifest(stagedSkill) : [];
  if (stagedSkill) assert.deepEqual(stagedManifest, index.sourceManifest, `${item.id}: staged Skill differs from final source`);
  const sourceAudit = auditSkillReads(events, {
    sessionDir,
    stagedSkill,
    manifest: stagedManifest,
    mode: item.mode
  });
  const exit = JSON.parse(exitBytes.toString("utf8"));
  timeoutValues.add(exit.timeoutMs ?? 180_000);
  const parsed = parseObservation(item, finalAgentMessage(events), sourceAudit);
  const issues = [];
  if (exit.exitCode !== 0 || exit.timedOut) issues.push("Codex process did not finish successfully.");
  if (sourceAudit.status !== "verified") issues.push(...sourceAudit.issues);
  issues.push(...parsed.notes);
  Object.assign(result, {
    status: issues.length ? "invalid" : "unscored",
    sourceAudit,
    observed: parsed.observed,
    evaluationNotes: issues
  });
}

assert.equal(timeoutValues.size, 1, "run cases used different timeouts");
index.caseTimeoutMs = [...timeoutValues][0];
index.requestedReasoning ??= "Codex CLI default; no reasoning override was supplied";

index.reconciliation = {
  parser: "review-followup-observation-v2",
  sourceIndexSha256: sha256(sourceIndexBytes),
  reconciledAt: new Date().toISOString()
};
const outputPath = path.join(runRoot, "index.reconciled-v2.json");
fs.writeFileSync(outputPath, `${JSON.stringify(index, null, 2)}\n`, { flag: "wx" });
process.stdout.write(`Reconciled ${index.results.length} raw cases to ${outputPath}\n`);

function readArtifact(base, ref) {
  assert.ok(ref && typeof ref.path === "string", "artifact reference is missing");
  assert.equal(path.isAbsolute(ref.path), false, "artifact path must be relative");
  const absolute = path.resolve(base, ref.path);
  const relative = path.relative(base, absolute);
  assert.ok(relative && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative),
    "artifact path escapes the run root");
  assert.equal(fs.lstatSync(absolute).isSymbolicLink(), false, "artifact cannot be a symlink");
  const real = fs.realpathSync(absolute);
  assert.ok(real.startsWith(`${fs.realpathSync(base)}${path.sep}`), "artifact realpath escapes the run root");
  const bytes = fs.readFileSync(real);
  assert.equal(sha256(bytes), ref.sha256, `artifact bytes changed: ${ref.path}`);
  return bytes;
}
