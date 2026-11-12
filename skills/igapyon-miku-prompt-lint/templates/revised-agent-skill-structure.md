# Revised Agent Skill Structure

```text
skills/<skill-name>/
├── SKILL.md
├── index.json                 # only when this package already maintains one
├── references/
│   ├── topic-guide.md or <topic>/INDEX.md
│   └── <workflow-or-domain>.md
├── templates/
│   └── <output-template>.md
└── examples/
    └── <example>.md
```

SKILL.md should contain:
- explicit activation boundary and intended invocation mode, including supported exact names/aliases
- candidate suggestions are allowed only when requested; listing a candidate must not load the Skill or start its workflow, and clear user selection is required
- required first checks
- core workflow
- task-to-resource routes that say when required references must be read or consulted before dependent steps
- tool, authority, and side-effect boundaries
- observable success criteria, evidence, and fallback behavior

References should contain:
- detailed rules
- domain knowledge
- workflow variants
- a direct route from each relevant workflow; read only the material needed for the selected task
- navigation through either a shared `topic-guide.md` or per-topic `INDEX.md` files

Templates should contain:
- repeated output structures

Examples should contain:
- representative inputs
- expected outputs or review reports
- normal and edge/failure cases where behavior differs
