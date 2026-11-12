# Review Output Contract

Use the concise report by default. Use the detailed report when the user asks
for a detailed audit or its full field set. Follow a user-supplied output format
when present. Read the selected template before reporting.

Static review identifies risks; it does not prove model performance or artifact
correctness. Distinguish instructions visible in supplied files from observed
runtime behavior. Do not report unobserved behavior as a fact.

## Severity And Confidence

- `High`: likely incorrect, unsafe, unverifiable, or operationally broken.
- `Medium`: likely harms quality, reliability, reuse, or maintainability.
- `Low`: non-blocking improvement.

`Confidence` is detection certainty, not impact. Use `High`, `Medium`, or
`Low`. Unknown model/runtime information cannot justify High confidence for a
model-dependent Rule. Direct evidence of an instruction or file defect can still
support high confidence when model/runtime details are unknown.

Use the active Rule's default severity unless that Rule defines an escalation
or reduction condition and the supplied evidence meets it. Do not change
severity solely because the concise or detailed report was requested, or solely
because the domain sounds high stakes. Report mode changes detail, not Rule
selection, applicability, severity, or confidence for the same evidence. If a
Rule default is overridden, include a `Severity rationale` in either report
mode.

## Concise Finding Contract

Every concise finding retains `Level`, `Severity`, `Confidence`, `Rule`,
`Issue`, `Evidence`, and `Suggestion`. `Applicability` is implicit as
Applicable for findings. Include the consequence in `Issue` or `Why it matters`
when it helps the user decide what to change. Do not omit a material finding to
meet a length target.

## Detailed Finding Contract

Use one Level: `Prompt`, `Context`, `Agent Skill`, or `Repository/Harness`.
Use `prompt/`, `context/`, `agent-skill/`, or `repository/` Rule IDs.

Every detailed finding contains `Level`, `Severity`, `Confidence`,
`Applicability: Applicable`, `Category`, `Issue`, `Rule`, `Evidence`,
`Why it matters`, `Suggestion`, and exactly one Change type:
`correctness`, `security`, `reliability`, `reproducibility`,
`maintainability`, or `optional polish`.

Include `Severity rationale` only when overriding a Rule default. Put `Not
applicable` and `Not assessed` in assessment notes, not findings. Lead with
findings, merge duplicate root causes, then include strengths when useful.
