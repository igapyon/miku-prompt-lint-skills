# Example: Skill Resource Routing Without a Task Map

## Input Summary

```text
The Skill package has references/api.md, references/policy.md,
references/style.md, templates/report.md, and examples/sample.md. Its SKILL.md
only says “read the relevant files”; it does not map task conditions to the
reference, template, or example that should be loaded.
```

## Findings

- `Level`: Agent Skill
  `Severity`: Medium
  `Confidence`: High
  `Applicability`: Applicable
  `Category`: Navigation
  `Issue`: The Skill has multiple package resources but no task-to-resource routing.
  `Rule`: agent-skill/resource-routing-missing
  `Evidence`: `SKILL.md` only says “read the relevant files” and does not map task conditions to resources.
  `Why it matters`: The agent must investigate blindly before choosing context.
  `Suggestion`: Add direct task-condition routes to the relevant references, template, and example.
  `Change type`: reliability
