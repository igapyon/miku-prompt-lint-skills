# Skeleton Assistance Handoff

Optional skeleton assistance ends after producing a single Markdown prompt skeleton.

## What This Workflow May Do

- Select one skeleton type.
- Fill known fields from the reviewed artifact and explicit user request.
- Mark unknown fields as `TODO:`.
- Provide a concise note explaining why the skeleton type was selected.

## What This Workflow Must Not Do

- Continue as a general prompt-writing service.
- Create an Agent Skill package.
- Invent missing domain requirements.
- Expand into a multi-file context bundle.
- Claim the skeleton is production-ready without review or testing.

## If The User Wants More

For further prompt drafting or domain-specific refinement, hand off to the base model, a separate Agent Skill, or normal conversation. Keep the boundary explicit: this skill provided a lint-oriented skeleton, not a complete prompt engineering engagement.
