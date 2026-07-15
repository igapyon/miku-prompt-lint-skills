#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const repoName = "miku-prompt-lint-skills";
const skillName = "igapyon-miku-prompt-lint";
const bundleRoot = path.resolve(repoRoot, "bundle", repoName);
const sourceSkillRoot = path.resolve(repoRoot, "skills", skillName);
const bundleSkillRoot = path.resolve(bundleRoot, "skills", skillName);

main();

function main() {
  ensureSourceExists(sourceSkillRoot, `skills/${skillName}`);
  execFileSync("node", ["scripts/verify-miku-index.mjs"], {
    cwd: repoRoot,
    stdio: "inherit"
  });

  fs.rmSync(bundleRoot, {
    recursive: true,
    force: true,
    maxRetries: 3,
    retryDelay: 100
  });
  fs.mkdirSync(path.dirname(bundleSkillRoot), { recursive: true });

  fs.cpSync(sourceSkillRoot, bundleSkillRoot, {
    recursive: true,
    filter: shouldCopyBundleEntry
  });
  normalizeMtime(bundleSkillRoot, new Date("1980-01-01T00:00:00Z"));

  process.stdout.write([
    `[build:bundle] generated bundle/${repoName}`,
    "[build:bundle] copy this directory's contents under the agent home root, or copy skills/igapyon-miku-prompt-lint under the skills root",
    "[build:bundle] included:",
    `  - skills/${skillName}`
  ].join("\n"));
  process.stdout.write("\n");
}

function normalizeMtime(dir, timestamp) {
  for (const name of fs.readdirSync(dir).sort(compareUtf16)) {
    const target = path.join(dir, name);
    const stat = fs.statSync(target);
    if (stat.isDirectory()) {
      normalizeMtime(target, timestamp);
    }
    fs.utimesSync(target, timestamp, timestamp);
  }
  fs.utimesSync(dir, timestamp, timestamp);
}

function compareUtf16(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function ensureSourceExists(targetPath, label) {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`missing source directory: ${label}`);
  }
}

function shouldCopyBundleEntry(sourcePath) {
  const name = path.basename(sourcePath);
  if (name === ".DS_Store") {
    return false;
  }
  if (name === "tmp" || name === "output" || name === "state") {
    const relativePath = path.relative(sourceSkillRoot, sourcePath);
    return relativePath.split(path.sep).length > 1;
  }
  return true;
}
