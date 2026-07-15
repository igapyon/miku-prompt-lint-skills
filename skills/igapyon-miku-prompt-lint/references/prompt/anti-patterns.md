# Prompt Anti-Patterns

Use [../rule-contract.md](../rule-contract.md). Report only satisfied rules.

## prompt/role-inflation

Default severity: `Low`
Applies when: prestige is substituted for task context.
Does not apply when: role defines domain, audience, simulation, or decision constraints.
Evidence required: prestige wording and absent operational contribution.
Target/runtime dependencies: None
Overlap/precedence: beats vague-quality-demand for role claims.
Why this is a problem: prestige alone provides no evidence or expertise guarantee.
Recommended fix: state task, inputs, criteria, and constraints.

## prompt/private-reasoning-disclosure

Default severity: `Medium`
Applies when: private/internal reasoning is demanded for visible output.
Does not apply when: asking for rationale, assumptions, proof, calculations, transformations, or decision log.
Evidence required: disclosure request.
Target/runtime dependencies: None
Overlap/precedence: separate from ornamental cue.
Why this is a problem: full internal traces are not a stable verification contract.
Recommended fix: request concise rationale and checks.

## prompt/ornamental-reasoning-cue

Default severity: `Low`
Applies when: known target runtime shows a bare cue adds no required workflow.
Does not apply when: runtime is unknown, cue is test-backed, or steps are visible acceptance work.
Evidence required: bare cue and known target context.
Target/runtime dependencies: Model/runtime behavior
Overlap/precedence: specific verification requirement wins.
Why this is a problem: it can add noise without an observable constraint.
Recommended fix: name checks or visible steps.

## prompt/vague-quality-demand

Default severity: `Low`
Applies when: "best", "perfect", or equivalent has no measurable criterion.
Does not apply when: concrete quality criteria follow.
Evidence required: vague demand.
Target/runtime dependencies: None
Overlap/precedence: role claims use role-inflation.
Why this is a problem: success remains undefined.
Recommended fix: specify acceptance criteria.

## prompt/coercive-framing

Default severity: `Low`
Applies when: threats or punishment language substitutes for requirements.
Does not apply when: real legal or safety consequence is stated with an operational rule.
Evidence required: coercive wording.
Target/runtime dependencies: None
Overlap/precedence: instruction conflict wins if requirements conflict.
Why this is a problem: it adds pressure, not executable guidance.
Recommended fix: replace with a concrete boundary.

## prompt/prompt-bloat

Default severity: `Low`
Applies when: residual repetition or stable material obscures material instructions.
Does not apply when: length is needed for task input or a specific rule explains the harm.
Evidence required: buried instruction, conflict, limit, or maintenance burden.
Target/runtime dependencies: Context limits when claimed
Overlap/precedence: umbrella only.
Why this is a problem: important instructions become hard to find.
Recommended fix: consolidate or route reusable material.

## prompt/repeated-instructions

Default severity: `Low`
Applies when: behavior is restated without distinct scope or priority.
Does not apply when: safety/legal boundaries or layers need deliberate repetition.
Evidence required: equivalent repeated text.
Target/runtime dependencies: None
Overlap/precedence: prompt-bloat is fallback.
Why this is a problem: duplication becomes noise.
Recommended fix: retain one scoped instruction.

## prompt/excessive-negative-rules

Default severity: `Low`
Applies when: prohibitions dominate without replacement behavior.
Does not apply when: concise safety, policy, or compliance boundaries are needed.
Evidence required: prohibitions and missing positive alternative.
Target/runtime dependencies: None
Overlap/precedence: instruction conflict wins.
Why this is a problem: the desired behavior is unclear.
Recommended fix: state the replacement behavior.

## prompt/missing-required-input

Default severity: `High`
Applies when: absent supplied facts block reliable execution.
Does not apply when: a known surrounding layer supplies them or clarification is required first.
Evidence required: blocked required input.
Target/runtime dependencies: Instruction layer
Overlap/precedence: use underspecified-context when defaults remain.
Why this is a problem: execution cannot be reliable.
Recommended fix: supply input or require clarification.

## prompt/underspecified-context

Default severity: `Medium`
Applies when: material audience, purpose, constraints, or locale remain vague but defaults exist.
Does not apply when: exploratory/free-form work intentionally leaves discretion.
Evidence required: missing material context.
Target/runtime dependencies: Instruction layer
Overlap/precedence: missing-required-input wins when blocked.
Why this is a problem: results vary unpredictably.
Recommended fix: state the relevant context or default.

## prompt/missing-output-format

Default severity: `Medium`
Applies when: repeatable output shape is material but unspecified.
Does not apply when: free-form, creative, short, or self-evident output is intended.
Evidence required: downstream/repeatable need and no shape.
Target/runtime dependencies: None
Overlap/precedence: success criteria is separate.
Why this is a problem: downstream use is unstable.
Recommended fix: state sections, schema, or ordering.

## prompt/instruction-conflict

Default severity: `Medium`
Applies when: requirements are incompatible or priority is materially ambiguous.
Does not apply when: a priority order resolves them.
Evidence required: conflicting fragments.
Target/runtime dependencies: None
Overlap/precedence: owns style conflicts.
Why this is a problem: no output can satisfy both reliably.
Recommended fix: remove conflict or define priority.

## prompt/missing-success-criteria

Default severity: `Medium`
Applies when: reusable, evaluated, or downstream output lacks acceptance criteria.
Does not apply when: task is exploratory or success is self-evident.
Evidence required: repeatable use and absent criteria.
Target/runtime dependencies: None
Overlap/precedence: output format is separate.
Why this is a problem: quality cannot be assessed consistently.
Recommended fix: state measurable or rubric-based success.

## prompt/missing-fallback-behavior

Default severity: `Medium`
Applies when: missing input, partial result, or tool failure is realistic and unspecified.
Does not apply when: no such failure path exists.
Evidence required: relevant failure path.
Target/runtime dependencies: Tools when relevant
Overlap/precedence: required input is separate.
Why this is a problem: failure handling becomes improvised.
Recommended fix: define clarification, partial-result, or stop behavior.

## prompt/missing-evidence-contract

Default severity: `Medium`
Applies when: factual, research, citation-sensitive, or high-stakes output lacks grounding rules.
Does not apply when: creative or non-factual task has no evidence need.
Evidence required: factual/high-stakes purpose and missing contract.
Target/runtime dependencies: Source access when relevant
Overlap/precedence: Context provenance is separate.
Why this is a problem: unsupported claims are hard to detect.
Recommended fix: state source, citation, freshness, and uncertainty needs.

## prompt/untrusted-content-boundary

Default severity: `High`
Applies when: external email, Web, document, or tool content can be treated as instructions without a boundary.
Does not apply when: untrusted data is clearly delimited and subordinate.
Evidence required: untrusted source plus action/instruction path.
Target/runtime dependencies: External-content handling
Overlap/precedence: unsafe-side-effect-contract owns tool authority.
Why this is a problem: prompt injection can redirect work.
Recommended fix: label data as untrusted and constrain allowed actions.

## prompt/undeclared-capability-or-authority

Default severity: `Medium`
Applies when: a prompt assumes unavailable tools or authority for consequential action.
Does not apply when: capability and approval are explicit.
Evidence required: implicit capability/action.
Target/runtime dependencies: Tool and permission context
Overlap/precedence: unsafe-side-effect-contract is Agent Skill-owned.
Why this is a problem: execution can fail or exceed authority.
Recommended fix: state capability, scope, and approval boundary.
