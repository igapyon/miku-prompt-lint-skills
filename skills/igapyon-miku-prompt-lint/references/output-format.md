# Review Output Contract

Use [the canonical report template](../templates/review-report.md). Static lint
identifies risks; it does not prove model performance or artifact correctness.

## Severity And Confidence

- `High`: likely incorrect, unsafe, unverifiable, or operationally broken.
- `Medium`: likely harms quality, reliability, reuse, or maintainability.
- `Low`: non-blocking improvement.

`Confidence` is detection certainty, not impact. Use `High`, `Medium`, or `Low`.
Unknown model/runtime information cannot justify High confidence for a
model-dependent Rule.

## Finding Contract

Use one Level: `Prompt`, `Context`, `Agent Skill`, or `Repository/Harness`.
Use `prompt/`, `context/`, `agent-skill/`, or `repository/` Rule IDs.

Every formal finding contains `Level`, `Severity`, `Confidence`,
`Applicability: Applicable`, `Category`, `Issue`, `Rule`, `Evidence`, `Why it
matters`, `Suggestion`, and exactly one Change type:
`correctness`, `security`, `reliability`, `reproducibility`, `maintainability`,
or `optional polish`.

Include `Severity rationale` only when overriding a Rule default. Put `Not
applicable` and `Not assessed` in assessment notes, not findings. Lead with
findings, merge duplicate root causes, then include strengths.
