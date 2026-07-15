# TODO

## Active: Rule Validity Overhaul (Accepted 2026-07-16)

### Goal And Constraints

- [ ] Rebalance the Skill from prompt-style hygiene toward observable execution
      risks: instruction integrity, evidence, fallback behavior, security,
      authority, validation, and reproducibility.
- [ ] Preserve the useful existing foundations: namespaced Rule IDs, explicit
      applicability boundaries, shared severity definitions, concise
      `SKILL.md` routing, and conditional examples/templates/references.
- [ ] Keep this repository content-only. Do not add a deterministic lint engine
      or claim that structural Node.js tests prove LLM review accuracy.
- [ ] Treat known target-model/runtime documentation and measured evaluations as
      stronger evidence than generic prompt heuristics. Never infer missing
      model, reasoning mode, instruction layer, or tool capabilities.
- [ ] Complete the phases below in order. If an `index.json` already exists, do
      not refresh it until all bundled Skill files have reached their final
      state. If it does not exist, do not create one as part of this work.

### Phase 1: Establish The Shared Rule And Migration Contracts

Affected or new files:

- `skills/igapyon-miku-prompt-lint/references/rule-contract.md` (new)
- `skills/igapyon-miku-prompt-lint/references/rule-migrations.json` (new)
- `skills/igapyon-miku-prompt-lint/references/review-levels.md`
- `skills/igapyon-miku-prompt-lint/references/output-format.md`

- [ ] Add `references/rule-contract.md` as the canonical authoring contract for
      every active anti-pattern Rule.
- [ ] Require every active Rule entry to use these exact machine-checked labels,
      including `None` when a dependency or overlap does not exist:

```text
Default severity:
Applies when:
Does not apply when:
Evidence required:
Target/runtime dependencies:
Overlap/precedence:
Why this is a problem:
Recommended fix:
```
- [ ] State that an observable defect takes precedence over a stylistic
      heuristic and that a more specific Rule takes precedence over an umbrella
      Rule.
- [ ] Define root-cause ownership so one issue is reported once:
  - Prompt owns executable wording, input/output contracts, constraints, and
    instruction priority.
  - Context owns reusable knowledge, provenance, examples, templates, and
    source-of-truth conflicts.
  - Agent Skill owns activation, task-to-resource routing, tool contracts, and
    runtime behavior.
  - Repository/Harness owns README, build, test, CI, release, generated indexes,
    and artifact identity.
- [ ] Add a machine-readable `references/rule-migrations.json` with
      `schemaVersion` and exactly three dispositions:
  - `alias`: one canonical replacement ID.
  - `split`: multiple possible replacement IDs; never auto-rewrite.
  - `retired`: no canonical replacement.
- [ ] Fix the migration-file schema to the following property names and types:

```json
{
  "schemaVersion": 1,
  "migrations": [
    {
      "legacyId": "prompt/example",
      "disposition": "alias",
      "canonicalIds": ["prompt/replacement"],
      "note": "Reason and migration guidance."
    }
  ]
}
```
- [ ] Record at least the following migrations. Old IDs remain valid only when
      interpreting historical reports and must never be emitted by a new review:

| Old Rule ID | Disposition | Canonical replacement(s) |
| --- | --- | --- |
| `prompt/outdated-prompt-style` | retired | none |
| `prompt/vague-role-only` | split | `prompt/role-inflation`, `prompt/underspecified-context`, `prompt/missing-output-format` |
| `prompt/knowledge-in-prompt` | alias | `context/knowledge-in-prompt` |
| `prompt/cargo-cult-prompt` | split | `prompt/ornamental-reasoning-cue`, `prompt/vague-quality-demand`, `prompt/coercive-framing` |
| `prompt/missing-context` | split | `prompt/missing-required-input`, `prompt/underspecified-context` |
| `prompt/over-specific-persona` | alias | `prompt/role-inflation` |
| `prompt/style-mixed-with-task` | alias | `prompt/instruction-conflict` |
| `agent-skill/missing-references` | alias | `agent-skill/reusable-knowledge-not-separated` |
| `agent-skill/missing-templates` | alias | `agent-skill/reusable-output-shape-missing` |
| `agent-skill/examples-free-skill` | alias | `agent-skill/behavior-examples-missing` |
| `agent-skill/template-as-instruction` | alias | `context/template-as-instruction` |
| `agent-skill/missing-topic-guide` | alias | `agent-skill/resource-routing-missing` |
| `agent-skill/context-without-navigation` | alias | `agent-skill/resource-routing-missing` |
| `agent-skill/no-review-mode` | alias | `agent-skill/validation-step-missing` |
| `agent-skill/generator-first-design` | alias | `agent-skill/validation-step-missing` |
| `agent-skill/maintainer-first-readme` | alias | `repository/maintainer-first-readme` |
| `agent-skill/shared-output-test-race` | alias | `repository/shared-output-test-race` |
| `agent-skill/missing-index` | split | `repository/index-contract-broken`, `agent-skill/resource-routing-missing`, `agent-skill/broken-resource-route` |

Acceptance criteria:

