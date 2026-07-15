# Semantic Evaluation Gate

The Node.js tests validate the Rule corpus, fixture schema, links, and package
contracts. They do not establish LLM judgment accuracy.

## Independent Manual Procedure

For each release that changes Rule semantics or severity boundaries:

1. Start a fresh independent session for each fixture.
2. Provide only the fixture's raw artifact, target context, and normal Skill
   invocation. Do not provide expected Rules, defects, or fixes first.
3. Save the raw result under
   `workplace/rule-calibration-results/<date>-<runtime>.jsonl`; this directory
   is intentionally uncommitted.
4. Compare observed Rules, severity, confidence, applicability, suppression,
   and evidence with the fixture only after the response is complete.
5. Rerun a failure once. Record whether it is model variability, missing target
   context, or a consistent taxonomy defect.
6. Copy the reviewed summary into
   `tests/fixtures/rule-calibration-baseline.json` before release.

Each JSONL record must include `caseId`, `model`, `runtime`, `date`,
`observedRuleIds`, `mismatchClass`, `firstRunStatus`, and `rerunResult`.

## Baseline Result Contract

Each committed baseline result contains the fixture case ID, evaluation date,
model, runtime, expected and actual Rule IDs, expected and actual severity and
confidence, a `pass`, `accepted-exception`, or `fail` status, and notes. An
`accepted-exception` also requires decision date, approver, concrete rationale,
and follow-up disposition. High security, authority, trust-boundary, and
evaluation-leakage cases cannot be accepted exceptions.

Do not declare the semantic gate complete with an unresolved `fail`, an absent
run record, or an unvalidated baseline summary.

## Confirmed Ownership Precedence

The fixture corpus records two semantic-gate decisions: a template loaded for
every task is an Agent Skill routing defect, and inline stable knowledge is the
specific reusable-knowledge defect rather than the `skill-monolith` umbrella.
Use suppressed expectations to preserve these ownership decisions without
duplicating findings.
