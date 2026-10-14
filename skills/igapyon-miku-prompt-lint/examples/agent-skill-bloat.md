# Example: Bloated Agent Skill

## Input Summary

```text
SKILL.md contains activation rules, stable domain guidance used by three
workflows, five examples, a strict report shape reused by those workflows, and
development notes. The package has no references/, templates/, or examples/
directory. The stable guidance is difficult to select or update independently,
and the report shape is repeated inline without a reusable template.
```

## Findings

- `Level`: Agent Skill
  `Severity`: Medium
  `Confidence`: High
  `Applicability`: Applicable
  `Category`: Skill structure
  `Issue`: Stable knowledge needed by multiple workflows is difficult to select and maintain independently.
  `Rule`: agent-skill/reusable-knowledge-not-separated
  `Evidence`: Stable domain guidance is used by three workflows, remains inline in `SKILL.md`, and is difficult to select or update independently.
  `Why it matters`: Updates can drift across workflows, and the relevant knowledge cannot be loaded by task.
  `Suggestion`: Move the stable guidance to a directly routed reference.
  `Change type`: maintainability

- `Level`: Agent Skill
  `Severity`: Medium
  `Confidence`: High
  `Applicability`: Applicable
  `Category`: Reusable output shape
  `Issue`: Repeated report structures exist only as prose in `SKILL.md`.
  `Rule`: agent-skill/reusable-output-shape-missing
  `Evidence`: The strict report shape is reused by three workflows but is repeated inline, with no reusable template.
  `Why it matters`: Output shape drifts when a reusable template is unavailable.
  `Suggestion`: Add a report template and route the workflow to it when that report is requested.
  `Change type`: maintainability
