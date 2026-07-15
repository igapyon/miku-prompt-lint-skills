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
- include a generated `index.json` plus a non-mutating freshness check
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
- `npm run build` checks the index, creates one deterministic bundle/zip pair,
  and verifies that exact pair.
- `npm run verify:reproducible` rebuilds in CI and compares SHA-256 values.
- pull requests and pushes run CI before merge.
- a `v*` tag creates a draft GitHub Release with the verified zip and checksum;
  a human publishes the draft after review.

## Index Contract

`package.json` declares the repository's `mikuIndex` contract. The freshness
check is intentionally conditional: it validates an existing index, skips an
optional absent index, and fails when a required index is absent. It never
creates or rewrites an index. Use `miku-indexgen` only to refresh an index that
already exists.

## Rule Calibration

The Skill is content-only, so automated tests validate contracts rather than
claiming to measure LLM quality. `tests/fixtures/rule-calibration.json` records
machine-readable positive, non-applicable, and ownership-boundary cases for
every active Rule. Before a release that changes Rule semantics, perform an
independent manual review against these fixtures and record the result in the
release review; do not encode expected answers into the reviewed artifact.
