# Example: Unsafe Side Effect Contract

## Input Summary

```text
The skill says “clean up stale remote branches and publish the result.” It does
not name the repository, approval step, command boundary, or dry-run behavior.
```

## Findings

- `Level`: Agent Skill
  `Severity`: High
  `Confidence`: High
  `Applicability`: Applicable
  `Category`: Side effects
  `Issue`: A destructive remote action has no explicit approval or scope contract.
  `Rule`: agent-skill/unsafe-side-effect-contract
  `Evidence`: The workflow asks to delete branches and publish without scope or confirmation requirements.
  `Why it matters`: The skill can cause irreversible changes outside the intended target.
  `Suggestion`: Require an explicit repository, branch list, dry run, and user approval before deletion or publication.
  `Change type`: security