- [ ] Every removed or renamed Rule ID has exactly one migration entry.
- [ ] Every `alias` points to exactly one active canonical Rule.
- [ ] Every `split` has at least two canonical candidates and is documented as
      requiring contextual re-review.
- [ ] Every `retired` entry has an empty canonical-ID list.
- [ ] No current example, template, checkpoint, README section, or `SKILL.md`
      instruction emits a legacy Rule ID.

### Phase 2: Add The Repository/Harness Review Surface

New files:

- `skills/igapyon-miku-prompt-lint/references/repository/INDEX.md`
- `skills/igapyon-miku-prompt-lint/references/repository/checkpoints.md`
- `skills/igapyon-miku-prompt-lint/references/repository/anti-patterns.md`

Files to update:

- `skills/igapyon-miku-prompt-lint/SKILL.md`
- `skills/igapyon-miku-prompt-lint/references/review-levels.md`
- `skills/igapyon-miku-prompt-lint/references/agent-skills/INDEX.md`
- `skills/igapyon-miku-prompt-lint/references/agent-skills/checkpoints.md`
- `skills/igapyon-miku-prompt-lint/references/agent-skills/anti-patterns.md`
- `skills/igapyon-miku-prompt-lint/references/output-format.md`
- `skills/igapyon-miku-prompt-lint/templates/review-report.md`

- [ ] Add `Repository/Harness` as the fourth `Level`, with canonical Rule prefix
      `repository/` and reference directory `references/repository/`.
- [ ] Within Agent Skill and Repository/Harness reviews, record these supplied
      package surfaces before applying checks. These are subordinate package
      surfaces, not additional Review Levels:
  - Runtime Skill: `SKILL.md`, agent metadata, and bundled resources.
  - Integration: tools, scripts, APIs, and external services.
  - Source Repository/Harness: README, tests, build, generated metadata,
    bundles, CI, and release automation.
- [ ] Treat an unprovided surface as `Not assessed`, not as missing or defective.
- [ ] Apply Repository/Harness review only when an Agent Skill source repository
      or its operational files are supplied, or when the user explicitly asks
      for that surface. Do not activate it for generic repository review.
- [ ] Move README, build/test, release, and generated-index checks out of the
      Agent Skill rubric.
- [ ] Distinguish three separate concerns:
  - generated inventory contract -> Repository/Harness;
  - broken runtime file/link route -> Agent Skill;
  - missing task-to-resource selection guidance -> Agent Skill.
- [ ] State explicitly that a miku-indexgen inventory is discovery metadata,
      not a replacement for a curated topic guide or task-to-file routing.
- [ ] Update mixed-review selection and ownership precedence so the same root
      cause is not reported at multiple levels.

Acceptance criteria:

- [ ] Agent Skill anti-patterns contain no README, CI, release, build-race, or
      generated-index ownership Rules.
- [ ] `review-levels.md`, `SKILL.md`, `output-format.md`, and the canonical report
      template use the same four Level names and namespaces.
- [ ] A single-prompt review cannot produce a `repository/` Rule.
- [ ] A minimal deployed Skill is not penalized because its source repository,
      README, index generator, or tests were not supplied.

### Phase 3: Separate Impact, Certainty, Evidence, And Applicability

Affected files:

- `skills/igapyon-miku-prompt-lint/references/output-format.md`
- `skills/igapyon-miku-prompt-lint/templates/review-report.md`
- every file under `skills/igapyon-miku-prompt-lint/examples/`
- all prompt skeletons that emit findings

- [ ] Keep `Severity` as impact if the Rule truly applies.
- [ ] Add `Confidence: High | Medium | Low` as detection certainty:
  - High: direct, unambiguous evidence and known applicability context.
  - Medium: direct evidence but some use-case/runtime assumptions remain.
  - Low: incomplete target information or materially model-dependent judgment.
- [ ] Add `Applicability: Applicable | Not applicable | Not assessed`.
- [ ] Report ordinary findings only when `Applicable`. Put `Not applicable` and
      `Not assessed` in assessment notes only for exhaustive audits or when the
      missing premise materially limits the conclusion; do not count them as
      defects.
- [ ] Require `Evidence` containing an available file/section/line reference or
      a short exact fragment that exists in the reviewed artifact.
- [ ] Add report-level `Target context` for known model family, reasoning mode,
      runtime, instruction layer, and tool capabilities. Write `Unknown` rather
      than inferring absent details.
- [ ] Require `Severity rationale` only when a finding overrides the Rule's
      default severity.
- [ ] Fix `Change type` to exactly these six values: `correctness`, `security`,
      `reliability`, `reproducibility`, `maintainability`, and
      `optional polish`.
- [ ] Make the canonical report findings-first; move strengths after findings so
      the template agrees with `output-format.md`.
- [ ] State explicitly that static lint identifies risks but does not establish
      actual model performance or artifact correctness.

Acceptance criteria:

- [ ] The canonical template, output contract, every example, and every finding
      skeleton use identical field names and enum values.
- [ ] Evidence fragments in examples and fixtures exist in the supplied target.
- [ ] No `Not assessed` item is presented or counted as a defect.
- [ ] Model-dependent findings with unknown target context cannot have High
      confidence.

