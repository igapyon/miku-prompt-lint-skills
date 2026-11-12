import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { buildManifest, canonicalJson, sha256 } from "./lib/review-followup-contract.mjs";
import { parseObservation } from "./lib/review-followup-observation.mjs";
import { REVIEW_FOLLOWUP_WRAPPER } from "./lib/review-followup-wrapper.mjs";
import { auditSkillReads, codexArgumentTemplate, finalAgentMessage, parseCodexEvents, renderCasePrompt, runCodex } from "./lib/review-followup-runner.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = path.join(root, "tests/fixtures/review-followup.json");
const skillRoot = path.join(root, "skills/igapyon-miku-prompt-lint");
const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const runId = process.argv[2] ?? `${new Date().toISOString().replace(/[:.]/g, "-")}-gpt-6-luna-rf2`;
const runBase = path.resolve(process.argv[3] ?? os.tmpdir());
const selectedCaseIds = process.argv.slice(4);
const runRoot = path.join(runBase, `miku-prompt-lint-results-${runId}`);
const sessionsRoot = path.join(runBase, `miku-prompt-lint-sessions-${runId}`);
const timeoutMs = Number(process.env.PROMPT_LINT_CASE_TIMEOUT_MS ?? 180_000);
const expectedModel = "gpt-6-luna";

assert.match(runId, /^[A-Za-z0-9][A-Za-z0-9._-]{0,100}$/);
assert.equal(new Set(selectedCaseIds).size, selectedCaseIds.length, "case selectors must be unique");
for (const caseId of selectedCaseIds) assert.ok(fixture.cases.some(({ id }) => id === caseId), `unknown case selector: ${caseId}`);
assert.equal(fs.existsSync(runRoot), false, `run already exists: ${runRoot}`);
assert.equal(fs.existsSync(sessionsRoot), false, `session root already exists: ${sessionsRoot}`);
fs.mkdirSync(path.join(runRoot, "cases"), { recursive: true });
fs.mkdirSync(path.join(sessionsRoot, "sessions"), { recursive: true });

const originalManifest = buildManifest(skillRoot);
const wrapper = REVIEW_FOLLOWUP_WRAPPER;
const wrapperSha256 = sha256(wrapper);
const selectedCases = selectedCaseIds.length
  ? fixture.cases.filter(({ id }) => selectedCaseIds.includes(id))
  : fixture.cases;
