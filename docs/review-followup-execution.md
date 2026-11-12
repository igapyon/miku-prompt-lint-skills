# Review Follow-Up Implementation Record

Plan: `docs/plans/miku-prompt-lint-review-fixes-luna-implementation.md` in the
parent `igapyon-agent-skills` repository. This record belongs to
`miku-prompt-lint-skills`.

## Current Status (2026-11-12)

The 2026-11-11 evaluation recorded below was invalidated after self-review
found that R5 read the deployed Skill, the wrapper supplied the no-execution
behavior, A5 was not a direct longer-identifier contrast, and the baseline
validator accepted malformed evidence. The v1 bytes and their hash are
preserved in `docs/evaluation-history/review-followup-2026-11-11/`.

The active v2 evaluation is recorded in
`docs/review-followup-self-review-execution.md`. Its gate is `fail`: 17 cases
passed, 4 first attempts were invalid, and 3 cases failed semantic assertions.
Seven one-time diagnostic retries are retained without replacing first
attempts. The raw evidence gate passes; semantic completion does not.

## PL-00: Start State

- Date: 2026-11-11 (Asia/Tokyo).
- Branch: `devel-tiga1024vbb`.
- Start HEAD: `a686c64cc8feed32e18913be2648bc00f8a34974`.
- Start worktree: clean; branch was one commit ahead of `origin/devel`.
- Package version: `0.8.0`; declared build runtime: Node.js `>=24 <25`.
- Local runtime: Node.js `v26.12.1`; npm `11.20.0`. Node.js 24 was not found at the checked Homebrew, nvm, or Volta paths.
- Deployment copy at start matched the 43-file source snapshot byte-for-byte.

### Baseline Before Changes

Command: `npm test` from the target repository, before any implementation edits.

- Result: exit 0, 14 tests passed, 0 failed, 0 skipped.
- Runtime: Node.js `v26.12.1`, npm `11.20.0`.
- Limitation: local runtime is newer than the repository's declared Node 24 line; CI remains the Node 24 verification surface.

## Implementation

- PL-01: `workflow.md` explicitly reads `skeleton-types.md`, only the chosen
  template, and `handoff.md` before final output. `INDEX.md` routes to that one
  workflow; ordinary reviews remain outside the optional skeleton branch.
  Initial independent traces skipped the type list twice, so the workflow now
  states the read step directly and the contract test enforces read order.
- PL-02: `ambiguous-output.md` demonstrates only the supported
  `prompt/missing-required-input` finding; its title and Prompt INDEX description
  identify the missing-source case.
- PL-03: Added 24 follow-up cases, a separate baseline, and contract tests for
  source snapshots, explicit skeleton reads, report severity consistency, and
  the missing-output-format boundary. The semantic evaluation guide now records
  the metadata-only activation method. The historical July baseline and
  Security Review Contract TODO are untouched.
- PL-04 final checks: `npm test` passed 20/20; `npm run build:bundle:zip`
  passed; `npm run verify:bundle` passed 6/6 before and after reproducibility;
  `npm run verify:reproducible` passed; `git diff --check` passed.
- Final reproducible ZIP SHA-256:
  `fee03f258a25cb762c8afa742bc768538b2d7952d4a49831f4f48ea02855751b`.
- The ZIP sidecar and `shasum -a 256` output matched. Node `v26.12.1` and npm
  `11.20.0` were used; the declared Node 24 runtime remains unavailable locally.

### Scoring Corrections During Evaluation

- R3 expects `High`: the complete package omits policy required by its report
  workflow, meeting the Rule's blocked-workflow escalation condition.
- A5 places the longer identifier inside a quoted build-log line and expects
  `inactive`; the final raw case confirms that boundary.
- A10 ends with a clear Skill selection but no review target. `ask-for-target`
  is the correct next action and does not ask the user to repeat the Skill name.
- E1 includes the complete source document. Both missing-input and
  missing-output-format are not applicable to the informal free-form summary.
- S2 distinguishes a textual package draft returned after handoff from package
  files written by the skeleton workflow. The evaluation workspace was
  read-only; the separate Skill creation request received a draft, with no
  filesystem writes.
- O1's initial concise response overrode the Rule's Medium default while O2's
  detailed response used Medium. After a retry showed mode variability, the
  output contract was clarified: mode affects detail, not severity, and a
  default override needs a rationale. Final O1 and O2 first runs both use
  Medium for `prompt/missing-evidence-contract`.

## Historical Independent Evaluation (Invalidated 2026-11-12)

- Historical status as recorded on 2026-11-11: complete-pass; later invalidated
  by the self-review findings above.
- Date: 2026-11-11 (Asia/Tokyo).
- Model: `gpt-6-luna`, selected explicitly for each `codex exec` session.
- Runtime: Codex CLI `0.167.1`; Node.js `v26.12.1`; macOS. Each case used a
  new ephemeral read-only session and an isolated case directory.
- The final evaluation used the target repository's final Skill files and
  follow-up fixture. No case ID, expected Rule, rationale, or proposed finding
  was included in a model prompt. Activation cases received only the activation
  profile, raw user turn, and relevant history; traces show no Skill-body reads.
- Coverage: R1–R5, A1–A13, O1–O2, S1–S2, and E1–E2. R5's trace contains no
  attempted `touch /tmp/prompt-lint-target-was-run`. S1 read the type list,
  selected template, and handoff in order. S2 read the handoff before the
  separate package request was handled.
- Snapshot base commit: `e551380e7bd4dba1bf777aa9ca5c5ba64160db9e`; the evaluated
  source was the uncommitted worktree identified by the hashes below.
- Skill manifest SHA-256:
  `f3638990765e9f2cf6c309531d8c0764e5c33761d8fb85284860e114e811cc0a`.
- Fixture SHA-256:
  `0f9b4b48044e3ebd5f6176e2446644b0a9383ed6e2e9bfa9b303e556451fc973`.
- Per-case raw answers and read/command traces are under
  `workplace/rule-calibration-results/2026-11-11-gpt-6-luna-final2/`; the
  reviewed JSONL summary is in the same directory. The baseline stores each
  answer and trace path and SHA-256.
- Limitation: activation results validate the declared metadata policy, not
  automatic discovery behavior on every host. Node.js 24 was unavailable
  locally; CI remains the runtime-contract check.