### Phase 4: Rebuild Prompt Review Around Observable Effects

Affected files:

- `skills/igapyon-miku-prompt-lint/references/prompt/checkpoints.md`
- `skills/igapyon-miku-prompt-lint/references/prompt/anti-patterns.md`
- `skills/igapyon-miku-prompt-lint/references/prompt/rewrite-patterns.md`
- `skills/igapyon-miku-prompt-lint/references/prompt/INDEX.md`
- related examples, README summaries, and `SKILL.md` scope text

- [ ] Rename checkpoint `Outdated Prompt Design` to
      `Non-operational Framing`.
- [ ] Remove year-based, generation-based, and universal "modern reasoning
      model" claims. Judge wording by observable requirements, conflicts,
      discoverability, and measured target behavior.
- [ ] Retire `prompt/outdated-prompt-style`.
- [ ] Remove `prompt/vague-role-only`; report its actual root cause using
      `role-inflation`, `underspecified-context`, or `missing-output-format`.
- [ ] Remove Prompt ownership of `prompt/knowledge-in-prompt`; use the Context
      Rule only when reusable placement can actually be assessed.
- [ ] Remove `prompt/over-specific-persona`; merge non-functional persona detail
      into `prompt/role-inflation`.
- [ ] Remove `prompt/style-mixed-with-task`; use
      `prompt/instruction-conflict` only when requirements are incompatible or
      their priority is materially ambiguous.
- [ ] Retire the umbrella name `prompt/cargo-cult-prompt` and route its cases:
  - bare cognitive cue -> `prompt/ornamental-reasoning-cue`;
  - vague best/perfect demand -> `prompt/vague-quality-demand`;
  - threat or punishment framing -> `prompt/coercive-framing`.
- [ ] Retain `prompt/prompt-bloat` only as an umbrella fallback when no more
      specific Rule explains the observable harm. Set its default severity to
      `Low`; raise it to `Medium` only with evidence that discoverability,
      context limits, conflicts, or maintenance are materially affected. Length
      alone is not evidence.
- [ ] Change `prompt/role-inflation` default severity to `Low`; allow `Medium`
      only when prestige framing replaces or obscures material task context.
- [ ] Replace the claim that role text cannot increase capability with the
      narrower claim that prestige alone adds no evidence/domain context and
      does not guarantee expertise.
- [ ] Exclude functional roles that define domain perspective, audience,
      simulation, or decision constraints.
- [ ] Change `prompt/private-reasoning-disclosure` default severity to `Medium`.
      Allow `High` only for concrete privacy, forced downstream disclosure, or
      acceptance-contract consequences.
- [ ] Exclude concise rationale, assumptions, verification summaries,
      mathematical derivations, calculation steps, transformations, proofs, and
      auditable decision logs from private-reasoning disclosure.
- [ ] Keep `prompt/ornamental-reasoning-cue` as `Low` advisory only. Use
      `Not assessed` when effect depends on an unknown model/runtime; do not flag
      a deliberate test-backed requirement.
- [ ] Keep `prompt/repeated-instructions` at `Low`, excluding deliberately
      scoped repetition across instruction layers and safety/legal boundaries.
- [ ] Keep `prompt/excessive-negative-rules` at `Low`, applying only when
      prohibitions omit replacement behavior and reduce executability.
- [ ] Split `prompt/missing-context` into:
  - `prompt/missing-required-input` (`High` when execution is blocked);
  - `prompt/underspecified-context` (`Medium` when reasonable defaults remain).
- [ ] Keep `prompt/missing-output-format` at `Medium`, excluding short one-off
      answers, exploratory discussion, creative work, and self-evident output.
- [ ] Add the following conditional Rules with explicit non-applicable cases:
  - `prompt/instruction-conflict` (`Medium`, `High` for unsafe/incorrect action);
  - `prompt/missing-success-criteria` (`Medium` for repeatable, evaluated, or
    downstream-consumed output);
  - `prompt/missing-fallback-behavior` (`Medium` when missing input, partial
    success, or tool failure is realistic);
  - `prompt/missing-evidence-contract` (`Medium`, limited to factual, research,
    citation-sensitive, or high-stakes work);
  - `prompt/untrusted-content-boundary` (`High` when external content can be
    mistaken for instructions);
  - `prompt/undeclared-capability-or-authority` (`Medium`, `High` for implicit
    irreversible or externally visible action);
  - `prompt/vague-quality-demand` (`Low` when no measurable criterion follows);
  - `prompt/coercive-framing` (`Low` unless it creates a concrete higher-impact
    conflict; real safety/legal consequences are non-applicable).
- [ ] Make Prompt review instruction-layer aware. If system/developer context,
      API parameters, caller code, or conversation history was not supplied,
      use `Not assessed` or request inputs instead of declaring it missing.
- [ ] Apply Reuse Problems only to prompts intended for reuse; one-off coupling
      and legitimate few-shot fixtures are not defects.

Acceptance criteria:

