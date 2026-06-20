# Context Review Rubric

Use this rubric for references, examples, templates, documentation, distilled knowledge, and other materials surrounding a prompt or Agent Skill.

Do not infer whether the materials were created by a human or generated AI. Review the quality of the context structure itself.

## Categories

### Missing Context

Flag absent information that the agent would need to complete the task reliably.

Check for:

- undefined domain assumptions
- missing input and output definitions
- missing constraints
- missing examples for difficult cases
- missing error or fallback behavior

Preferred direction:

- add compact references for stable knowledge
- add examples for behavior that is easier to demonstrate than define
- add templates for repeatable outputs

### Misplaced Knowledge

Flag knowledge that lives in the wrong layer.

Common problems:

- long domain explanations embedded in a prompt
- stable reference material placed only in conversation text
- examples mixed into core instructions without labels
- operational steps hidden inside prose where a template would be clearer

Preferred direction:

- keep core instructions short
- move detailed knowledge to references
- move repeated output shapes to templates
- move demonstrations to examples

### Context Bloat

Flag context that consumes attention without improving execution.

Common problems:

- repeated policy statements
- long background sections with no operational effect
- multiple near-duplicate examples
- broad tutorials where task-specific references would work

Preferred direction:

- remove duplicate explanation
- keep only task-relevant background
- summarize stable facts and link to detailed references

### Weak Examples

Flag examples that do not clarify expected behavior.

Check for:

- no examples for edge cases
- examples that are too trivial
- examples that contradict the instructions
- examples with no expected output

Preferred direction:

- add one normal case and one edge case
- include expected output or review result
- keep examples short enough to scan

### Weak Templates

Flag missing or underdefined output structures.

Check for:

- no reusable report shape
- output headings inconsistent with instructions
- placeholders that do not name required input
- templates that include decorative filler

Preferred direction:

- define minimal reusable templates
- use explicit placeholders
- separate template shape from example content

### Poor Navigation

Flag context that is hard for an agent to discover or load selectively.

Check for:

- missing index or topic guide
- unclear file names
- no routing instructions
- deeply nested references without reason

Preferred direction:

- add a small topic guide
- keep reference file names specific
- tell the agent which file to read for which task
