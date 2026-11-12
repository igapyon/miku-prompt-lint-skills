import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateBaseline, validateFixture } from "./lib/review-followup-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = JSON.parse(fs.readFileSync(path.join(root, "tests/fixtures/review-followup.json"), "utf8"));
const baseline = JSON.parse(fs.readFileSync(path.join(root, "tests/fixtures/review-followup-baseline.json"), "utf8"));
const skillRoot = path.join(root, "skills/igapyon-miku-prompt-lint");
const args = process.argv.slice(2);
const evidenceOnly = args.includes("--evidence-only");
const requestedRoot = args.find((value) => value !== "--evidence-only");
if (!baseline.runId && !requestedRoot) throw new Error("Active baseline has no runId.");
const runRoot = path.resolve(requestedRoot ?? path.join(root, "workplace/rule-calibration-results", baseline.runId));
validateFixture(fixture, { skillRoot });
validateBaseline(baseline, { fixture, skillRoot, requireComplete: !evidenceOnly, runRoot, verifyArtifacts: true });
if (evidenceOnly) {
  process.stdout.write(`Verified raw evidence for gate=${baseline.gateStatus}: ${baseline.results.length} cases; hashes and traces match ${runRoot}. Semantic completion is not asserted.\n`);
} else {
  process.stdout.write(`Verified complete-pass: ${baseline.results.length} cases; raw artifacts and hashes match ${runRoot}.\n`);
}