- [ ] No active Prompt Rule or checkpoint uses "2023-2024", "old prompt
      culture", or unsupported universal model-generation claims.
- [ ] Every added/changed Prompt Rule satisfies `rule-contract.md`.
- [ ] Functional roles, concise rationale, creative free-form output, and
      task-specific source material have explicit non-applicable fixtures.
- [ ] Contradictory constraints, untrusted external instructions, missing
      required input, and missing fallback each have distinct positive fixtures.

### Phase 5: Complete Context Review And Tighten Boundaries

Affected files:

- `skills/igapyon-miku-prompt-lint/references/context/checkpoints.md`
- `skills/igapyon-miku-prompt-lint/references/context/anti-patterns.md`
- `skills/igapyon-miku-prompt-lint/references/context/INDEX.md`
- `skills/igapyon-miku-prompt-lint/templates/revised-context-structure.md`
- related examples and tests

- [ ] Put short `Apply only when` and `Do not flag when` boundaries in the
      checkpoints themselves, or require anti-pattern boundaries to be read
      before any lightweight review emits a finding. Lightweight advice must not
      bypass applicability exclusions.
- [ ] Add `context/missing-required-context` (`High` only when execution is
      blocked; otherwise lower severity or non-applicable).
- [ ] Add `context/context-bloat` (`Medium` only when duplication or irrelevant
      material obscures operational content; length alone is insufficient).
- [ ] Add `context/weak-template` (`Medium` when an existing template has
      missing placeholders/required fields or conflicts with instructions).
- [ ] Add `context/conflicting-source-of-truth` (`Medium`, `High` when the
      conflict breaks safety, correctness, or machine processing).
- [ ] Add `context/stale-or-unversioned-context` (`Medium` only when freshness,
      provenance, effective date, or dependency version affects the task).
- [ ] Keep `context/knowledge-in-prompt` as the sole placement Rule for stable,
      reusable knowledge. Explicitly exclude task-specific specifications,
      logs, attachments, and source data.
- [ ] Remove or qualify signals such as generic "specifications" and "past
      logs" that contradict the task-specific-input exclusion.
- [ ] Keep `context/missing-examples` and `context/weak-examples`, but require
      only the smallest example set that resolves ambiguity. Require an edge
      case only when boundary behavior matters.
- [ ] Keep `context/template-as-instruction`, but apply it only to non-trivial,
      repeated, independently maintained, or hard-to-discover output shapes.
      A short core output contract may remain inline.
- [ ] Keep `context/context-without-navigation`, but require actual navigation
      ambiguity, overlapping responsibilities, deep nesting, or missing direct
      links. A small self-explanatory file set is non-applicable.
- [ ] Distinguish missing versus weak templates:
  - no required reusable output contract -> `context/missing-output-format`;
  - contract exists but is malformed/inconsistent -> `context/weak-template`.
- [ ] Make `templates/revised-context-structure.md` minimal by default; mark
      topic guides, templates, normal examples, and edge examples as conditional
      rather than universally required.

Acceptance criteria:

- [ ] Every central Context checkpoint category has an active Rule ID or is
      explicitly labeled advisory-only.
- [ ] Source-of-truth conflict, stale regulated material, weak existing
      template, and actual context bloat have distinct positive fixtures.
- [ ] One-off logs/specifications, a short inline output shape, and a small
      directly linked context set have non-applicable fixtures.
- [ ] Prompt and Context levels cannot both report knowledge placement for the
      same root cause.

### Phase 6: Refocus Agent Skill Review On Runtime Capability

Affected files:

- `skills/igapyon-miku-prompt-lint/references/agent-skills/checkpoints.md`
- `skills/igapyon-miku-prompt-lint/references/agent-skills/anti-patterns.md`
- `skills/igapyon-miku-prompt-lint/references/agent-skills/INDEX.md`
- `skills/igapyon-miku-prompt-lint/templates/revised-agent-skill-structure.md`
- related examples and tests

- [ ] Record the subordinate package-surface inventory before applying Agent
      Skill checks. Assess only files and integrations actually supplied; do
      not confuse this inventory with the four Review Levels.
- [ ] Add `agent-skill/activation-boundary-mismatch` (`Medium`; `High` when
      unrelated activation can trigger dangerous action). Require should-trigger
      and should-not-trigger evidence.
- [ ] Merge `missing-topic-guide` and Agent Skill
      `context-without-navigation` into
      `agent-skill/resource-routing-missing` with default `Medium`.
- [ ] Remove Agent Skill `template-as-instruction`; Context owns reusable shape
      placement.
- [ ] Merge `no-review-mode` and `generator-first-design` into
      `agent-skill/validation-step-missing` with default `Medium`, applying only
      when the Skill promises quality gating or mutation safety without an
      acceptance check.
- [ ] Add `agent-skill/behavior-not-validated` (`Medium`) for complex,
      ambiguous, or high-impact Skills lacking realistic forward tests. Do not
      claim that file structure alone demonstrates behavior. If the source
      repository or evaluation evidence was not supplied, use `Not assessed`.
