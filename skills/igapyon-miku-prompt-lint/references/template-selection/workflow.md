# Optional Skeleton Assistance Workflow

This workflow is a narrow follow-up aid for lint-oriented sessions. It helps turn review findings into a single Markdown prompt skeleton.

## Activation Boundary

Use this workflow only when all conditions are true:

- `igapyon-miku-prompt-lint` is already active for lint, audit, diagnosis, or review.
- The user asks for a prompt skeleton, prompt frame, template selection, or a Markdown prompt starting point.
- The requested output can remain a single Markdown prompt.

Do not use this workflow for ordinary prompt writing, content generation, Agent Skill creation, or broad workflow design.

## Selection Steps

1. Identify the reviewed artifact's primary failure mode or missing structure.
2. Map that need to one skeleton type from `skeleton-types.md`.
3. Read only the matching skeleton template.
4. Fill known details from the review target and explicit user instructions.
5. Preserve uncertainty as `TODO:` instead of guessing.
6. Keep the output as one Markdown prompt.

## Filling Rules

- Keep the user's intent and domain.
- Do not add requests to expose private reasoning.
- Prefer explicit inputs, constraints, output format, and acceptance criteria.
- Avoid converting the result into an Agent Skill package unless the user starts a separate Agent Skill creation task.
- If the user's request exceeds skeleton selection, read `handoff.md` and hand off the work boundary clearly.
