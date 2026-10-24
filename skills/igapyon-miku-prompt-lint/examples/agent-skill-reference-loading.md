# Required Reference Without a Read Route

## Input Summary

```text
Complete package supplied:
- SKILL.md maps report tasks to references/report-policy.md.
- Its workflow says only: “Draft the report.”
- references/report-policy.md contains required rounding and disclosure rules.

The workflow never directs the agent to read or apply the mapped policy before drafting.
```

## Findings

- `Level`: Agent Skill
  `Severity`: Medium
  `Confidence`: High
  `Applicability`: Applicable
  `Category`: Navigation
  `Issue`: The workflow links required policy but does not direct the agent to read it before drafting.
  `Rule`: agent-skill/resource-routing-missing
  `Evidence`: `SKILL.md` maps report tasks to `references/report-policy.md`, while its workflow says only “Draft the report.”; the supplied policy contains required rounding and disclosure rules.
  `Why it matters`: The agent can draft without applying required report constraints.
  `Suggestion`: Direct the agent to read and apply `references/report-policy.md` before drafting.
  `Change type`: reliability

## Strengths

- The required policy file exists and is directly linked.