- [ ] Keep the two validation Rules distinct and prevent double reporting:
  - `validation-step-missing` owns a missing acceptance/self-check inside the
    Skill's execution workflow;
  - `behavior-not-validated` owns missing independent forward-test evidence for
    a complex or high-impact Skill;
  - if both observations are supported only by the same missing evidence,
    report the more specific one; report both only when the runtime gate and the
    independent evaluation are separately absent and separately evidenced.
- [ ] Rename folder-presence Rules to capability-based Rules:
  - `missing-references` -> `reusable-knowledge-not-separated`;
  - `missing-templates` -> `reusable-output-shape-missing`;
  - `examples-free-skill` -> `behavior-examples-missing`.
- [ ] Preserve the small/self-evident Skill exclusions. Short examples may live
      in `SKILL.md`; additional references, templates, and examples are optional
      when their capability is unnecessary.
- [ ] Add `agent-skill/broken-resource-route` (`High` when a required missing
      file/link blocks execution; otherwise `Medium`).
- [ ] Add `agent-skill/invalid-package-metadata` with default `Medium`, raised to
      `High` only when invalid required metadata prevents discovery or
      execution. Apply it only against a known target package specification or
      platform profile. Do not universalize Codex-, Claude-, or
      repository-specific optional files.
- [ ] Add optional platform-profile guidance for generic Agent Skills, Codex
      metadata such as `agents/openai.yaml`, and repository-specific generated
      metadata. A profile is assessed only when identified or supplied.
- [ ] Retain `agent-skill/tool-contract-missing` for observable input, output,
      preconditions, availability/version, errors, fallback, timeout, and retry
      or idempotency behavior.
- [ ] Add `agent-skill/unsafe-side-effect-contract` (`High`) for missing
      authorization, least privilege, secret handling, user confirmation,
      postconditions, or external/irreversible-action boundaries.
- [ ] Ensure freedom is proportional to task fragility: deterministic fragile
      steps should be constrained or scripted, while judgment-heavy work should
      not be over-specified.
- [ ] Make `templates/revised-agent-skill-structure.md` show indexes, references,
      templates, examples, scripts, and agent metadata as conditional resources,
      not universal requirements.

Acceptance criteria:

- [ ] A minimal one-file Skill is not flagged merely for missing folders,
      README, index, tests, or agent metadata.
- [ ] Generated inventory does not satisfy task-to-resource routing by itself.
- [ ] Broken runtime links, missing routing, invalid known-profile metadata,
      missing tool schema, and unsafe side effects produce distinct Rules.
- [ ] Creation/generation Skills with explicit acceptance checks are not flagged
      for lacking a separate review mode.

### Phase 7: Define Repository/Harness Rules Precisely

Affected files:

- `skills/igapyon-miku-prompt-lint/references/repository/checkpoints.md`
- `skills/igapyon-miku-prompt-lint/references/repository/anti-patterns.md`
- `skills/igapyon-miku-prompt-lint/references/repository/INDEX.md`

- [ ] Add `repository/maintainer-first-readme` with default `Low`, raised to
      `Medium` only when onboarding, activation, or use is materially blocked.
- [ ] Add `repository/index-contract-broken` with default `Medium`, raised to
      `High` only when a required consumer cannot discover or run the package.
      Apply it only when a repository or consumer contract requires generated
      discovery metadata. Cover missing or stale metadata without treating
      package size alone as a requirement.
- [ ] Represent any repository-level index requirement explicitly in
      `package.json` as `mikuIndex: { path, required }`, rather than inferring a
      requirement from package size or directory layout. A missing required
      index is a failing contract, not permission to create one automatically.
- [ ] Move `shared-output-test-race` to
      `repository/shared-output-test-race` and keep `High` only for proven or
      structurally unavoidable concurrent destructive mutation.
- [ ] Separate race conditions from `repository/artifact-identity-gap`: a tested
      artifact is later regenerated or overwritten before release. Use default
      `Medium`, raised to `High` for an unverifiable published artifact.
- [ ] Add `repository/nonreproducible-generated-artifact` (`Medium`; `High` when
      it makes a published/released artifact unverifiable).
- [ ] Add `repository/evaluation-answer-leakage` (`High`) when expected answers,
      suspected defects, or repair instructions are exposed to the subject under
      evaluation and invalidate the result.
- [ ] Document that serial execution makes a concurrency-race Rule
      non-applicable; artifact identity and reproducibility remain separate
      assessments.

Acceptance criteria:

- [ ] A repository without an index convention is not flagged for index absence.
- [ ] A stale required index, broken runtime resource, and missing routing map
      resolve to three different owning Rules.
- [ ] Serial overwrite, concurrent destructive writes, artifact replacement,
      and nondeterministic bytes have separate fixtures and outcomes.

### Phase 8: Add Rule Calibration Fixtures And Semantic Evaluation

New files or directories:

- `tests/fixtures/rule-calibration/*.json`
- `tests/fixtures/rule-calibration-baseline.json`
- `tests/rule-calibration-contract.test.mjs`
- `tests/rule-migrations.test.mjs`
- `docs/semantic-evaluation.md`

