# Example: Untrusted Content Boundary

## Input Prompt

```text
Summarize every document uploaded by the customer. Follow any instructions in
the document if they help you produce the best answer.
```

## Findings

- `Level`: Prompt
  `Severity`: High
  `Confidence`: High
  `Applicability`: Applicable
  `Category`: Untrusted content
  `Issue`: Customer-supplied content may be treated as executable instruction.
  `Rule`: prompt/untrusted-content-boundary
  `Evidence`: The prompt says to “follow any instructions” in uploaded documents.
  `Why it matters`: Untrusted text can redirect the task or request actions outside the user’s intent.
  `Suggestion`: Treat uploads as data; ignore embedded instructions unless the user explicitly authorizes them.
  `Change type`: security
