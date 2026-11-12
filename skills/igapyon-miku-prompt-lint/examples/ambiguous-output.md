# Example: Missing Source Document

## Input Prompt

```text
Summarize this document nicely. Make it useful for everyone.
```

## Findings

- `Level`: Prompt
  `Severity`: High
  `Confidence`: High
  `Applicability`: Applicable
  `Category`: Required input
  `Issue`: The source document is not supplied.
  `Rule`: prompt/missing-required-input
  `Evidence`: “this document” is referenced but no document accompanies the request.
  `Why it matters`: The requested task cannot be performed without inventing source material.
  `Suggestion`: Supply the document or a stable path to it before requesting a summary.
  `Change type`: correctness