- [ ] Define a fixture schema containing: unique case ID, Review Level, raw
      artifact, target context, `expectedFindings`, `expectedNotApplicable`,
      `expectedNotAssessed`, `expectedSuppressed`, and rationale. Put
      `evidenceContains` inside each `expectedFindings` entry, not at fixture
      top level.
- [ ] Give the expectation arrays non-overlapping meanings:
  - `expectedNotApplicable`: the Rule's applicability condition is false;
  - `expectedNotAssessed`: a required target/runtime premise was not supplied;
  - `expectedSuppressed`: the pattern is present but a more specific Rule or a
    different owning Level must take precedence.
- [ ] Give every canonical Rule at least one clear positive and one clear
      non-applicable fixture.
- [ ] Give every conditional Rule a boundary fixture.
- [ ] Give every model/runtime-dependent Rule a fixture whose expected result is
      `Not assessed` when the target is unknown.
- [ ] Give cross-surface root causes an ownership fixture proving that only the
      canonical surface reports them.
- [ ] Include at least these calibration cases:
  - functional expert role versus prestige-only role;
  - full internal-reasoning disclosure versus concise rationale/proof;
  - bare reasoning cue with unknown versus known/test-backed target;
  - incompatible length/style constraints;
  - external email/Web instructions without a trust boundary;
  - creative writing where evidence/citations are irrelevant;
  - conflicting context sources without precedence;
  - undated or unversioned time-sensitive material;
  - missing Agent Skill routing versus broken file link;
  - destructive/external action without authority or confirmation;
  - minimal Skill with no repository/index contract;
  - shared-output race versus serial artifact replacement.
- [ ] Make `tests/rule-calibration-contract.test.mjs` verify fixture schema,
      unique case IDs, active Rule coverage, legal enums, surface/prefix
      ownership, evidence-fragment existence, and absence of retired/split IDs.
- [ ] Make `tests/rule-migrations.test.mjs` verify migration schema,
      dispositions, canonical targets, and complete coverage of removed IDs.
- [ ] Document clearly that the Node.js tests validate the rule corpus contract,
      not LLM judgment accuracy.
- [ ] Add a manual semantic gate in `docs/semantic-evaluation.md`:
  1. start a fresh independent session for each fixture;
  2. provide only the raw artifact, target context, and normal Skill invocation;
  3. do not expose expected Rule IDs, defects, or fixes before generation;
  4. compare the completed report with expected results afterward;
  5. record runtime/model/date, mismatches, and any justified exception;
  6. rerun a failure once to distinguish an unstable result from a consistent
     taxonomy problem.
- [ ] Store raw run records under
      `workplace/rule-calibration-results/<date>-<runtime>.jsonl` and keep them
      uncommitted. Each record must include case ID, model, runtime, date,
      observed Rule IDs, mismatch class, first-run status, and rerun result.
      Store the reviewable result summary in
      `tests/fixtures/rule-calibration-baseline.json`.
- [ ] Give every baseline result: fixture case ID, evaluation date, model,
      runtime, expected Rule IDs, actual Rule IDs, expected/actual severity and
      confidence, status, and notes. Limit status to `pass`,
      `accepted-exception`, or `fail`.
- [ ] Require every `accepted-exception` to include a concrete rationale,
      decision date, approver, and follow-up disposition. Security, authority,
      untrusted-content, and evaluation-leakage High cases cannot be accepted as
      exceptions.
- [ ] Extend `rule-calibration-contract.test.mjs` to validate the baseline
      schema, reject unknown case IDs, and require a result for every case in the
      release semantic gate.
- [ ] Do not mark the semantic gate complete if the JSONL run record or the
      committed baseline summary cannot be written and validated.
- [ ] Run the manual gate for every added/renamed Rule and every changed severity
      boundary before declaring the overhaul complete.

Acceptance criteria:

- [ ] Every active Rule has positive and non-applicable fixture coverage.
- [ ] Every conditional Rule has boundary coverage.
- [ ] Every model-dependent Rule has unknown-target `Not assessed` coverage.
- [ ] No expected finding uses a migrated, split, or retired ID.
- [ ] No semantic evaluation subject sees its expected answer before responding.
- [ ] The baseline has no unresolved `fail` status, and every accepted exception
      satisfies its required decision record.
- [ ] Manual results distinguish taxonomy failure, model variability, and missing
      target context.

### Phase 9: Synchronize Routing, Documentation, Templates, And Examples

Affected files include:

- `skills/igapyon-miku-prompt-lint/SKILL.md`
- `skills/igapyon-miku-prompt-lint/agents/openai.yaml`
- `README.md`
- `docs/development.md`
- all review `INDEX.md` files
- all files under `skills/igapyon-miku-prompt-lint/templates/`
- all files under `skills/igapyon-miku-prompt-lint/examples/`

- [ ] Update `SKILL.md` Required Workflow, Review Scope, Response Contract, and
      References for four review surfaces and root-cause ownership.
- [ ] Require anti-pattern applicability boundaries before emitting a Rule ID,
      Severity, or formal finding. Lightweight advice may skip anti-pattern
      files only when it emits no formal Rule finding.
