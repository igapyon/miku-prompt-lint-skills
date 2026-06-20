---
name: igapyon-miku-prompt-lint
description: Use only when the user explicitly names miku-prompt-lint, igapyon-miku-prompt-lint, prompt lint, context engineering review, Agent Skill review, or asks to lint, audit, diagnose, or review prompts, surrounding context, references, examples, templates, knowledge placement, or Agent Skill structure for anti-patterns and quality risks. Do not use for ordinary rewriting, editing, summarizing, documentation cleanup, or general improvement requests unless the user asks for review/lint/audit/diagnosis or names this skill. Review the artifact itself; do not infer whether the author was human or generated AI.
---

# igapyon-miku-prompt-lint

Use this skill to review prompts, surrounding context, knowledge structure, and Agent Skills.

Prompt Review, Context Review, and Agent Skill Review are all first-class targets. Treat Prompt Review as the smallest entry point, not as the only initial scope.

## Core Rules

- Review the artifact itself, not the author.
- Do not judge, infer, or mention whether the prompt was written by a human or generated AI.
- Do not expose or request hidden Chain-of-Thought. Recommend concise reasoning summaries or verifiable rationale instead.
- Prefer reusable task framing, explicit inputs, clear constraints, and testable output requirements.
- Treat the skill as a reviewer, not a prompt generator. Provide revised text only as a concrete improvement aid.
- Keep the user's intent unless the prompt is unsafe, self-contradictory, or underspecified.

## Required Workflow

1. Read [index.json](index.json) first to discover bundled files.
2. Identify the review level: Prompt, Context, Agent Skill, or mixed.
3. Read [references/review-levels.md](references/review-levels.md) for level selection.
4. Read only the matching checkpoint file for the selected level:
   - Prompt: [references/prompt/checkpoints.md](references/prompt/checkpoints.md)
   - Context: [references/context/checkpoints.md](references/context/checkpoints.md)
   - Agent Skill: [references/agent-skills/checkpoints.md](references/agent-skills/checkpoints.md)
5. For diagnostic review, lint, audit, or anti-pattern detection, read the matching `anti-patterns.md` file and report rule IDs with reasons. For lightweight advice requests, the matching checkpoints file may be enough.
6. For mixed reviews, read only the checkpoint and anti-pattern files for the levels actually present.
7. Read [references/output-format.md](references/output-format.md) before composing the result.
8. Read [references/prompt/rewrite-patterns.md](references/prompt/rewrite-patterns.md) when revised prompt material is needed.
9. If the review target is not provided, ask for the prompt, context files, or Agent Skill files before reviewing.

## Review Scope

For prompt text, check for:

- outdated prompt design
- redundant or ornamental boilerplate
- excessive persona or role assignment
- Chain-of-Thought forcing or hidden-reasoning leakage
- missing input context
- vague task boundaries
- ambiguous output format or acceptance criteria
- brittle one-off instructions that reduce reuse
- conflicts between instructions

For surrounding context, check for:

- missing references, examples, templates, or documentation
- misplaced knowledge
- redundant context
- weak navigation
- unclear source of truth

For Agent Skills, check for:

- bloated `SKILL.md`
- insufficient separation into `references/`
- missing `templates/` or `examples/`
- missing topic guide or navigation aids
- missing or stale `index.json`
- weak knowledge structure

## Response Contract

Return:

1. strengths
2. issues
3. reasons explaining why each issue weakens quality
4. improvement suggestions
5. revised prompt, context structure, or Agent Skill material when useful

When an anti-pattern rule matches, include the rule ID and explain why it matters. Do not list rule IDs without reasons.

Use Japanese when the user writes Japanese, English when the user writes English, or the user's requested language when specified.

## References

- [index.json](index.json) for generated bundled-file discovery
- [references/review-levels.md](references/review-levels.md) for Prompt / Context / Agent Skill level selection
- [references/prompt/INDEX.md](references/prompt/INDEX.md) for Prompt Review reference navigation
- [references/context/INDEX.md](references/context/INDEX.md) for Context Review reference navigation
- [references/agent-skills/INDEX.md](references/agent-skills/INDEX.md) for Agent Skill Review reference navigation
- [references/prompt/checkpoints.md](references/prompt/checkpoints.md) for Prompt Review checkpoints
- [references/prompt/anti-patterns.md](references/prompt/anti-patterns.md) for Prompt Review anti-pattern rules
- [references/context/checkpoints.md](references/context/checkpoints.md) for Context Review checkpoints
- [references/context/anti-patterns.md](references/context/anti-patterns.md) for Context Review anti-pattern rules
- [references/agent-skills/checkpoints.md](references/agent-skills/checkpoints.md) for Agent Skill Review checkpoints
- [references/agent-skills/anti-patterns.md](references/agent-skills/anti-patterns.md) for Agent Skill Review anti-pattern rules
- [references/output-format.md](references/output-format.md) for response structure
- [references/prompt/rewrite-patterns.md](references/prompt/rewrite-patterns.md) for prompt modernization patterns
- [templates/review-report.md](templates/review-report.md) for a reusable report shape
- [templates/revised-prompt.md](templates/revised-prompt.md) for revised prompt structure
- [templates/revised-context-structure.md](templates/revised-context-structure.md) for revised context layout
- [templates/revised-agent-skill-structure.md](templates/revised-agent-skill-structure.md) for revised Agent Skill layout
- [examples/](examples/) for sample reviews
