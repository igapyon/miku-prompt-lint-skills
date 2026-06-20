# miku-prompt-lint

`miku-prompt-lint` is a content-only Agent Skill repository for reviewing prompt, context, knowledge, and Agent Skill quality.

The name is `miku-prompt-lint`, but the project is intentionally closer to Context Engineering Review. It helps find anti-patterns and improvement opportunities in the guidance given to AI agents.

The canonical skill source is:

- `skills/igapyon-miku-prompt-lint/`

This repository does not provide a CLI runtime. The skill is centered on `SKILL.md`, `references/`, `templates/`, and `examples/`.

Review checkpoints are organized by target under `references/prompt/`, `references/context/`, and `references/agent-skills/`.
Initial anti-pattern rule candidates are stored as `anti-patterns.md` in each target directory.

## Project Philosophy

This project is not a prompt-writing tool.

It is a review tool for prompts, context, and Agent Skills.

It is also not a correctness judge. It identifies anti-patterns, quality risks, missing structure, and improvement opportunities. Like ESLint supports JavaScript quality, `miku-prompt-lint` supports Prompt Engineering and Context Engineering quality.

The review target is the artifact itself. The skill does not infer whether the author was human or generated AI.

## Review Levels

### Level 1: Prompt Review

Review single prompt texts, such as ChatGPT prompts, Claude prompts, Gemini prompts, Codex instructions, and other LLM prompts.

Typical checks:

- role-inflation
- cot-overuse
- prompt-bloat
- cargo-cult-prompt
- missing-context

### Level 2: Context Review

Review the context around prompts, such as references, examples, templates, and documentation.

Typical checks:

- insufficient context
- missing examples
- missing references
- misplaced knowledge
- redundant explanation
- weak navigation

### Level 3: Agent Skill Review

Review Agent Skill packages, such as `SKILL.md`, `references/`, `templates/`, `examples/`, `index.json`, and topic guides.

Typical checks:

- bloated `SKILL.md`
- insufficient separation into references
- missing examples
- missing topic guide
- missing or stale index
- poor navigation
- weak knowledge structure

## Output Policy

Review output should include strengths, issues, improvement suggestions, and revised material when useful. Feedback should be actionable rather than merely critical.

## Scope

The project targets all three levels from the start:

- Prompt Review
- Context Review
- Agent Skill Review

Prompt Review is the easiest entry point, but it is not the only initial scope. The goal is a review system for the quality of "maps handed to AI": prompt wording, distilled data, knowledge structure, navigation, examples, templates, Agent Skill structure, and context design.

## Development

Regenerate the skill discovery index after changing bundled skill files:

```bash
npm run generate:index
```

Run repository checks:

```bash
npm test
npm run build
```

## Repository Operation Rules

- `workplace/` is local scratch space for reference checkouts and verification artifacts. Only `workplace/.gitkeep` is tracked.
- `bundle/`, `node_modules/`, coverage, logs, and local `.codex/skills/` deployment copies are ignored.
- GitHub repository creation, tags, releases, and asset upload are human operations. This repository only prepares local files and release workflows.
