# Prompt Review Rubric

Use this rubric to review prompt text. Do not infer the prompt author's identity, tool, model, or workflow unless the prompt itself states a relevant requirement.

For surrounding references, examples, templates, or documentation, use [../context/checkpoints.md](../context/checkpoints.md). For Agent Skill packages, use [../agent-skills/checkpoints.md](../agent-skills/checkpoints.md).

## Severity

- `High`: likely to cause incorrect, unsafe, unverifiable, or unusable output
- `Medium`: likely to reduce quality, reuse, maintainability, or clarity
- `Low`: style or polish issue that is worth improving but not blocking

## Categories

### Outdated Prompt Design

Flag instructions that rely on older prompt folklore instead of clear task contracts.

Common signs:

- broad persona setup before the actual task
- "act as the best expert ever" without domain constraints
- long motivational framing
- repeated reminders to be accurate without specifying evidence, inputs, or checks

Preferred direction:

- name the task
- define inputs
- define constraints
- define output format
- define what to do when information is missing

### Redundant Boilerplate

Flag filler that adds length but no operational constraint.

Examples:

- "Please answer carefully and professionally" when no concrete standard follows
- repeated "make sure" lines that restate the same condition
- generic quality adjectives without measurable criteria

Preferred direction:

- replace generic quality words with concrete checks, examples, or acceptance criteria

### Excessive Role Assignment

Flag persona instructions that may overconstrain or distract from the task.

Preferred direction:

- keep role only when it changes domain assumptions, audience, or decision criteria
- replace theatrical persona with concise expertise context

### Chain-of-Thought Forcing

Flag requests for hidden reasoning disclosure.

Problematic signs:

- "show your full chain of thought"
- "think step by step and reveal every step"
- "write all internal reasoning"

Preferred direction:

- ask for a brief rationale, key assumptions, verification steps, or decision summary
- separate private reasoning from user-visible explanation

### Context Gaps

Flag missing facts that prevent reliable execution.

Check for:

- undefined audience
- missing source material
- missing domain assumptions
- missing constraints
- unclear success criteria
- unspecified language or locale when relevant

Preferred direction:

- request missing inputs or include a placeholder section
- define fallback behavior when inputs are absent

### Ambiguous Output Conditions

Flag prompts that do not specify the required shape of the answer.

Check for:

- no output format
- no length or detail level
- no ordering rule
- no citation, evidence, or uncertainty rule when needed
- no instruction for partial or impossible tasks

Preferred direction:

- specify sections, bullets, table columns, JSON schema, or other appropriate shape
- define how to handle uncertainty and missing information

### Reuse Problems

Flag prompts that are too tied to one conversation or contain hidden assumptions.

Preferred direction:

- parameterize variable inputs
- separate reusable instruction from one-time data
- avoid hard-coded examples unless they are true fixtures

### Instruction Conflicts

Flag contradictions or competing priorities.

Preferred direction:

- identify the conflict
- propose a priority order
- remove duplicate or incompatible conditions
