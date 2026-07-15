# Example: Bloated Agent Skill

## Input Summary

```text
SKILL.md contains activation rules, a long tutorial, five examples, detailed
output templates, and development notes. The package has no references/,
templates/, or examples/ directory.
```

## Findings

- `Level`: Agent Skill
  `Severity`: Medium
  `Confidence`: High
  `Applicability`: Applicable
  `Category`: Skill structure
  `Issue`: Stable tutorials, examples, and output shapes are loaded through one `SKILL.md`.
  `Rule`: agent-skill/skill-monolith
  `Evidence`: The supplied package has no `references/`, `templates/`, or `examples/` directories.
  `Why it matters`: Activation and routing cannot be read separately from detailed knowledge.
  `Suggestion`: Keep activation and routing in `SKILL.md`; move stable details into linked resources.
  `Change type`: maintainability

- `Level`: Agent Skill
  `Severity`: Medium
  `Confidence`: High
  `Applicability`: Applicable
  `Category`: Reusable output shape
  `Issue`: Repeated report structures exist only as prose in `SKILL.md`.
  `Rule`: agent-skill/reusable-output-shape-missing
  `Evidence`: The supplied package has no `templates/` directory despite repeated report instructions.
  `Why it matters`: Output shape drifts when a reusable template is unavailable.
  `Suggestion`: Add a report template and route the workflow to it when that report is requested.
  `Change type`: maintainability
