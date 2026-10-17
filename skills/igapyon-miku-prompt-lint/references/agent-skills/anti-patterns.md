# Agent Skill Anti-Patterns

Use [../rule-contract.md](../rule-contract.md).

## agent-skill/activation-boundary-mismatch

Default severity: `Medium`
Applies when: discovery instructions or a runtime route contradict the target's declared activation policy, such as unintended automatic activation, rejection of an intended name or alias, or loading instructions or starting work before required introduction consent.
Does not apply when: deliberate explicit-only or explicit-first scope is respected, including an optional introduction-and-consent route; unnamed in-domain requests may remain inactive. Shared capabilities with distinct explicit entry points, or automatic discovery intentionally permitted by the target, are not defects by themselves.
Evidence required: declared policy, concrete should-activate and should-stay-inactive cases, and the conflicting instruction or supplied observation; include an introduction-only case when applicable.
Target/runtime dependencies: Known Skill platform for host-dependent claims; None for a direct policy/instruction contradiction.
Overlap/precedence: activation and introduction gating are Agent Skill-owned; report a distinct consequential-action authority gap under unsafe-side-effect-contract.
Why this is a problem: an unintended workflow captures the request, an unapproved introduction loads instructions, or an intended invocation is blocked.
Recommended fix: align discovery metadata, supported names and aliases, and any introduction/consent route with the intended policy. Keep introduction-only guidance available before loading the Skill; preserve deliberate opt-in scope instead of broadening triggers merely to increase discovery.

## agent-skill/skill-monolith

Default severity: `Medium`
Applies when: SKILL.md buries detailed rules, variants, examples, and background.
Does not apply when: a small Skill has no stable detail to externalize.
Evidence required: core workflow obscured by detail.
Target/runtime dependencies: None
Overlap/precedence: reusable knowledge separation is more specific.
Why this is a problem: loading and maintenance become costly.
Recommended fix: retain routing/core workflow and route stable detail.

## agent-skill/reusable-knowledge-not-separated

Default severity: `Medium`
Applies when: stable reusable detail remains inline and harms routing or maintenance.
Does not apply when: no separate stable knowledge exists.
Evidence required: reusable detail and harm.
Target/runtime dependencies: None
Overlap/precedence: skill-monolith is fallback.
Why this is a problem: stable knowledge drifts.
Recommended fix: use a directly routed reference.

## agent-skill/reusable-output-shape-missing

Default severity: `Medium`
Applies when: repeated strict output needs no reusable shape.
Does not apply when: output is simple or free-form.
Evidence required: repeated shape need.
Target/runtime dependencies: None
Overlap/precedence: Context owns malformed template.
Why this is a problem: output varies unnecessarily.
Recommended fix: expose a reusable shape in an appropriate resource.

## agent-skill/behavior-examples-missing

Default severity: `Low`
Applies when: non-obvious or edge-sensitive behavior needs demonstration.
Does not apply when: behavior is deterministic and self-evident.
Evidence required: unresolved behavior ambiguity.
Target/runtime dependencies: None
Overlap/precedence: Context owns example quality.
Why this is a problem: expected use is unclear.
Recommended fix: add the smallest representative example.

## agent-skill/resource-routing-missing

Default severity: `Medium`
Applies when: multiple package resources lack task-to-resource routing.
Does not apply when: direct links and a small self-explanatory set suffice.
Evidence required: resources and ambiguous selection.
Target/runtime dependencies: None
Overlap/precedence: inventory is not routing.
Why this is a problem: agents explore blindly.
Recommended fix: route each task to relevant resources.

## agent-skill/validation-step-missing

Default severity: `Medium`
Applies when: promised quality/mutation workflow lacks an execution acceptance check.
Does not apply when: explicit acceptance checks exist or no such promise exists.
Evidence required: workflow and missing self-check.
Target/runtime dependencies: None
Overlap/precedence: behavior-not-validated needs independent forward-test evidence.
Why this is a problem: unsafe output can proceed unchecked.
Recommended fix: add a proportional acceptance or verification step.

## agent-skill/behavior-not-validated

Default severity: `Medium`
Applies when: supplied evaluation evidence shows complex/high-impact behavior has no forward test.
Does not apply when: source/evaluation evidence is absent or adequate test exists.
Evidence required: supplied evaluation surface and missing forward test.
Target/runtime dependencies: None
Overlap/precedence: suppress if same evidence only supports validation-step-missing.
Why this is a problem: structure does not prove runtime behavior.
Recommended fix: add independent raw-artifact forward tests.

## agent-skill/broken-resource-route

Default severity: `Medium`
Applies when: required linked resource is missing or unreadable; raise High if blocked.
Does not apply when: resource is optional or alternate route works.
Evidence required: broken required link/path.
Target/runtime dependencies: Filesystem/package
Overlap/precedence: repository index is separate.
Why this is a problem: workflow cannot complete.
Recommended fix: repair route or state fallback.

## agent-skill/invalid-package-metadata

Default severity: `Medium`
Applies when: known platform profile requires invalid/mismatched metadata; raise High if discovery fails.
Does not apply when: platform/profile is unknown or metadata is optional.
Evidence required: known profile and invalid metadata.
Target/runtime dependencies: Known Skill platform
Overlap/precedence: repository metadata is separate.
Why this is a problem: Skill may not activate or load.
Recommended fix: align metadata with the known profile.

## agent-skill/tool-contract-missing

Default severity: `Medium`
Applies when: integration lacks observable input/output, preconditions, errors, fallback, or retry behavior.
Does not apply when: no integration is assumed.
Evidence required: tool dependency and omitted contract.
Target/runtime dependencies: Tool availability/version
Overlap/precedence: unsafe side effects are separate.
Why this is a problem: integrations fail unpredictably.
Recommended fix: define observable contract and fallback.

## agent-skill/unsafe-side-effect-contract

Default severity: `High`
Applies when: external/destructive action lacks authority, confirmation, least-privilege, secret, or postcondition boundary.
Does not apply when: safe authority and confirmation are explicit.
Evidence required: consequential action and absent boundary.
Target/runtime dependencies: Tools and permissions
Overlap/precedence: Prompt owns wording-only authority gaps.
Why this is a problem: agent actions can exceed user intent.
Recommended fix: require scoped authority and confirmation.
