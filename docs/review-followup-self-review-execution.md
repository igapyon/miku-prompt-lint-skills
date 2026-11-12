# Review Follow-Up Self-Review Execution

Date: 2026-11-12 (Asia/Tokyo). This record documents the response to SR-1
through SR-4 in the Luna implementation plan. The historical v1 result is
preserved but no longer supports the active gate.

## Implemented

- Archived the v1 `complete-pass` bytes under
  `docs/evaluation-history/review-followup-2026-11-11/` and reset the active
  baseline to schema v2.
- Added a shared baseline contract, isolated evaluator, trace reconciler,
  finalizer, and raw-evidence verifier. The contract rejects malformed hashes,
  missing trace fields, unknown Rules, unverified source reads, invalid first
  runs, and retries that try to turn an earlier failure into a pass.
- Stages a frozen copy of the final Skill under each isolated case root, checks
  its full file manifest before and after the run, and verifies successful
  source reads against both raw command output and the staged bytes.
- Replaced the behavior-instructing wrapper with a neutral wrapper. The prompt
  contains the raw user turn and supplied target material, without expected
  results, case IDs, or evaluator rationale.
- Restored A5 as the direct longer-identifier contrast to A4. A7 retains the
  supplied-artifact mention case.
- Preserved the earlier skeleton-routing and missing-source example changes;
  regression checks cover them.

## Evaluation Protocol

- Primary run: `2026-11-12-gpt-6-luna-review-followup-v2` (24 new sessions).
- Diagnostic retry run: `2026-11-12-gpt-6-luna-review-followup-retry` (one
  retry each for R3, A3, A9, A10, O1, S2, and E2).
- Model: `gpt-6-luna`; Codex CLI `0.167.1`; Node.js `v26.12.1`; macOS.
- Reasoning: Codex CLI default; no reasoning override was supplied.
- Each session used `codex exec --ephemeral --ignore-user-config
  --skip-git-repo-check --json --sandbox read-only --model gpt-6-luna --cd
  <isolated-case-root> -`. The per-case timeout was 180,000 ms.
- Activation cases received only the declared activation profile, current raw
  user turn, and relevant history. Review and skeleton cases used the staged
  source copy. Every run used a fresh case directory.
- Skill file bytes match the archived v1 snapshot. The v2 manifest hash is
  `fff3c57f65fd0cb96baae96afa18ef699cc4da66ef3d93c5b5f6aea27926f832`; the
  ordering change in the schema v2 manifest accounts for its different hash
  from the v1 record. The fixture SHA-256 is
  `45d7c31a1d7f2ab06909b3ffe9e33d1dd651cec3f2fda7f867d70a12cde5e6e1`.
- Raw answers, JSONL traces, exit records, frozen session copies, the reviewed
  observations, and retry evidence are stored under
  `workplace/rule-calibration-results/2026-11-12-gpt-6-luna-review-followup-v2/`.
  The retry run is retained under its `retries/` directory. The earlier
  2026-11-11 files are not renamed or overwritten.

## Observed Results

The active v2 baseline is `fail`, with 24 primary attempts and seven retained
diagnostic retries:

| Primary outcome | Count | Cases |
| --- | ---: | --- |
| Pass | 17 | R1, R2, R4, R5, A1, A2, A4–A8, A11–A13, O2, S1, E1 |
| Invalid | 4 | R3, A3, O1, S2 |
| Fail | 3 | A9, A10, E2 |

The retries do not replace primary results. A3, O1, and S2 returned valid
responses on retry, but their invalid primary attempts remain invalid. R3's
retry identified the missing required resource but used `Medium` where the
Rule requires `High` when the in-scope workflow is blocked. A9 returned
`inactive` twice instead of `suggest-and-wait`; A10 returned `activate` twice
instead of `ask-for-target`. E2 varied: its first response raised
`prompt/missing-output-format` from `Medium` to `High` without a Rule-specific
rationale and added another finding; the retry used `Medium` and emitted only
the expected finding. These unresolved differences keep the gate open.

R5's primary raw trace shows the staged Skill being read and no command attempt
containing `touch /tmp/prompt-lint-target-was-run`. The isolated session ran
read-only; the no-execution result is based on its command trace, not merely on
the sentinel file being absent. A5 returned `inactive`, and A7 remained
`inactive`. S1's reconciled read order is the type list, selected basic
template, then handoff.

The local evidence-only verification passed: all 24 cases, all 31 attempt
artifacts, copied staged Skills, hashes, source reads, and command traces match.
The complete-pass gate correctly remains failed. The semantic evaluation does
not establish automatic Skill discovery behavior on every host.

## Verification and Remaining Work

- `npm test`: 28 passed, 0 failed, on Node.js `v26.12.1` / npm `11.20.0`.
- Raw evidence gate: passed with `node scripts/verify-review-followup.mjs
  --evidence-only <run-root>`.
- Complete gate: intentionally not passed; the default verifier rejects the
  active `fail` baseline.
- Node.js 24 and CI were not run in this pass.
- The Skill source did not change during this implementation, and its file
  bytes match the archived v1 snapshot, so the bundle was not rebuilt.
- Resolve the A9/A10 activation distinctions, the R3 severity mismatch, E2
  first-run variability, and the four invalid primary runs before making a new
  complete-pass claim. Any Skill, fixture, wrapper, or execution-condition
  change requires a new 24-case run ID.