- [ ] Route `rule-migrations.json` only when interpreting an older report or
      migrating Rule IDs; do not load it for ordinary review.
- [ ] Update README and `agents/openai.yaml` to describe the four supported
      surfaces without turning the Skill into generic repository review.
- [ ] Update `docs/development.md` to replace the old three-surface design
      decision, document calibration responsibilities, and distinguish
      structural tests from semantic evaluation.
- [ ] Update each `INDEX.md` with direct task-to-file links; do not use the
      generated inventory as the usage guide.
- [ ] Update every example to the new output contract and canonical Rule IDs.
- [ ] Add representative examples for untrusted-content handling,
      conflicting source of truth, unsafe Agent Skill side effects, and
      Repository/Harness review.
- [ ] Audit `revised-prompt.md`, `revised-context-structure.md`,
      `revised-agent-skill-structure.md`, and all prompt skeletons against the
      new success, evidence, fallback, trust, authority, and optional-resource
      rules.
- [ ] Ensure revised structures do not make references, templates, examples,
      indexes, scripts, README, or agent metadata universally mandatory.

Acceptance criteria:

- [ ] No user-facing file refers to the retired "outdated prompt" or
      "cargo-cult prompt" taxonomy as an active Rule family.
- [ ] No current document claims there are only three review levels.
- [ ] All direct Markdown links resolve and all examples use active Rule IDs.
- [ ] The report template and examples are findings-first and preserve strengths
      after the findings.

### Phase 10: Extend Automated Contracts And Run Final Verification

Affected files:

- `tests/content-contract.test.mjs`
- `tests/skill-structure.test.mjs`
- `tests/rule-calibration-contract.test.mjs` (new)
- `tests/rule-migrations.test.mjs` (new)
- `package.json`
- `skills/igapyon-miku-prompt-lint/index.json` (miku-indexgen output only)

- [ ] Extend Rule ID parsing and uniqueness checks to `repository/`.
- [ ] Extend the anti-pattern file list and Level enumeration to all four
      surfaces.
- [ ] Require the full new finding field set and validate every enum.
- [ ] Require `Severity rationale` in every example or fixture whose Severity
      differs from the referenced Rule's default.
- [ ] Require every active anti-pattern entry to satisfy `rule-contract.md`.
- [ ] Add calibration and migration tests to the explicit `npm test` file list
      while retaining `--test-concurrency=1`.
- [ ] Update `skill-structure.test.mjs` to require the new repository references,
      rule contract, migration file, examples, and other bundled additions.
- [ ] Extend Markdown link validation to repository `README.md` and
      `docs/**/*.md` in addition to bundled Skill Markdown, so the Phase 9 link
      acceptance criterion is fully tested.
- [ ] Make `tests/rule-migrations.test.mjs` derive all legacy IDs from
      `rule-migrations.json` and reject them in current files under
      `skills/igapyon-miku-prompt-lint/`, excluding the migration file itself.
      Do not scan `TODO.md`, where migration planning intentionally names old
      IDs.
- [ ] Update `scripts/verify-miku-index.mjs` and the explicit `npm test` / build
      path so index handling is conditional:
  - when the configured index file exists, verify its generator metadata, file
    set, and freshness;
  - when it is absent and `mikuIndex.required` is `false`, report an intentional
    skip and continue without generating an index;
  - when it is absent and `mikuIndex.required` is `true`, fail with
    `repository/index-contract-broken`; do not generate an index as a side
    effect.
- [ ] Invoke `$igapyon-miku-indexgen` (triggered by `miku-indexgen`) only when
      `skills/igapyon-miku-prompt-lint/index.json` already exists and needs a
      refresh. Let the Skill run its verified bundled runtime; do not edit the
      index by hand. When it does not exist, record the intentional skip and do
      not invoke miku-indexgen or create `index.json`. Record the generator
      version and executed command, or the skip reason, in the verification
      notes. The currently verified refresh command for an existing index is:

```bash
java -jar /Users/igapyon/.codex/skills/igapyon-miku-indexgen/runtime/miku-indexgen-1.6.2.jar \
  --refresh-index skills/igapyon-miku-prompt-lint/index.json
```

- [ ] When an index exists, run miku-indexgen only after every bundled content
      change is complete, including additions, removals, renames, and
      same-byte-size edits.
- [ ] When an index exists, confirm the refreshed JSON declares
      `generator: "miku-indexgen"`, uses the expected generation schema, and
      lists the final bundled files before running `npm run check:index`.
- [ ] When no index exists and the contract is optional, confirm that final
      source and bundle output still omit `index.json` and that the verification
      script reports a skip rather than silently creating one.

- [ ] Run the final commands in this exact order. `npm run check:index` must
      verify an existing index, intentionally skip an optional absent index, or
      fail a required absent-index contract without generating a file:

```bash
npm run check:index
npm test
npm run build
npm run verify:reproducible
```

- [ ] Use the migration test for legacy IDs. Separately run `rg` against
      `skills/igapyon-miku-prompt-lint/`, `README.md`, and `docs/` to confirm
      old taxonomy prose and three-level-only enums remain only in the migration
      file or explicitly labeled historical documentation; do not include
      `TODO.md` in this search.
