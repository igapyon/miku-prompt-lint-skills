---
name: igapyon-miku-prompt-lint
description: Use only when the user explicitly names miku-prompt-lint or igapyon-miku-prompt-lint, or asks to lint, audit, or diagnose an LLM prompt, AI-agent context package, Agent Skill, or supplied Agent Skill repository/harness for prompt/context-engineering quality risks. Do not activate for generic code review, document review, prose editing, source-code templates, or generic repository review unless explicitly named. Review the artifact itself; do not infer whether the author was human or generated AI.
---

# igapyon-miku-prompt-lint

Review Prompt, Context, Agent Skill, and supplied Repository/Harness artifacts.
Review the artifact, not its author; do not request private reasoning.

## Workflow

1. If [index.json](index.json) exists, read it for discovery; otherwise continue without creating one.
2. Read [review-levels.md](references/review-levels.md) and identify only supplied Levels.
3. Read each selected `checkpoints.md` and `anti-patterns.md` before emitting a Rule ID or formal finding.
4. Read [output-format.md](references/output-format.md) and the report template before reporting.
5. Use the most specific owning Level once. Mark absent prerequisites `Not assessed`.
6. Read [rule-migrations.json](references/rule-migrations.json) only to interpret historical Rule IDs.
7. Read prompt rewrite patterns only when revised prompt material is useful.

For a follow-up single prompt skeleton, use the [template-selection workflow](references/template-selection/workflow.md); keep unknown values as `TODO:`.

## References

- [review-levels.md](references/review-levels.md)
- [rule-contract.md](references/rule-contract.md)
- [output-format.md](references/output-format.md)
- [prompt references](references/prompt/INDEX.md)
- [context references](references/context/INDEX.md)
- [Agent Skill references](references/agent-skills/INDEX.md)
- [Repository/Harness references](references/repository/INDEX.md)
- [template-selection workflow](references/template-selection/INDEX.md)
- [review report template](templates/review-report.md)
