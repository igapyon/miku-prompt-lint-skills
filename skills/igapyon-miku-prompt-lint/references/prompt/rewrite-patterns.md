# Rewrite Patterns

Use these patterns when modernizing prompt text.

## Replace Persona With Task Context

Before:

```text
You are a world-class expert consultant with decades of experience.
```

After:

```text
Review the text as a domain expert for the specified audience and constraints.
```

## Replace Private-Reasoning Disclosure

Before:

```text
Show your complete private reasoning.
```

After:

```text
Provide a concise rationale, key assumptions, and any verification steps.
```

## Convert Vague Quality Requests

Before:

```text
Make it perfect, detailed, and professional.
```

After:

```text
Check for factual accuracy, missing constraints, unclear audience assumptions, and inconsistent terminology.
```

## Add Missing Input Boundaries

Use this shape:

```text
Input:
- Source text: <paste text>
- Audience: <audience>
- Goal: <goal>
- Constraints: <constraints>
```

## Add Output Contract

Use this shape:

```text
Output:
1. Findings ordered by severity.
2. Reason for each finding.
3. Concrete improvement suggestions.
4. Revised version when the change is straightforward.
```

## Add Missing-Information Behavior

Use this shape:

```text
If required information is missing, list the missing inputs first and avoid inventing specifics.
```
