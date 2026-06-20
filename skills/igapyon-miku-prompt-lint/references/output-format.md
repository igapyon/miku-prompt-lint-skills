# Output Format

Use a concise review report. Match the user's language unless requested otherwise.

## Default Shape

```markdown
**Strengths**
- What is already working.

**Findings**
- `Severity` Category: Issue.
  Rule: Anti-pattern ID when applicable.
  Why it matters: Why this weakens prompt, context, or Agent Skill quality.
  Suggestion: How to improve it.

**Revised Prompt**
```text
...
```
```

Omit `Revised Prompt` when the user asks only for diagnosis and a rewrite would be premature. For context or Agent Skill reviews, replace it with `Revised Structure`, `Revised SKILL.md Excerpt`, or another concrete artifact label.

## Finding Rules

- Lead with the most important issues.
- Merge duplicates instead of listing every repeated phrase.
- Quote only short prompt fragments when needed for clarity.
- When an anti-pattern ID applies, include the ID and explain why it matters.
- Do not report a rule hit without an explanation.
- Do not label text as AI-written, human-written, generated, or suspicious.
- Do not moralize. Treat the prompt as an editable artifact.
- Include strengths when they help preserve good structure during revision.

## Revision Rules

When writing a revised prompt:

- preserve the user's intended task
- remove decorative boilerplate
- avoid forced Chain-of-Thought disclosure
- include clear input placeholders
- include concrete output requirements
- include uncertainty or missing-information behavior when useful
- keep the revision easy to reuse

When revising context or Agent Skill structure:

- preserve useful existing files
- move stable detail into references
- keep `SKILL.md` focused on activation, routing, and core workflow
- add examples or templates only when they clarify repeated behavior
- keep generated indexes reproducible

## When the Prompt Is Underspecified

If the user's prompt cannot be safely revised because key information is missing, return findings and a "Needed Inputs" section instead of inventing details.
