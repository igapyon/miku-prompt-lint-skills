# Prompt Skeleton Types

Choose exactly one skeleton type for optional skeleton assistance.

## `basic`

Use when the prompt needs a general reusable frame with clear task, inputs, constraints, and output requirements.

Best for:

- underspecified one-off prompts
- general assistant tasks
- prompts with unclear acceptance criteria

Template: `templates/prompt-skeletons/basic.md`

## `template-first`

Use when the output format is the highest-risk part of the prompt.

Best for:

- reports
- structured Markdown
- JSON-like or table-like output
- workflows where shape matters more than reasoning style

Template: `templates/prompt-skeletons/template-first.md`

## `reviewer`

Use when the prompt is primarily for critique, linting, review, audit, or improvement advice.

Best for:

- code reviews
- document reviews
- prompt reviews
- quality gates

Template: `templates/prompt-skeletons/reviewer.md`

## `few-shot`

Use when examples are essential to define the desired behavior.

Best for:

- classification
- style transfer
- extraction
- transformations with subtle judgment calls

Template: `templates/prompt-skeletons/few-shot.md`

## `agent-workflow`

Use when the prompt asks an agent to perform a multi-step workflow with tool use, verification, or progress updates.

Best for:

- coding agent tasks
- research workflows
- file-editing workflows
- tasks with explicit verification steps

Template: `templates/prompt-skeletons/agent-workflow.md`

## `ipo`

Use when the prompt is a clear Input-Process-Output transformation.

Best for:

- conversion
- extraction
- normalization
- summarization into a fixed structure

Template: `templates/prompt-skeletons/ipo.md`
