# Revised Agent Skill Structure

```text
skills/<skill-name>/
├── SKILL.md
├── index.json
├── references/
│   ├── topic-guide.md or <topic>/INDEX.md
│   └── <workflow-or-domain>.md
├── templates/
│   └── <output-template>.md
└── examples/
    └── <example>.md
```

SKILL.md should contain:
- activation boundary
- required first checks
- core workflow
- links to relevant references

References should contain:
- detailed rules
- domain knowledge
- workflow variants
- navigation through either a shared `topic-guide.md` or per-topic `INDEX.md` files

Templates should contain:
- repeated output structures

Examples should contain:
- representative inputs
- expected outputs or review reports
