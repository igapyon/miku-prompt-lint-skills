import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const skillRoot = path.resolve(ROOT, "skills", "igapyon-miku-prompt-lint");
const ruleFiles = [
  "references/prompt/anti-patterns.md",
  "references/context/anti-patterns.md",
  "references/agent-skills/anti-patterns.md",
  "references/repository/anti-patterns.md"
];
const allowedChangeTypes = new Set([
  "correctness", "security", "reliability", "reproducibility", "maintainability", "optional polish"
]);

test("bundled and repository Markdown has closed fences and resolvable relative links", () => {
  const files = [...markdownFiles(skillRoot), path.resolve(ROOT, "README.md"), ...markdownFiles(path.resolve(ROOT, "docs"))];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    assert.equal(hasClosedFences(text), true, `unclosed fence: ${relative(file)}`);
    for (const target of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const href = target[1].split("#")[0];
      if (!href || /^[a-z]+:/i.test(href) || href.startsWith("#")) continue;
      assert.equal(fs.existsSync(path.resolve(path.dirname(file), decodeURI(href))), true,
        `broken link in ${relative(file)}: ${href}`);
    }
  }
});

test("active rules have unique IDs and the shared Rule contract", () => {
  const ids = new Set();
  for (const file of ruleFiles) {
    const text = fs.readFileSync(path.resolve(skillRoot, file), "utf8");
    const entries = ruleEntries(text);
    assert.ok(entries.length > 0, `no rules in ${file}`);
    for (const { id, body } of entries) {
      assert.equal(ids.has(id), false, `duplicate Rule ID: ${id}`);
      ids.add(id);
      for (const required of [
        "Default severity:", "Applies when:", "Does not apply when:", "Evidence required:",
        "Target/runtime dependencies:", "Overlap/precedence:", "Why this is a problem:", "Recommended fix:"
      ]) {
        assert.match(body, new RegExp(escapeRegExp(required)), `${id} lacks ${required}`);
      }
    }
  }
});

test("examples use the canonical finding fields, active Rule IDs, and valid change types", () => {
  const defaults = activeRuleDefaults();
  for (const file of markdownFiles(path.resolve(skillRoot, "examples"))) {
    const text = fs.readFileSync(file, "utf8");
    const findings = text.split(/^\- `Level`:/m).slice(1);
    assert.ok(findings.length > 0, `${relative(file)} has no findings`);
    for (const finding of findings) {
      for (const field of [
        "`Severity`:", "`Confidence`:", "`Applicability`:", "`Category`:", "`Issue`:", "`Rule`:",
        "`Evidence`:", "`Why it matters`:", "`Suggestion`:", "`Change type`:"
      ]) {
        assert.match(finding, new RegExp(escapeRegExp(field)), `${relative(file)} lacks ${field}`);
      }
      assert.match(finding, /`Applicability`:\s*Applicable/, `${relative(file)} must state Applicable for a finding`);
      const rule = finding.match(/`Rule`:\s*([^\n]+)/)?.[1].trim();
      assert.ok(rule && defaults.has(rule), `${relative(file)} has unknown Rule ID: ${rule}`);
      const severity = finding.match(/`Severity`:\s*([^\n]+)/)?.[1].trim();
      assert.ok(["Low", "Medium", "High"].includes(severity), `${relative(file)} has invalid severity`);
      const changeType = finding.match(/`Change type`:\s*([^\n]+)/)?.[1].trim();
      assert.ok(allowedChangeTypes.has(changeType), `${relative(file)} has invalid Change type: ${changeType}`);
      if (severity !== defaults.get(rule)) {
        assert.match(finding, /`Severity rationale`:/, `${relative(file)} changes default severity for ${rule} without rationale`);
      }
    }
  }
});

function activeRuleDefaults() {
  const defaults = new Map();
  for (const file of ruleFiles) {
    for (const { id, body } of ruleEntries(fs.readFileSync(path.resolve(skillRoot, file), "utf8"))) {
      defaults.set(id, body.match(/Default severity:\s*`?(Low|Medium|High)`?/)?.[1]);
    }
  }
  return defaults;
}

function ruleEntries(text) {
  return [...text.matchAll(/^## ((?:prompt|context|agent-skill|repository)\/[a-z0-9-]+)\n([\s\S]*?)(?=^## |(?![\s\S]))/gm)]
    .map((match) => ({ id: match[1], body: match[2] }));
}

function markdownFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return markdownFiles(absolute);
    return entry.name.endsWith(".md") ? [absolute] : [];
  });
}

function hasClosedFences(text) {
  let marker;
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*(`{3,}|~{3,})/);
    if (!match) continue;
    if (!marker) marker = match[1][0];
    else if (match[1][0] === marker) marker = undefined;
  }
  return !marker;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function relative(file) {
  return path.relative(ROOT, file);
}
