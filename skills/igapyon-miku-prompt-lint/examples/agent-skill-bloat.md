# Example: Bloated Agent Skill

## Input Summary

```text
SKILL.md contains activation rules, a long tutorial, five examples, detailed output templates, and development notes. The skill has no references/ or examples/ directory.
```

## Review

**Strengths**

- The package keeps the important information in one visible place, so the intended workflow is not hidden.

**Findings**

- `High` SKILL.md Bloat: Stable detailed guidance and examples are embedded directly in `SKILL.md`.
  Reason: `SKILL.md` should stay focused on activation, routing, and the core workflow so agents can load it cheaply.
  Suggestion: Move detailed rubrics to `references/` and demonstrations to `examples/`.

- `Medium` Missing Examples Directory: Examples exist, but they are not separated from core instructions.
  Reason: Examples are useful only when needed; forcing them into every activation wastes context.
  Suggestion: Create `examples/normal-case.md` and `examples/edge-case.md` with expected outputs.

- `Medium` Missing Templates: Output structures are described in prose instead of reusable templates.
  Reason: Repeated report shapes should be easy to copy and adapt.
  Suggestion: Add `templates/review-report.md`.

**Revised Structure**

```text
skills/example-skill/
├── SKILL.md
├── references/
│   ├── workflow.md
│   └── output-rules.md
├── templates/
│   └── review-report.md
└── examples/
    ├── normal-case.md
    └── edge-case.md
```