- [ ] Inspect the final diff and confirm that generated bundle/zip/checksum
      artifacts are not mixed into canonical Skill source.

### Definition Of Done

- [ ] All ten phases above are complete in dependency order.
- [ ] Every accepted deletion, merge, severity adjustment, boundary correction,
      new Rule, and new review surface is represented in canonical references.
- [ ] Every canonical Rule has evidence requirements, precedence behavior, and
      calibration coverage.
- [ ] Formal findings distinguish impact, confidence, evidence, applicability,
      and target assumptions.
- [ ] Prompt, Context, Agent Skill, and Repository/Harness ownership produces no
      duplicate root-cause finding in mixed fixtures.
- [ ] Structural tests and manual semantic evaluation both pass their separate
      gates without claiming that one substitutes for the other.
- [ ] `rule-calibration-baseline.json` covers every required semantic-gate case,
      contains no unresolved failure, and contains no accepted exception for a
      High security/authority/trust-boundary case.
- [ ] If `index.json` exists, it is refreshed only by miku-indexgen and all
      final verification commands pass. If it is absent by optional contract,
      it remains absent and the final verification records the intentional skip.

## Completed: Accepted Review Findings (2026-07-16)

All accepted findings F1--F8 have been implemented and verified.

### F1: Installation Layout

- [x] Documented both valid installation paths in `README.md`.
- [x] Aligned the bundle script's installation message with the documented paths.
- [x] Added isolated tests for agent-home extraction and direct copy under the skills root.
- [x] Cleaned temporary install directories in `finally` blocks.

### F2: One Verified, Reproducible Release Artifact

- [x] Added `npm run check:index`, which checks index freshness without editing tracked files.
- [x] Require the index check before bundle and zip generation.
- [x] Separated source tests from verification of an already-built bundle and zip.
- [x] Build ZIP entries in stable order with fixed timestamps and stripped extra metadata.
- [x] Generate a `.sha256` sidecar from the exact release ZIP.
- [x] Verify ZIP regular files against all `index.json` entries plus `index.json` itself.
- [x] Remove older versioned ZIP/checksum files before creating a local release artifact.
- [x] Added `npm run verify:reproducible` to build twice and compare SHA-256 values.

### F3 and F5: Shared Report Contract

- [x] Made `templates/review-report.md` the canonical report shape.
- [x] Moved shared High/Medium/Low definitions to `references/output-format.md`.
- [x] Removed the malformed embedded report fence and duplicate Prompt-only report title.
- [x] Adopted `prompt/`, `context/`, and `agent-skill/` Rule ID namespaces.
- [x] Removed the unsupported `Critical` severity from the reviewer skeleton.
- [x] Added content-contract tests for Markdown fences, links, Rule IDs, and examples.

### F4: Contract-Compliant Examples

- [x] Updated every example to include Level, Severity, Category, Issue, Rule,
      Why it matters, Suggestion, and Change type.
- [x] Replaced the undefined `missing-examples partial` usage with
      `context/weak-examples`.
- [x] Added per-topic routing from each `INDEX.md` to matching examples and
      revised templates.

### F6: Anti-Pattern Precision

- [x] Added namespaced IDs, default severities, and applicability boundaries
      to Prompt, Context, and Agent Skill anti-pattern rules.
- [x] Split private-reasoning disclosure from non-disclosing ornamental
      reasoning cues.
- [x] Added conditional boundaries for references, templates, examples, and
      indexes so minimal Skills do not receive unnecessary structural advice.
- [x] Limited review-first rules to workflows where review or quality gating is
      actually required.
- [x] Split external-tool contract guidance across CLI, MCP/API, and GUI or
      external-service integrations.

### F7: Activation Boundary

- [x] Limited automatic activation to LLM prompts, AI-agent context packages,
      and Agent Skills, or an explicit Skill invocation.
- [x] Explicitly excluded generic code/document/template review.
- [x] Aligned the OpenAI agent prompt and README language with the boundary.

### F8: CI and Release Flow

- [x] Added pull-request and push CI in `.github/workflows/ci.yml`.
- [x] Updated CI and release builds to Node.js 24 and declared `>=24 <25` in
      `package.json`.
- [x] Changed release automation to tag/manual execution before publication.
- [x] Build a verified ZIP and checksum before attaching them to a draft release.
- [x] Documented the verification and draft-release flow in README and
      `docs/development.md`.

## Verification Completed

- [x] `miku-indexgen --refresh-index skills/igapyon-miku-prompt-lint/index.json`
- [x] `npm run check:index`
- [x] `npm test`
- [x] `npm run build`
- [x] `npm run verify:reproducible`
- [x] Verified both README installation layouts in isolated temporary directories.
- [x] Verified ZIP content equals `index.json` plus `index.json` itself.

## Later Backlog

- [ ] Pin a public reference repository or sister skill checkout when one
      becomes available under `workplace/`.
- [ ] After the rule-validity overhaul has shipped and real usage data exists,
      expand calibration cases for failures not already represented by the
      Phase 8 corpus.
