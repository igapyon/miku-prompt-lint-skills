# Example: Context Without Navigation

## Input Summary

```text
The package has references/api.md, references/policy.md, references/style.md, templates/report.md, and examples/sample.md. SKILL.md only says "read the relevant files" and does not explain which file to use when.
```

## Review

**Strengths**

- The package already separates stable knowledge, templates, and examples into different directories.

**Findings**

- `Medium` Context Review: The context has useful files but no route map.
  Rule: `context-without-navigation`
  Why it matters: The agent must inspect files blindly before it can decide which context is relevant. This wastes context and can lead to missed or stale guidance.
  Suggestion: Add a short topic guide that maps tasks to files.

- `Low` Context Review: The example file is present, but its intended use is not described.
  Rule: `missing-examples` partial
  Why it matters: An example is less useful when the agent cannot tell whether it is a normal case, edge case, or preferred output.
  Suggestion: Rename or document the example's role.

**Revised Structure**

```text
references/
├── topic-guide.md
├── api.md
├── policy.md
└── style.md
templates/
└── report.md
examples/
└── normal-report.md
```

`references/topic-guide.md` should explain when to read each reference, template, and example.
