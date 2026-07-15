# Example: Conflicting Sources Of Truth

## Input Summary

```text
policy.md says the report uses ISO dates. style.md says to use month names.
Neither file identifies which instruction wins or when it was last updated.
```

## Findings

- `Level`: Context
  `Severity`: Medium
  `Confidence`: High
  `Applicability`: Applicable
  `Category`: Source of truth
  `Issue`: Two context files prescribe conflicting date formats without precedence.
  `Rule`: context/conflicting-source-of-truth
  `Evidence`: `policy.md` requires ISO dates while `style.md` requires month names.
  `Why it matters`: The result depends on arbitrary file selection.
  `Suggestion`: Name the canonical owner, define precedence, and retire or update the conflicting instruction.
  `Change type`: correctness