fs.writeFileSync(path.join(runRoot, "wrapper.txt"), wrapper);
fs.writeFileSync(path.join(runRoot, "fixture-snapshot.json"), JSON.stringify({ schemaVersion: fixture.schemaVersion, cases: fixture.cases.map(({ id, mode, input }) => ({ id, mode, input })) }, null, 2));
const index = [];
for (const [indexInRun, item] of selectedCases.entries()) {
  process.stdout.write(`[${indexInRun + 1}/${selectedCases.length}] ${item.id}\n`);
  const evidenceRoot = path.join(runRoot, "cases", item.id);
  const sessionDir = path.join(sessionsRoot, "sessions", crypto.randomUUID());
  fs.mkdirSync(evidenceRoot, { recursive: true });
  fs.mkdirSync(sessionDir, { recursive: true });

  const context = stageCase(item, sessionDir, evidenceRoot, originalManifest);
  const prompt = `${wrapper}${renderCasePrompt({ item, activationProfile: fixture.activationProfile, stagedSkillPath: context.stagedSkill })}`;
  fs.writeFileSync(path.join(evidenceRoot, "raw-input.json"), `${canonicalJson(item.input)}\n`);
  fs.writeFileSync(path.join(evidenceRoot, "prompt.txt"), prompt);
  const startedAt = new Date().toISOString();
  const started = await runCodex({ prompt, cwd: sessionDir, timeoutMs, model: expectedModel });
  const endedAt = new Date().toISOString();
  fs.writeFileSync(path.join(evidenceRoot, "stdout.jsonl"), started.stdout);
  fs.writeFileSync(path.join(evidenceRoot, "stderr.log"), started.stderr);
  fs.writeFileSync(path.join(evidenceRoot, "exit.json"), JSON.stringify({
    startedAt, endedAt, modelRequested: expectedModel, exitCode: started.exitCode,
    signal: started.signal, timedOut: started.timedOut, timeoutMs,
    runtime: `Codex CLI ${codexVersion()}; Node.js ${process.version}; ${process.platform}`
  }, null, 2));

  const events = parseCodexEvents(started.stdout);
  const finalText = finalAgentMessage(events);
  fs.writeFileSync(path.join(evidenceRoot, "answer.txt"), finalText);
  const sourceAudit = auditSkillReads(events, { sessionDir, stagedSkill: context.stagedSkill, manifest: context.stagedManifest, mode: item.mode });
  if (context.stagedSkill) {
    try { assert.deepEqual(buildManifest(context.stagedSkill), originalManifest); }
    catch { sourceAudit.issues.push("The staged Skill changed during evaluation."); sourceAudit.status = "unverifiable"; }
  }
  const parsed = parseObservation(item, finalText, sourceAudit);
  const issue = [];
  if (started.exitCode !== 0 || started.timedOut) issue.push("Codex process did not finish successfully.");
  if (sourceAudit.status !== "verified") issue.push(...sourceAudit.issues);
  const status = issue.length || parsed.notes.length ? "invalid" : "unscored";
  index.push({
    caseId: item.id,
    mode: item.mode,
    status,
    runtime: `Codex CLI ${codexVersion()}; Node.js ${process.version}; ${process.platform}`,
    model: expectedModel,
    inputSha256: sha256(canonicalJson(item.input)),
    promptSha256: sha256(prompt),
    sourceManifestSha256: sha256(canonicalJson(originalManifest)),
    stagedSourceManifestSha256: sha256(canonicalJson(context.stagedManifest)),
    artifacts: {
      input: artifactRef(evidenceRoot, runRoot, "raw-input.json"),
      prompt: artifactRef(evidenceRoot, runRoot, "prompt.txt"),
      response: artifactRef(evidenceRoot, runRoot, "answer.txt"),
      trace: artifactRef(evidenceRoot, runRoot, "stdout.jsonl"),
      stderr: artifactRef(evidenceRoot, runRoot, "stderr.log"),
      exit: artifactRef(evidenceRoot, runRoot, "exit.json")
    },
    sourceAudit,
    observed: parsed.observed,
    evaluationNotes: [...issue, ...parsed.notes],
    sessionPath: path.relative(sessionsRoot, sessionDir).split(path.sep).join("/")
  });
}

assert.deepEqual(buildManifest(skillRoot), originalManifest, "source Skill changed during evaluation");
fs.writeFileSync(path.join(runRoot, "index.json"), JSON.stringify({
  schemaVersion: 2,
  scope: "review-followup",
  runId,
  createdAt: new Date().toISOString(),
  requestedModel: expectedModel,
  requestedReasoning: "Codex CLI default; no reasoning override was supplied",
  caseTimeoutMs: timeoutMs,
  runtime: `Codex CLI ${codexVersion()}; Node.js ${process.version}; ${process.platform}`,
  fixtureSha256: sha256(canonicalJson(fixture)),
  sourceManifest: originalManifest,
  sourceManifestSha256: sha256(canonicalJson(originalManifest)),
  wrapperSha256,
  codexArguments: codexArgumentTemplate({ model: expectedModel }),
  results: index
}, null, 2));
process.stdout.write(`Raw independent runs saved under ${runRoot}\n`);
process.stdout.write("Cases are unscored until each raw answer and source audit is reviewed.\n");
if (selectedCaseIds.length) process.stdout.write(`Selected cases only: ${selectedCaseIds.join(", ")}\n`);

function stageCase(item, sessionDir, evidenceRoot, sourceManifest) {
  let stagedSkill = null;
  if (item.mode !== "activation-metadata") {
    stagedSkill = path.join(sessionDir, ".agents/skills/igapyon-miku-prompt-lint");
    fs.mkdirSync(path.dirname(stagedSkill), { recursive: true });
    fs.cpSync(skillRoot, stagedSkill, { recursive: true, dereference: false, errorOnExist: true, force: false });
    const stagedManifest = buildManifest(stagedSkill);
    assert.deepEqual(stagedManifest, sourceManifest, "staged source bytes do not match the final source");
    return { stagedSkill, stagedManifest };
  }
  return { stagedSkill: null, stagedManifest: [] };
}

function artifactRef(absolute, rootDir, name) {
  return { path: path.relative(rootDir, path.join(absolute, name)).split(path.sep).join("/"), sha256: sha256(fs.readFileSync(path.join(absolute, name))) };
}

function codexVersion() {
  try {
    return execFileSync(process.env.CODEX_BIN ?? "codex", ["--version"], { encoding: "utf8", timeout: 2_000 }).trim();
  } catch { return "unknown"; }
}
