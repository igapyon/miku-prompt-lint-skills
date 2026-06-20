# Review Levels

Use this file to choose the review level before applying detailed rubrics.

## Level 1: Prompt Review

Use Prompt Review when the target is a single instruction text or a small set of prompt variants.

Examples:

- ChatGPT prompt
- Claude prompt
- Gemini prompt
- Codex instruction
- other LLM task prompt

Primary concerns:

- role-inflation
- cot-overuse
- prompt-bloat
- cargo-cult-prompt
- missing-context
- unclear output contract

Read [prompt/checkpoints.md](prompt/checkpoints.md).

## Level 2: Context Review

Use Context Review when the target includes surrounding materials that guide model behavior.

Examples:

- references
- examples
- templates
- documentation
- distilled knowledge
- topic guides

Primary concerns:

- insufficient context
- missing examples
- missing references
- misplaced knowledge
- redundant explanation
- unclear source of truth
- poor navigation

Read [context/checkpoints.md](context/checkpoints.md).

## Level 3: Agent Skill Review

Use Agent Skill Review when the target is a skill package or skill-like agent workflow bundle.

Examples:

- `SKILL.md`
- `references/`
- `templates/`
- `examples/`
- `index.json`
- topic guide
- bundled helper files

Primary concerns:

- bloated `SKILL.md`
- insufficient separation into references
- missing examples
- missing topic guide
- missing or stale index
- poor navigation
- weak knowledge structure

Read [agent-skills/checkpoints.md](agent-skills/checkpoints.md).

## Mixed Reviews

Many real reviews are mixed. Start with the highest level present, then add lower-level reviews only when the provided artifact actually contains those materials.

1. Agent Skill Review when a skill package is provided.
2. Context Review when multiple supporting materials are provided.
3. Prompt Review when only prompt text is provided.

Use additional levels when needed:

- If an Agent Skill package review includes `references/`, `templates/`, `examples/`, documentation, or distilled knowledge quality, include Context Review for those materials.
- If `SKILL.md`, examples, templates, or documentation contain concrete prompt text that should be judged as prompt wording, include Prompt Review for those snippets.
- If the user asks for only a quick structural check, stay at the highest level and state what was intentionally not reviewed.

Report findings by level when that improves clarity.
