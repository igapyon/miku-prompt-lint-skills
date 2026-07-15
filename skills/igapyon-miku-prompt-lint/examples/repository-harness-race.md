# Example: Repository Harness Race

## Input Summary

```text
Two test files run in parallel and both write `tmp/report.json`. Each test then
asserts that the file contains its own result.
```

## Findings

- `Level`: Repository/Harness
  `Severity`: High
  `Confidence`: High
  `Applicability`: Applicable
  `Category`: Test isolation
  `Issue`: Parallel tests share one mutable output path.
  `Rule`: repository/shared-output-test-race
  `Evidence`: Both tests write and read `tmp/report.json`.
  `Why it matters`: Results become order-dependent and can fail intermittently.
  `Suggestion`: Give each test an isolated temporary directory or serialize the shared operation.
  `Change type`: reliability
