import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makePendingBaseline, sha256 } from "./lib/review-followup-contract.mjs";
import { REVIEW_FOLLOWUP_WRAPPER } from "./lib/review-followup-wrapper.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const activePath = path.join(root, "tests/fixtures/review-followup-baseline.json");
const archiveRoot = path.join(root, "docs/evaluation-history/review-followup-2026-11-11");
const archivePath = path.join(archiveRoot, "baseline-v1.json");
const skillRoot = path.join(root, "skills/igapyon-miku-prompt-lint");
const fixture = JSON.parse(fs.readFileSync(path.join(root, "tests/fixtures/review-followup.json"), "utf8"));
const previousBytes = fs.readFileSync(activePath);
const previous = JSON.parse(previousBytes.toString("utf8"));

if (previous.schemaVersion !== 1 || previous.gateStatus !== "complete-pass") {
  throw new Error("Expected the invalidated v1 complete-pass baseline before archiving.");
}
const previousHash = sha256(previousBytes);
const archiveReadme = [
  "# Invalidated review-followup baseline",
  "",
  "This is the byte-preserved v1 baseline from 2026-11-11. A later self-review found that R5 read the deployed Skill, the wrapper supplied the expected no-execution behavior, A5 no longer tested a direct longer identifier, and the baseline validator accepted malformed evidence.",
  "",
  `SHA-256: \`${previousHash}\``,
  "",
  "Its `complete-pass` is a historical value. It is not valid evidence for the active evaluation gate.",
  ""
].join("\n");
if (fs.existsSync(archiveRoot)) {
  const entries = fs.readdirSync(archiveRoot).sort();
  if (entries.join("\n") !== "README.md\nbaseline-v1.json") {
    throw new Error(`History already exists with unexpected contents: ${archiveRoot}`);
  }
  const archivedBytes = fs.readFileSync(archivePath);
  const archivedReadme = fs.readFileSync(path.join(archiveRoot, "README.md"), "utf8");
  if (!archivedBytes.equals(previousBytes) || archivedReadme !== archiveReadme) {
    throw new Error(`History already exists with different contents: ${archiveRoot}`);
  }
} else {
  fs.mkdirSync(archiveRoot, { recursive: true });
  fs.writeFileSync(archivePath, previousBytes, { flag: "wx" });
  fs.writeFileSync(path.join(archiveRoot, "README.md"), archiveReadme, { flag: "wx" });
}

const pending = makePendingBaseline({
  fixture,
  skillRoot,
  previousBaselineHash: previousHash,
  wrapperSha256: sha256(REVIEW_FOLLOWUP_WRAPPER)
});
const pendingPath = `${activePath}.tmp`;
fs.writeFileSync(pendingPath, `${JSON.stringify(pending, null, 2)}\n`, { flag: "wx" });
fs.renameSync(pendingPath, activePath);
process.stdout.write(`Archived v1 baseline (${previousHash}) and reset the active gate to pending.\n`);
