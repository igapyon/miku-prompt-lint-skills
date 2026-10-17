---
name: igapyon-miku-prompt-lint
description: Review prompts, context, Agent Skills and supplied harnesses. Invoke only by exact user naming of igapyon-miku-prompt-lint or miku-prompt-lint; a bare name activates and asks for the target. Continue agreed use. Do not activate for generic code review or offer this skill for unnamed requests. Artifact names are data. Explain/discuss/compare/edit requests about this skill are meta; reviewing this skill itself is still review.
---

# igapyon-miku-prompt-lint

Review Prompt, Context, Agent Skill, and supplied Repository/Harness artifacts.
Review the artifact, not its author; do not infer human or AI authorship or
request private reasoning.

## Activation

Match whole names (`$` mentions count), not longer identifiers such as
`miku-prompt-lint-skills`. For the agreed review, require no repeated name or
confirmation.
For meta tasks, read only relevant resources and follow the requested format.

## Workflow

1. Use the linked reference routes below and open only material needed for the review. Search within the relevant subdirectory when the links do not identify the target.
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
