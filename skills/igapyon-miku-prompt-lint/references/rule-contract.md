# Rule Authoring Contract

Every active anti-pattern uses these exact labels:

```text
Default severity:
Applies when:
Does not apply when:
Evidence required:
Target/runtime dependencies:
Overlap/precedence:
Why this is a problem:
Recommended fix:
```

Use `None` when a dependency or overlap does not exist. Report the most specific
applicable Rule; use an umbrella Rule only when no specific Rule explains the
same observable harm. A known target runtime or measured evaluation overrides a
generic heuristic.
