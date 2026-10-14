# Development Notes

## Initial Creation Record

- Date: 2026-06-20
- Repository: `miku-prompt-lint-skills`
- Installed skill name: `igapyon-miku-prompt-lint`
- Main workflow: `igapyon-miku-soft-developer` Agent Skills workflow
- Maturity pattern: content-only / handoff-only Agent Skill
- Product direction: Prompt, Context, Agent Skill, and Repository/Harness Review

## Reference Check

No local `workplace/` sister checkout was present at initial creation. The
initial repository shape was based on the bundled
`igapyon-miku-soft-developer` Agent Skills starter assets and the shared
Agent Skills design reference.

Decisions adopted:

- keep canonical skill source under `skills/igapyon-miku-prompt-lint/`
- keep `SKILL.md` lean and move review criteria into `references/`
- include bundle and zip scripts from the miku-soft Agent Skills starter shape
- use direct task-based references and scoped search; no root index contract is required
- separate source tests from verification of one already-built bundle and zip
- generate deterministic zip files with a SHA-256 sidecar
- model the review surface as Prompt, Context, Agent Skill, and Repository/Harness levels

Decisions rejected:

- no `runtime/` directory, Java setup, or CLI smoke test because this skill is
  intentionally content-only
- no upstream product runtime anchor because this repository is the Agent Skill
  product, not a companion wrapper over a CLI application

## Current Verification And Release Flow

- Node.js 24 is the supported build runtime.
- `npm test` runs non-mutating source and content-contract checks.
- `npm run build` creates one deterministic bundle/zip pair and verifies that
  exact pair.
- `npm run verify:reproducible` rebuilds in CI and compares SHA-256 values.
- pull requests and pushes run CI before merge.
- a `v*` tag creates a draft GitHub Release with the verified zip and checksum;
  a human publishes the draft after review.

## Index Contract

The package uses `SKILL.md` and task-based references for discovery. It does not
declare a `mikuIndex` contract or generate a root index.

## Rule Calibration

The Skill is content-only, so automated tests validate fixture structure and
evidence references; they do not establish Rule applicability or measure LLM
accuracy. `tests/fixtures/rule-calibration.json` uses schema version 2 and has a
concrete positive and counterexample artifact for every active Rule. Each case
scores its focal Rule, and only an explicit `expectedNotApplicable` case counts
as its counterexample. `Not assessed` and `suppressed` are not counterexamples.
An unlisted Rule has no disposition and must not be treated as non-applicable.
Positive evidence must occur in the raw artifact;
the structural check does not prove that the evidence semantically supports the
finding. Manual and ownership fixtures retain schema version 1.

Before a release that changes Rule semantics, run an independent blind
evaluation using only each raw artifact, target context, and the normal Skill
invocation. Keep case IDs, rationales, expected findings, dispositions, and
fixes hidden until the response is complete. Record the observed evaluation
separately. Existing baseline records are historical and must not be reused as
results for rewritten cases.
