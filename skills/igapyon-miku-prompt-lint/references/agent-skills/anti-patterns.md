# Agent Skill Anti-Patterns

Use these initial rule candidates when reviewing Agent Skill packages or skill-like workflow bundles.

## Rule Entry Shape

Each anti-pattern entry should support three review needs:

- detection: what kind of Agent Skill structure triggers the rule
- explanation: why the pattern weakens agent usability or maintainability
- fix: what to do instead

When reporting a hit, include the anti-pattern ID and summarize the "Why this is a problem" section in the review. Do not report only the rule name.

## skill-monolith

`SKILL.md` contains everything.

Signals:

- knowledge, examples, templates, rules, and background are all in `SKILL.md`
- activation and core workflow are buried

Why this is a problem:

- hard to read
- hard to maintain
- expensive to load

Recommended fix:

```text
SKILL.md        = entry point, activation, minimal workflow
references/    = knowledge and detailed rules
templates/     = output shapes
examples/      = examples
```

## missing-references

The skill has no `references/`.

Why this is a problem:

- knowledge cannot be externalized
- `SKILL.md` tends to grow into a monolith

Recommended fix:

- put background knowledge, detailed rules, glossary, and design philosophy in `references/`

## missing-templates

The skill has no output templates.

Why this is a problem:

- review reports or generated artifacts do not keep a stable shape

Recommended fix:

```text
templates/review-report.md
templates/revised-prompt.md
```

## missing-topic-guide

The skill supports multiple uses but has no entry guide.

Why this is a problem:

- agents cannot tell which references, templates, or examples to use

Recommended fix:

```text
references/topic-guide.md
```

or another clear guide such as `index.json` plus per-topic `INDEX.md` files.

## missing-index

The skill has no file list or usage map.

Why this is a problem:

- agents have trouble finding the needed material

Recommended fix:

- provide `index.json` or a Markdown catalog
- keep generated indexes reproducible

## examples-free-skill

The skill has no `examples/`.

Why this is a problem:

- expected input and output behavior is unclear

Recommended fix:

```text
examples/good-prompt.md
examples/bad-prompt.md
examples/review-report.md
```

## template-as-instruction

Templates are embedded in instruction text.

Agent Skill-level interpretation:

- flag this when `SKILL.md` or references contain reusable output shapes that should live under `templates/`

Why this is a problem:

- hard to reuse
- hard to update

Recommended fix:

- separate templates into `templates/`

## no-review-mode

The skill only generates; it does not review.

Why this is a problem:

- generated prompts or artifacts cannot be checked for quality

Recommended fix:

- provide explicit modes such as `review`, `revise`, `generate`, and `explain`
- treat `review` as a first-class mode

## generator-first-design

Generation is the main path and review is secondary.

Why this is a problem:

- the skill may mass-produce old-style prompts

Recommended fix:

```text
まずレビュー
必要なら改訂
最後に生成
```

## tool-contract-missing

The skill assumes CLI, MCP, or external tools but does not define the contract.

Why this is a problem:

- tool integration becomes fragile

Recommended fix:

Define:

- input
- output
- errors
- diagnostics
- exit code
- stdout/stderr

## context-without-navigation

The skill has knowledge files but no guide.

Agent Skill-level interpretation:

- flag this when the skill package has multiple references, templates, examples, or generated indexes but no clear entry route for agents

Why this is a problem:

- the agent has to act like a detective

Recommended fix:

```text
index.json
topic-guide.md
README.md
```

Explain what to use and when.
