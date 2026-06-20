# Agent Skill Review Rubric

Use this rubric for Agent Skill packages and skill-like workflow bundles.

Review the skill as an agent-facing context system. Do not infer who created it.

## Categories

### Activation Boundary

Check whether the skill activates at the right time.

Problems:

- description is too broad
- trigger behavior is only documented in the body, not frontmatter
- generic domain mentions cause unwanted activation
- explicit activation cases are missing

Preferred direction:

- put trigger criteria in frontmatter description
- make broad skills explicit about boundaries
- avoid capturing generic requests unintentionally

### SKILL.md Bloat

Check whether `SKILL.md` is carrying too much detail.

Problems:

- long tutorials in `SKILL.md`
- detailed examples embedded in core instructions
- many variants described inline
- repeated rules that belong in references

Preferred direction:

- keep `SKILL.md` as routing and essential workflow
- move detailed rubrics, examples, schemas, and variants to `references/`

### Weak Reference Separation

Check whether bundled knowledge is split into useful files.

Problems:

- all knowledge in one large file
- no task-specific references
- overlapping references with unclear ownership
- stable policy duplicated across files

Preferred direction:

- one reference per major review mode, workflow, schema, or domain
- avoid duplicate source-of-truth text
- include direct links from `SKILL.md`

### Missing Examples

Check whether examples demonstrate expected behavior.

Problems:

- no examples
- examples only cover happy paths
- no expected output
- examples are too large to scan

Preferred direction:

- add compact examples for common and edge cases
- include expected review or output

### Missing Templates

Check whether repeated output structures are reusable.

Problems:

- no report template
- prompt rewrites are improvised every time
- placeholders are unclear

Preferred direction:

- add minimal templates for common outputs
- keep placeholders explicit and reusable

### Missing Or Stale Index

Check whether the skill has generated discovery metadata when the repository expects it.

Problems:

- no `index.json`
- stale file list
- generated index hand-edited without a regeneration path

Preferred direction:

- regenerate the index after bundled file changes
- test that required files appear in the index

### Poor Navigation

Check whether another agent can quickly decide what to read.

Problems:

- no topic guide or routing section
- vague reference names
- references linked only indirectly
- no rule for mixed tasks

Preferred direction:

- add level or topic selection guidance
- link relevant files directly from `SKILL.md`
- keep names aligned with task intent

### README First-Read Usability

Check whether `README.md` works for someone seeing the repository for the first time.

Problems:

- README starts with repository internals before explaining user value
- no quick usage example or activation phrase
- installed skill name, repository name, and product or workflow name are not distinguished
- review targets are described only in maintainer terms
- expected review output is unclear
- development and repository operation notes appear before basic user guidance

Preferred direction:

- open with what the skill does, who should use it, and when to use it
- include a minimal invocation example such as `$<skill-name>`
- explain the supported review targets in user-facing language
- state what the review returns
- move repository shape, build, release, and operation notes after the user-facing sections

### Verification Reproducibility

Check whether tests, builds, and generated artifacts can run reliably.

Problems:

- tests mutate the same generated output directory in parallel
- build, bundle, or release checks depend on execution order that is not documented
- generated files are changed by tests without a clear regeneration command
- local scratch, bundle, or distribution files are mixed with canonical skill source
- CI or local scripts do not make shared-output assumptions visible

Preferred direction:

- run shared-output tests serially or isolate each test's output directory
- document generated artifact ownership and regeneration commands
- keep canonical source, generated bundles, and local scratch spaces separate
- make build and release verification deterministic

### Knowledge Structure Risk

Check whether knowledge is placed at the right abstraction level.

Problems:

- product behavior hidden in skill prose when it belongs in runtime or source artifacts
- ephemeral project notes mixed with stable instructions
- generated artifacts treated as hand-maintained source

Preferred direction:

- separate stable instructions, generated files, examples, templates, and development notes
- keep generated artifacts reproducible
