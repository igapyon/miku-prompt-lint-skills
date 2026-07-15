# Review Levels

Choose only supplied levels. An absent level is `Not assessed`, not defective.

| Level | Rule prefix | Owns |
| --- | --- | --- |
| Prompt | `prompt/` | wording, inputs, outputs, constraints, priority |
| Context | `context/` | reusable knowledge, examples, templates, provenance |
| Agent Skill | `agent-skill/` | activation, resource routing, tools, runtime behavior |
| Repository/Harness | `repository/` | README, build, tests, release, generated metadata |

For mixed targets, use the most specific owner once. Read the matching
`checkpoints.md` and `anti-patterns.md`; read Repository/Harness only when its
files are supplied. `index.json` inventory is not task-to-resource routing.
