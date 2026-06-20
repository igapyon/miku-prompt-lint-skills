# Example: Legacy Role And Chain-of-Thought Prompt

## Input Prompt

```text
You are the best prompt engineer in the world. Think step by step and show your full chain of thought. Make my prompt perfect and professional. Be very careful.
```

## Review

**Findings**

- `High` Chain-of-Thought Forcing: The prompt asks for full hidden reasoning.
  Reason: Modern prompts should request a concise rationale or verification summary instead of private reasoning.
  Suggestion: Ask for key assumptions and a short explanation of changes.

- `Medium` Redundant Boilerplate: "best" and "perfect" do not define useful criteria.
  Reason: The model cannot optimize against undefined quality terms.
  Suggestion: Specify the review categories and output shape.

**Revised Prompt**

```text
Review the prompt below for clarity, missing context, output ambiguity, and reuse problems.

Input prompt:
<paste prompt>

Return:
1. Findings ordered by severity.
2. A brief reason for each finding.
3. Concrete improvement suggestions.
4. A revised prompt when the fix is straightforward.

Do not reveal hidden Chain-of-Thought. Provide concise rationale only.
```
