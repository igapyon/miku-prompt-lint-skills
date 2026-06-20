# Development Notes

## Initial Creation Record

- Date: 2026-06-20
- Repository: `miku-prompt-lint-skills`
- Installed skill name: `igapyon-miku-prompt-lint`
- Main workflow: `igapyon-miku-soft-developer` Agent Skills workflow
- Maturity pattern: content-only / handoff-only Agent Skill
- Product direction: Prompt Review, Context Review, and Agent Skill Review from the start

## Reference Check

No local `workplace/` sister checkout was present at initial creation. The
initial repository shape was based on the bundled
`igapyon-miku-soft-developer` Agent Skills starter assets and the shared
Agent Skills design reference.

Decisions adopted:

- keep canonical skill source under `skills/igapyon-miku-prompt-lint/`
- keep `SKILL.md` lean and move review criteria into `references/`
- include bundle and zip scripts from the miku-soft Agent Skills starter shape
- include a generated `index.json` and tests that fail when it is stale
- run repository tests serially because bundle tests share generated output under `bundle/`
- model the review surface as Prompt, Context, and Agent Skill levels

Decisions rejected:

- no `runtime/` directory, Java setup, or CLI smoke test because this skill is
  intentionally content-only
- no upstream product runtime anchor because this repository is the Agent Skill
  product, not a companion wrapper over a CLI application
