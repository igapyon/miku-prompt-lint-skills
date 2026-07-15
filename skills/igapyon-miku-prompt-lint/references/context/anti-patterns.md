# Context Anti-Patterns

Use [../rule-contract.md](../rule-contract.md).

## context/knowledge-in-prompt

Default severity: `Medium`
Applies when: stable reusable knowledge is repeatedly embedded instead of maintained context.
Does not apply when: material is task-specific source data, specification, log, or attachment.
Evidence required: reuse/update path and duplicated stable knowledge.
Target/runtime dependencies: None
Overlap/precedence: Context owns placement.
Why this is a problem: updates and reuse drift.
Recommended fix: keep stable knowledge in a routed reference.

## context/missing-required-context

Default severity: `High`
Applies when: a required domain fact, constraint, or fallback is absent and blocks work.
Does not apply when: it is supplied elsewhere or not material.
Evidence required: blocked operation.
Target/runtime dependencies: None
Overlap/precedence: Prompt owns wording-layer omissions.
Why this is a problem: context cannot support reliable execution.
Recommended fix: add the minimal required context.

## context/context-bloat

Default severity: `Medium`
Applies when: duplicate or irrelevant material hides operational guidance.
Does not apply when: long source material is task input.
Evidence required: redundancy and obscured guidance.
Target/runtime dependencies: Context limits when claimed
Overlap/precedence: specific duplicate Rule wins.
Why this is a problem: selective loading and maintenance worsen.
Recommended fix: remove or route irrelevant detail.

## context/missing-examples

Default severity: `Medium`
Applies when: non-obvious style, structure, or boundary behavior needs demonstration.
Does not apply when: behavior is deterministic and self-evident.
Evidence required: ambiguity that an example would resolve.
Target/runtime dependencies: None
Overlap/precedence: weak-examples applies when examples exist.
Why this is a problem: expected behavior remains ambiguous.
Recommended fix: add the smallest useful example set.

## context/weak-examples

Default severity: `Low`
Applies when: examples exist but their role or expected behavior is unclear.
Does not apply when: filename and routing make purpose explicit.
Evidence required: unlabeled or contradictory example.
Target/runtime dependencies: None
Overlap/precedence: missing-examples applies when absent.
Why this is a problem: agents cannot apply the example safely.
Recommended fix: label normal/edge/preferred role and result.

## context/missing-output-format

Default severity: `Medium`
Applies when: supporting context requires a reusable output shape but none exists.
Does not apply when: output is intentionally free-form.
Evidence required: repeated output need and absent shape.
Target/runtime dependencies: None
Overlap/precedence: weak-template applies when a shape exists.
Why this is a problem: output drifts across runs.
Recommended fix: add a minimal contract or template.

## context/weak-template

Default severity: `Medium`
Applies when: existing template misses required placeholders or conflicts with instructions.
Does not apply when: it is a one-off illustration.
Evidence required: template/instruction mismatch.
Target/runtime dependencies: None
Overlap/precedence: missing-output-format applies when absent.
Why this is a problem: reuse reproduces malformed output.
Recommended fix: align placeholders and required fields.

## context/template-as-instruction

Default severity: `Medium`
Applies when: non-trivial repeated output shape is buried in prose.
Does not apply when: short core contract is clearer inline or excerpt is one-off.
Evidence required: repeated/hard-to-find shape.
Target/runtime dependencies: None
Overlap/precedence: Context owns template placement.
Why this is a problem: shape is hard to find and update.
Recommended fix: route a reusable template.

## context/conflicting-source-of-truth

Default severity: `Medium`
Applies when: sources give incompatible rules without precedence.
Does not apply when: variants and priority are explicit.
Evidence required: conflicting source fragments.
Target/runtime dependencies: None
Overlap/precedence: instruction conflict is Prompt-owned.
Why this is a problem: agents select rules arbitrarily.
Recommended fix: declare canonical owner and precedence.

## context/stale-or-unversioned-context

Default severity: `Medium`
Applies when: freshness, effective date, provenance, or dependency version matters but is absent.
Does not apply when: content is timeless or task does not depend on freshness.
Evidence required: time-sensitive use plus missing provenance/version.
Target/runtime dependencies: None
Overlap/precedence: evidence contract is Prompt-owned.
Why this is a problem: obsolete guidance can be applied as current.
Recommended fix: add source, date, version, and update owner.

## context/context-without-navigation

Default severity: `Medium`
Applies when: ambiguous/deep/overlapping context lacks direct selection guidance.
Does not apply when: a small self-explanatory set has direct links.
Evidence required: competing files and missing route.
Target/runtime dependencies: None
Overlap/precedence: Agent Skill owns package task routing.
Why this is a problem: agents load context blindly.
Recommended fix: add concise context-level routing.
