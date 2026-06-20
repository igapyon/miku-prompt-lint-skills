#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const skillRoot = path.resolve(repoRoot, "skills", "igapyon-miku-prompt-lint");
const outputPath = path.resolve(skillRoot, "index.json");

const entries = [];

walk(skillRoot);
entries.sort((a, b) => compareUtf16(a.path, b.path));

const index = {
  generatedBy: "scripts/generate-skill-index.mjs",
  skill: "igapyon-miku-prompt-lint",
  files: entries
};

fs.writeFileSync(outputPath, `${JSON.stringify(index, null, 2)}\n`);

function walk(dir) {
  for (const name of fs.readdirSync(dir).sort(compareUtf16)) {
    if (name === ".DS_Store" || name === "index.json") {
      continue;
    }
    const absolutePath = path.join(dir, name);
    const stat = fs.statSync(absolutePath);
    if (stat.isDirectory()) {
      walk(absolutePath);
      continue;
    }
    const relativePath = path.relative(skillRoot, absolutePath).split(path.sep).join("/");
    entries.push({
      path: relativePath,
      bytes: stat.size
    });
  }
}

function compareUtf16(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}
