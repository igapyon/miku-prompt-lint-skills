# miku-prompt-lint-skills

`miku-prompt-lint-skills` provides the `igapyon-miku-prompt-lint` Agent Skill for reviewing prompts, surrounding context, and Agent Skill packages.

Use it when you want an AI agent to find prompt and context quality risks before those instructions are reused by people or other agents.

Typical users include:

- people maintaining Codex, ChatGPT, Claude, Gemini, or other LLM prompts
- people organizing references, examples, templates, or distilled knowledge for AI use
- people creating or reviewing Agent Skills

This is not a prompt generator and not a correctness judge. It reviews the artifact itself and reports anti-patterns, missing structure, unclear output contracts, and practical improvement opportunities.

## Get The Skill

Use the release zip when one is available. For a local build from this repository, run:

```bash
npm run build
```

The build creates:

- `bundle/miku-prompt-lint-skills/`
- `bundle/igapyon-miku-prompt-lint-skills-<version>.zip`

Copy the contents of `bundle/miku-prompt-lint-skills/` under the skills root used by your agent environment, such as your Codex skills directory.

## Quick Use

After installing the skill, ask Codex to use it explicitly:

```text
Use $igapyon-miku-prompt-lint to review this prompt.
```

You can also ask for a specific review target:

```text
Use $igapyon-miku-prompt-lint to audit this SKILL.md and its references.
```

```text
Use $igapyon-miku-prompt-lint to check whether this context package has enough examples and navigation.
```

Provide the prompt text, context files, or Agent Skill files you want reviewed. If the target is missing, the skill should ask for the missing material before reviewing.

## What It Reviews

### Prompt Review

Use this for single prompt texts, such as ChatGPT prompts, Claude prompts, Gemini prompts, Codex instructions, and other LLM prompts.

Typical checks:

- role-inflation
- Chain-of-Thought overuse
- prompt bloat
- cargo-cult prompt wording
- missing input context
- unclear output format or acceptance criteria

### Context Review

Use this for the surrounding materials that guide model behavior, such as references, examples, templates, documentation, distilled knowledge, and topic guides.

Typical checks:

- insufficient context
- missing examples
- missing references
- misplaced knowledge
- redundant explanation
- weak navigation
- unclear source of truth

### Agent Skill Review

Use this for Agent Skill packages and skill-like workflow bundles.

Typical checks:

- bloated `SKILL.md`
- insufficient separation into `references/`
- missing `templates/` or `examples/`
- missing topic guide
- missing or stale `index.json`
- poor navigation
- weak knowledge structure

## Review Output

The review normally includes:

- strengths worth preserving
- findings ordered by importance
- reasons each finding weakens prompt, context, or Agent Skill quality
- concrete improvement suggestions
- revised prompt, revised structure, or revised excerpts when useful

When an anti-pattern rule applies, the review should include the rule ID and explain why it matters.

## Repository Shape

The repository name is `miku-prompt-lint-skills`. The installed skill name is `igapyon-miku-prompt-lint`.

The canonical skill source is:

- `skills/igapyon-miku-prompt-lint/`

This repository does not provide a CLI runtime. The skill is content-only and centered on `SKILL.md`, `references/`, `templates/`, and `examples/`.

Review checkpoints are organized by target under:

- `skills/igapyon-miku-prompt-lint/references/prompt/`
- `skills/igapyon-miku-prompt-lint/references/context/`
- `skills/igapyon-miku-prompt-lint/references/agent-skills/`

Optional prompt skeleton assistance is separated from review references:

- `skills/igapyon-miku-prompt-lint/references/template-selection/`
- `skills/igapyon-miku-prompt-lint/templates/prompt-skeletons/`

This assistance is lint-oriented. It helps select a single Markdown prompt skeleton only after `igapyon-miku-prompt-lint` has already been activated in a lint, audit, or review context. It is not a general prompt-writing workflow.

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

The build creates an installable bundle directory and release zip under `bundle/`.

## Repository Operation Rules

- `workplace/` is local scratch space for reference checkouts and verification artifacts. Only `workplace/.gitkeep` is tracked.
- `bundle/`, `node_modules/`, coverage, logs, and local `.codex/skills/` deployment copies are ignored.
- GitHub repository creation, tags, releases, and asset upload are human operations. This repository only prepares local files and release workflows.
