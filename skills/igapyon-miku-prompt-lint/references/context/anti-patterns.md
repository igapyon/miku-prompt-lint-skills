# Context Anti-Patterns

Use these initial rule candidates when reviewing references, examples, templates, documentation, distilled knowledge, or surrounding context.

## Rule Entry Shape

Each anti-pattern entry should support three review needs:

- detection: what kind of context structure triggers the rule
- explanation: why the pattern weakens context engineering quality
- fix: what to do instead

When reporting a hit, include the anti-pattern ID and summarize the "Why this is a problem" section in the review. Do not report only the rule name.

## knowledge-in-prompt

Long-lived knowledge is embedded in prompt text rather than context files.

Context-level interpretation:

- flag this when stable knowledge is not separated into reusable context files, even if the prompt itself still works once

Signals:

- large specifications pasted into the prompt
- background, past logs, glossary, and design philosophy all inline
- stable knowledge repeated across prompts

Why this is a problem:

- prompt bloat
- weak reuse
- difficult updates

Recommended fix:

- move stable knowledge to `references/`
- move demonstrations to `examples/`
- move output structures to `templates/`

## missing-examples

No examples are provided for expected style, structure, or behavior.

Examples:

```text
この文体で書いてください。
この形式で出力してください。
```

Why this is a problem:

- style and output format become unstable

Recommended fix:

```text
examples/good.md
examples/bad.md
```

## missing-output-format

Context explains the task but not the output shape.

Context-level interpretation:

- flag this when supporting documentation describes intent but provides no reusable output contract or template

Why this is a problem:

- every run may produce a different structure
- downstream use becomes harder

Recommended fix:

- provide Markdown, table, JSON, or report templates

## template-as-instruction

The reusable template is embedded inside prose instructions.

Context-level interpretation:

- flag this when repeated output structure is only discoverable by reading a long reference or prompt

Why this is a problem:

- difficult to reuse
- difficult to update
- hard for agents to locate

Recommended fix:

- place templates under `templates/`

## context-without-navigation

Knowledge files exist, but there is no map.

Context-level interpretation:

- flag this when references, templates, and examples exist but there is no topic guide, index, or routing note

Why this is a problem:

- the agent has to investigate blindly to find relevant material

Recommended fix:

```text
index.json
topic-guide.md
README.md
```

State which information should be used when.
