# Example: Context Without Navigation

## Input Summary

```text
The package has references/api.md, references/policy.md, references/style.md,
templates/report.md, and examples/sample.md. SKILL.md only says “read the
relevant files” and does not explain which file to use when.
```

## Findings

- `Level`: Context
  `Severity`: Medium
  `Confidence`: High
  `Applicability`: Applicable
  `Category`: Navigation
  `Issue`: Useful context files have no task-to-file route map.
  `Rule`: context/context-without-navigation
  `Evidence`: The only routing instruction is “read the relevant files.”
  `Why it matters`: The agent must investigate blindly before choosing context.
  `Suggestion`: Add an index that maps task conditions to references, templates, and examples.
  `Change type`: reliability

- `Level`: Context
  `Severity`: Low
  `Confidence`: High
  `Applicability`: Applicable
  `Category`: Examples
  `Issue`: `sample.md` does not identify its scenario or expected behavior.
  `Rule`: context/weak-examples
  `Evidence`: Its filename and the supplied navigation provide no normal-case, edge-case, or expected-output role.
  `Why it matters`: The example cannot reliably guide execution.
  `Suggestion`: Label its scenario and expected result, or replace it with a focused example.
  `Change type`: maintainability
