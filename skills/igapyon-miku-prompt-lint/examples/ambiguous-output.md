# Example: Ambiguous Output Prompt

## Input Prompt

```text
Summarize this document nicely. Make it useful for everyone.
```

## Review

**Findings**

- `High` Context Gap: The source document, audience, and purpose are not defined.
  Reason: A summary for executives, implementers, and reviewers would emphasize different details.
  Suggestion: Add source text, target audience, and intended use.

- `Medium` Ambiguous Output Conditions: "nicely" and "useful" do not specify format or acceptance criteria.
  Reason: The output may be too long, too short, or structured in an unusable way.
  Suggestion: Specify sections, length, and how to handle uncertainty.

**Revised Prompt**

```text
Summarize the source document for the specified audience.

Input:
- Source document: <paste document>
- Audience: <audience>
- Intended use: <decision, briefing, implementation, review, or other>

Return:
1. A 3-5 bullet executive summary.
2. Key details grouped by topic.
3. Open questions or missing information.

If the source document is missing or the audience is unclear, ask for the missing input before summarizing.
```
