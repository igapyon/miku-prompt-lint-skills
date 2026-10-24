# miku-prompt-lint-skills

`miku-prompt-lint-skills` provides the `igapyon-miku-prompt-lint` Agent Skill for reviewing prompts, surrounding context, Agent Skill packages, and supplied Agent Skill repositories or harnesses.

Use it when you want an AI agent to find prompt and context quality risks before those instructions are reused by people or other agents.

Typical users include:

- people maintaining Codex, ChatGPT, Claude, Gemini, or other LLM prompts
- people organizing references, examples, templates, or distilled knowledge for AI use
- people creating or reviewing Agent Skills
- people maintaining the README, tests, build, release, or generated metadata of an Agent Skill repository

This is not a prompt generator, deterministic lint engine, or correctness judge. It reviews the supplied artifact and reports evidence-backed risks, missing contracts, and practical improvement opportunities. Static review does not establish actual model performance.

## Get The Skill

Use the release zip when one is available. The local build requires Node.js 24
and the `zip` / `unzip` commands. For a local build from this repository, run:

```bash
npm run build
```

The build creates:

- `bundle/miku-prompt-lint-skills/`
- `bundle/igapyon-miku-prompt-lint-skills-<version>.zip`

Install the result by either method:

1. Extract the release zip (or copy the contents of
   `bundle/miku-prompt-lint-skills/`) under the agent home root, such as
   `$CODEX_HOME/`. This creates
   `$CODEX_HOME/skills/igapyon-miku-prompt-lint/SKILL.md`.
2. Copy only
   `bundle/miku-prompt-lint-skills/skills/igapyon-miku-prompt-lint/` under
   `$CODEX_HOME/skills/`.

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

Activation is name-based. Use the exact name `igapyon-miku-prompt-lint` or the
alias `miku-prompt-lint` to request a review. A `$` mention counts only when
its complete identifier exactly matches one of these names. Longer or partial
identifiers do not match. A prompt, context, or Agent Skill review request
without either exact name does not activate this skill.

Asking about this skill's specification, design, or maintenance requests that
meta task, not a review run, even when its exact name appears.

## What It Reviews

### Prompt Review

Use this for single prompt texts, such as ChatGPT prompts, Claude prompts, Gemini prompts, Codex instructions, and other LLM prompts.

Typical checks:

- `prompt/role-inflation`
- private-reasoning disclosure requests
- instruction conflicts, missing success criteria, fallback behavior, or evidence contracts
- untrusted-content boundaries and undeclared authority

### Context Review

Use this for the surrounding materials that guide model behavior, such as references, examples, templates, documentation, distilled knowledge, and topic guides.

Typical checks:

- reusable knowledge placed in executable prompts
- missing or weak examples and templates
- stale or conflicting sources of truth
- weak task-to-resource navigation

### Agent Skill Review

Use this for Agent Skill packages and skill-like workflow bundles.

Typical checks:

- bloated `SKILL.md`
- activation boundaries and required-reference read/use routing
- missing tool, authority, validation, or side-effect contracts
- broken runtime resource routes

Activation review respects the target's intended invocation policy. Explicit-first
use is a sound baseline for personal or specialized task Skills; a documented
opt-in Skill is not defective because an unnamed in-domain request leaves it
inactive. Intentionally automatic Skills are assessed against their declared
policy. Shared capabilities alone do not prove a trigger collision when exact
entry points are distinct.

For an optional candidate-introduction route, check that the agent can introduce
the Skill from discovery metadata and wait for agreement before loading its
instructions or starting its workflow. Review unintended activation and missed
advertised names/aliases separately; do not require every Skill to offer fuzzy
matching or candidate suggestions.

### Repository/Harness Review

Use this only when the Agent Skill source repository or its operational files
are supplied, or when this surface is explicitly requested. Typical checks
include user-facing installation guidance, required generated-index contracts,
test isolation, artifact identity, reproducibility, and evaluation leakage.
An inventory index is discovery metadata; it does not replace curated routing.

## Review Output

The default report is concise and keeps the Rule, impact, confidence, evidence,
and a concrete suggestion. Ask for a detailed report to receive the full field
set, including Applicability, Category, and Change type. Findings come first;
material assessment notes and strengths follow when useful.

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
- `skills/igapyon-miku-prompt-lint/references/repository/`

Optional prompt skeleton assistance is separated from review references:

- `skills/igapyon-miku-prompt-lint/references/template-selection/`
- `skills/igapyon-miku-prompt-lint/templates/prompt-skeletons/`

This assistance is lint-oriented. It helps select a single Markdown prompt skeleton only after `igapyon-miku-prompt-lint` has already been activated in a lint, audit, or review context. It is not a general prompt-writing workflow or a generic code/document review tool.

## Development

A repository may declare a generated index only when a concrete consumer uses
it. Absence alone is not a defect. If an index is explicitly adopted, document
its consumer and refresh the generated file with `miku-indexgen`; do not edit it
by hand. This package does not maintain a root index.

Run repository checks:

```bash
npm test
npm run build
```

The build creates an installable bundle directory, a deterministic release zip,
and a matching `.sha256` file under `bundle/`.

## Repository Operation Rules

- `workplace/` is local scratch space for reference checkouts and verification artifacts. Only `workplace/.gitkeep` is tracked.
- `bundle/`, `node_modules/`, coverage, logs, and local `.codex/skills/` deployment copies are ignored.
- Pull requests and pushes run the repository checks. A `v*` tag creates a
  draft release with the verified zip and checksum; publication remains a human
  operation.
