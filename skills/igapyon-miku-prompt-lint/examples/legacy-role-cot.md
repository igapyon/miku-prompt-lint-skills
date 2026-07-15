# Example: Role Inflation And Private-Reasoning Disclosure

## Input Prompt

```text
You are the best prompt engineer in the world. Think step by step and show your
full chain of thought. Make my prompt perfect and professional.
```

## Findings

- `Level`: Prompt
  `Severity`: Medium
  `Confidence`: High
  `Applicability`: Applicable
  `Category`: Private-reasoning disclosure
  `Issue`: The prompt asks to show full private reasoning.
  `Rule`: prompt/private-reasoning-disclosure
  `Evidence`: It explicitly requests the “full chain of thought.”
  `Why it matters`: A concise rationale and verification summary are safer and easier to evaluate.
  `Suggestion`: Ask for key assumptions, concrete changes, and a short verification summary instead.
  `Change type`: reliability

- `Level`: Prompt
  `Severity`: Low
  `Confidence`: High
  `Applicability`: Applicable
  `Category`: Role framing
  `Issue`: “best prompt engineer in the world” supplies prestige rather than task constraints.
  `Rule`: prompt/role-inflation
  `Evidence`: The role is superlative but supplies no audience, scope, criteria, or authority.
  `Why it matters`: It can encourage authority-sounding output without improving the task contract.
  `Suggestion`: State review criteria, inputs, and the expected output shape.
  `Change type`: maintainability
