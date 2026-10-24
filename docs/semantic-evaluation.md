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
