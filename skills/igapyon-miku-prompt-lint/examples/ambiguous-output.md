# Example: Ambiguous Output Prompt

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

- `Level`: Prompt
  `Severity`: Medium
  `Confidence`: High
  `Applicability`: Applicable
  `Category`: Output contract
  `Issue`: “nicely” and “useful” do not define a usable output shape.
  `Rule`: prompt/missing-output-format
  `Evidence`: The prompt does not state sections, length, format, or how uncertainty should be reported.
  `Why it matters`: Results can vary in length and purpose on each run.
  `Suggestion`: Specify the audience, sections, length, and missing-information behavior.
  `Change type`: reliability
