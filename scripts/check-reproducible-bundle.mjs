#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(fs.readFileSync(path.resolve(repoRoot, "package.json"), "utf8"));
const zipPath = path.resolve(repoRoot, `bundle/igapyon-miku-prompt-lint-skills-${packageJson.version}.zip`);

execFileSync("node", ["scripts/build-skill-bundle-zip.mjs"], { cwd: repoRoot, stdio: "inherit" });
const first = hash(zipPath);
execFileSync("node", ["scripts/build-skill-bundle-zip.mjs"], { cwd: repoRoot, stdio: "inherit" });
const second = hash(zipPath);

if (first !== second) {
  throw new Error(`bundle is not reproducible: ${first} != ${second}`);
}
process.stdout.write(`reproducible bundle: ${first}\n`);

function hash(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}
