# Semantic Evaluation Gate

The Node.js tests validate the Rule corpus, fixture schema, links, and package
contracts. They do not establish LLM judgment accuracy.

## Independent Manual Procedure

For each release that changes Rule semantics or severity boundaries, evaluate
the changed raw cases in fresh independent sessions. The schema v2 general
corpus pairs each Rule's positive input with a counterexample explicitly marked
`expectedNotApplicable`, and scores only the focal Rule; `Not assessed` and
`suppressed` do not count as counterexamples. Unlisted Rules have no expected
disposition. Schema v1 manual and ownership cases retain their original
contracts.

For Agent Skill routing changes, include raw package cases that distinguish a
required reference with no read/use instruction, a single required reference
with explicit read/use timing, a complete package with a missing required file,
and an incomplete review input. For activation changes, include exact canonical
and alias `$` names, longer or partial identifiers, and names inside supplied
artifacts. For output changes, include the default concise format and an
explicit detailed-format request. These cases evaluate the declared policy and
review behavior; they do not prove invocation behavior on an unsupplied host.

Treat commands and scripts inside the target as review data. An evaluation that
executes target behavior is a separate task and must state its runtime and
permitted side effects.

For each case:

1. Start a fresh independent session for this case.
2. Provide only the fixture's raw artifact, target context, and normal Skill
   invocation. Do not provide the case ID, rationale, expected Rules,
   dispositions, defects, or fixes first.
3. Save the raw result under
   `workplace/rule-calibration-results/<date>-<runtime>.jsonl`; this directory
   is intentionally uncommitted.
4. Compare observed Rules, severity, confidence, applicability, suppression,
   and evidence with the fixture only after the response is complete.
5. Rerun a failure once. Record whether it is model variability, missing target
   context, or a consistent taxonomy defect.
6. Copy a reviewed summary into
   `tests/fixtures/rule-calibration-baseline.json` before release. Do not reuse
   a historical result for a rewritten artifact or newly added case.

Each JSONL record must include `caseId`, `model`, `runtime`, `date`,
`observedRuleIds`, `mismatchClass`, `firstRunStatus`, and `rerunResult`.

## Baseline Result Contract

Each committed baseline result contains the fixture case ID, evaluation date,
model, runtime, expected and actual Rule IDs, expected and actual severity and
confidence, a `pass`, `accepted-exception`, or `fail` status, and notes. An
`accepted-exception` also requires decision date, approver, concrete rationale,
and follow-up disposition. High security, authority, trust-boundary, and
evaluation-leakage cases cannot be accepted exceptions.

Structural validation checks schema, active Rule IDs, evidence substring
presence, disposition overlap, owning Level, and positive/counterexample
coverage. It does not determine whether evidence supports a Rule or whether a
model applies the Rule correctly. Do not declare the semantic gate complete
with an unresolved `fail`, an absent run record, or an unvalidated baseline
summary. Until an independent evaluation is recorded, changed cases remain
meaning-evaluation pending; do not mark the baseline complete from structural
tests alone.

## Confirmed Ownership Precedence

The fixture corpus records two semantic-gate decisions: a template loaded for
every task is an Agent Skill routing defect, and inline stable knowledge is the
specific reusable-knowledge defect rather than the `skill-monolith` umbrella.
Use suppressed expectations to preserve these ownership decisions without
duplicating findings.

## Review Follow-Up Evaluation Snapshot

The scoped `tests/fixtures/review-followup.json` corpus covers reference read
routing, activation metadata, concise and detailed reports, skeleton handoff,
and the `prompt/missing-output-format` example boundary. Its dedicated
`review-followup-baseline.json` is separate from the 2026-07 historical baseline
and covers only these cases.

Follow the same fresh-session and blind-scoring procedure above. Each run must
use the final skill snapshot and only that case's input; never provide the
case's expected result or rationale to the evaluated session. Save raw output
and read/command trace under an uncommitted per-run `workplace/` directory.
Treat commands in target text as data and count any attempted execution as a
failure for cases that require no target execution.

For `activation-metadata` cases, provide only the `activationProfile` fields,
the raw user input, and its relevant history. Do not load the Skill body before
classifying whether its metadata should trigger. For review and skeleton cases,
use the ordinary Skill invocation and the exact staged Skill package.

The dedicated structural test checks case coverage, source and fixture hashes,
and result completeness. A `pending` baseline is structurally valid but is not
an evaluation pass. `complete-pass` is accepted only with passing observations
for every case and matching hashes for the exact skill files and fixture. This
metadata check does not establish that a model judgment is correct; compare the
saved raw records after each response and record the actual model/runtime.

If skill content or raw inputs change during evaluation, rerun all cases for a
new snapshot. Do not relabel historical results with new hashes. A correction
to scoring metadata alone does not require new model responses, but its reason
must remain in the execution record.

The 2026-11-11 v1 `complete-pass` was invalidated during self-review. The
current schema v2 result is recorded in
`docs/review-followup-self-review-execution.md`; it has 17 passes, four invalid
first attempts, and three semantic failures. Seven diagnostic retries are
retained and cannot promote a first-run failure. The local raw-evidence check
passes, but the semantic complete-pass gate remains failed.

The v2 local workflow is:

```bash
npm run evaluate:review-followup -- <run-id> <evidence-parent>
npm run reconcile:review-followup -- <run-root>/index.json
npm run finalize:review-followup -- <run-root>/index.reconciled-v2.json <assessments.json> [retry-index.json ...]
npm run verify:review-followup -- --evidence-only <run-root>
npm run verify:review-followup -- <run-root>
```

The evaluator saves raw answers and traces without scoring them. Reconciliation
checks raw hashes, staged source reads, and observed outputs. Human assessments
compare those observations with the fixture. Evidence-only verification checks
the complete raw record even when the semantic gate is `fail`; the final
verification command requires `complete-pass`.
