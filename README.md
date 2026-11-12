# miku-prompt-lint-skills

`igapyon-miku-prompt-lint` is an Agent Skill for reviewing LLM prompts before
reuse. It helps find conflicting instructions, unclear inputs and outputs,
missing fallback behavior, and weak trust boundaries, with evidence and concrete
suggestions for improvement.

Prompt lint is the core workflow. The review also covers the surrounding
context, Agent Skill packages, and supplied Skill repositories or harnesses
that support those instructions. Use it for prompts written for Codex,
ChatGPT, Claude, Gemini, or other LLMs.

The skill performs an AI-assisted review of the supplied material. Its findings
identify risks and improvement opportunities; static review does not establish
actual model performance or guarantee correctness.

## Install

1. Open the [latest GitHub Release](https://github.com/igapyon/miku-prompt-lint-skills/releases/latest)
   and download `igapyon-miku-prompt-lint-skills-<version>.zip` from its assets.
   A matching `.zip.sha256` checksum file is also available.
2. Extract the archive under the agent home root, such as `$CODEX_HOME/`.
   The archive already contains the `skills/` directory.
3. Confirm that the installed entry point is
   `$CODEX_HOME/skills/igapyon-miku-prompt-lint/SKILL.md`.

The installed layout is:

```text
$CODEX_HOME/
└── skills/
    └── igapyon-miku-prompt-lint/
        ├── SKILL.md
        ├── agents/
        ├── references/
        ├── templates/
        └── examples/
```

If your agent uses a different skills root, copy the extracted
`igapyon-miku-prompt-lint/` directory there. Include the entire directory so the
review references, templates, and examples remain available. To build from a
source checkout, see [Development](#development).

## Quick Use

After installing the skill, ask Codex to use it explicitly:

```text
Use $igapyon-miku-prompt-lint to review the following prompt:

"Summarize the attached report. Keep it short."
```

For a file-based review, provide the target files or paths:

```text
Use $igapyon-miku-prompt-lint to review prompts/monthly-summary.md.
The prompt should produce a summary of decisions and next actions for a project manager.
```

```text
Use $igapyon-miku-prompt-lint to audit this SKILL.md and its references.
```

Include the intended task, audience, and output when known. Model, agent host,
or tool details help assess rules that depend on runtime behavior. If the target
material is missing, the skill asks for it before reviewing.

### Activation

Request a review with the complete name `igapyon-miku-prompt-lint` or its alias
`miku-prompt-lint`. A standalone exact name prompts for the review target. `$`
mentions must match a complete name; the repository name
`miku-prompt-lint-skills` is not an activation alias.

A mere mention in a question, comparison, maintenance request, or supplied
material does not start a review. The skill is not suggested proactively. If you
request a list of candidate skills, selecting this skill authorizes use; an
agreed review can continue without repeating its name. See the
[full activation rules](skills/igapyon-miku-prompt-lint/SKILL.md#activation).

## What You Receive

The default report is concise. Each finding includes the review level,
severity, confidence, Rule ID, issue, evidence, and a concrete suggestion.
Findings come first, followed by material assessment notes and strengths when
useful. Ask for a detailed report to also receive Applicability, Category, and
Change type.

See the [concise report template](skills/igapyon-miku-prompt-lint/templates/review-report-compact.md)
for the default layout, or the
[missing source document example](skills/igapyon-miku-prompt-lint/examples/ambiguous-output.md)
for a worked finding in the detailed format.

During an activated review, you can also request help selecting a single
Markdown prompt skeleton. The
[skeleton selection workflow](skills/igapyon-miku-prompt-lint/references/template-selection/INDEX.md)
keeps unknown values as `TODO:` placeholders.

## What It Reviews

The links below lead to the criteria for each review target.

| Target | Typical checks |
| --- | --- |
| **[Prompt](skills/igapyon-miku-prompt-lint/references/prompt/INDEX.md)** | Conflicting instructions, missing success criteria or output requirements, fallback behavior, role inflation, requests for private reasoning, and trust boundaries |
| [Context](skills/igapyon-miku-prompt-lint/references/context/INDEX.md) | Reusable knowledge, examples and templates, source-of-truth conflicts, and task-to-resource navigation |
| [Agent Skill](skills/igapyon-miku-prompt-lint/references/agent-skills/INDEX.md) | Activation boundaries, required-reference loading, tool and side-effect contracts, bloated `SKILL.md`, and broken resource routes |
| [Repository/Harness](skills/igapyon-miku-prompt-lint/references/repository/INDEX.md) | Installation guidance, tests, build and release artifacts, reproducibility, generated-index contracts, and evaluation leakage |

Scope follows the supplied material. Include the source repository or its
operational files for a Repository/Harness review. Missing prerequisites are
marked `Not assessed`; an absent review level is not itself a defect.

Agent Skill reviews also assess the user's opt-in activation preference:
personal or specialized skills should require an exact name, registered alias,
or supported explicit command. This assessment is separate from compliance with
the target Skill's own declared policy. Broader automatic activation is reported
as a preference mismatch.

## Repository Shape

The repository name is `miku-prompt-lint-skills`; the installed skill name is
`igapyon-miku-prompt-lint`. The canonical source is
[skills/igapyon-miku-prompt-lint/](skills/igapyon-miku-prompt-lint/).

The skill is content-only, with no CLI runtime:

- [SKILL.md](skills/igapyon-miku-prompt-lint/SKILL.md) defines activation and the review workflow.
- [references/](skills/igapyon-miku-prompt-lint/references/) contains target-specific criteria and resource routes.
- [templates/](skills/igapyon-miku-prompt-lint/templates/) contains report layouts, revised-material formats, and prompt skeletons.
- [examples/](skills/igapyon-miku-prompt-lint/examples/) shows findings with evidence and suggestions.

## Development

Local checks and packaging require Node.js 24 and the `zip` / `unzip` commands.
From a source checkout, run:

```bash
npm run build
```

This runs the source checks, creates the following artifacts, and verifies the
exact bundle and archive produced:

- `bundle/miku-prompt-lint-skills/` — installable bundle directory
- `bundle/igapyon-miku-prompt-lint-skills-<version>.zip` — deterministic release archive
- `bundle/igapyon-miku-prompt-lint-skills-<version>.zip.sha256` — matching SHA-256 checksum

For a local installation, copy the contents of the bundle directory under the
agent home root, or copy its `skills/igapyon-miku-prompt-lint/` directory under
the agent's skills root.

| Command | Purpose |
| --- | --- |
| `npm test` | Check source structure, Markdown, rules, and fixture contracts |
| `npm run build` | Run source checks, build the bundle and archive, and verify their contents |
| `npm run verify:reproducible` | Build twice and compare archive SHA-256 values |

These checks validate package and content contracts. Rule semantics and model
behavior need separate evaluation; see the
[development notes](docs/development.md) and
[semantic evaluation guide](docs/semantic-evaluation.md).

This package uses task-based reference routes and does not maintain a root
index. Adopt a generated index only for a documented consumer; if adopted,
refresh it with `miku-indexgen` instead of editing it by hand.

## Repository Operation Rules

- `workplace/` is local scratch space for reference checkouts and verification artifacts. Only `workplace/.gitkeep` is tracked.
- `bundle/`, `node_modules/`, coverage, logs, and local `.codex/skills/` deployment copies are ignored.
- Pull requests and pushes run the repository checks. A `v*` tag creates a
  draft release with the verified zip and checksum; publication remains a human
  operation.
