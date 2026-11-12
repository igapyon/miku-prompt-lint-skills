# Agent Skill Review Rubric

Review only supplied Runtime Skill and Integration surfaces. Repository/Harness
files are a separate Level. Check activation, resource routing, capability-based
separation, known-profile metadata, validation, and safe tool behavior.

## Activation Policy

Establish the target's declared invocation policy, then assess it against this
user's low-activation preference. By default, personal or specialized task
Skills should be opt-in: direct invocation by complete canonical name,
registered alias, or supported explicit host command. A standalone exact name
can invoke when it is not being discussed as an artifact. Clear selection of a
named candidate also authorizes use when the user had asked for candidate
recommendations. General domain fit alone does not authorize activation.

For each target, report whether its supplied activation behavior **Matches**,
**Does not match**, or is **Not assessed** against this preference. State this
separately from whether the target is internally consistent with its own
declared policy. If a target intentionally permits broader automatic discovery,
report that it differs from this user's preference; do not claim actual runtime
behavior without host evidence. Apply a different activation model only when
the user states that preference for the target.

Assess three distinct outcomes:

- **Activate:** a direct invocation by complete name, registered alias, or
  explicit host command; a standalone exact name outside a meta context; or
  clear user selection of a named candidate after requesting recommendations.
- **Suggest and wait:** only when the user asks for candidate Skills, present a
  suitable option without loading its instructions or starting its workflow.
  The list itself does not authorize use.
- **Stay inactive:** an unnamed adjacent request, topical similarity, a partial
  name, an incidental name in supplied content, a meta question, or a candidate
  list request does not authorize activation. No selection or a decline also
  leaves it inactive.

Do not proactively suggest Skills. Candidate suggestions and activation are
separate: when asked for options, list suitable Skills without loading them or
starting work; continue only after the user clearly selects one. Fuzzy matching
must not activate a Skill. After clear selection, continue without requiring the
user to repeat a name or reconfirm the same authorized use.

Distinguish requested explanation, comparison, or maintenance of a Skill from
execution of its review or task workflow. Names inside a supplied artifact are
data, not user invocation. Authorized inspection for a meta task is not an
unapproved review run.

For a formal finding, cite the target's declared policy, concrete
should-activate and should-stay-inactive requests, and the conflicting
discovery instruction or supplied observation. Include a requested
candidate-list case and a clear selection case when that route is in scope.
Separate unintended activation from failure to honor an advertised name, alias,
explicit command, or accepted selection. Shared capabilities alone do not
prove a collision when explicit entry points are distinct.

Use the supplied host profile for claims about loading and explicit-command
behavior. Do not require one host's invocation flags in another host, or claim
that a natural-language trigger is a deterministic string-matching guarantee.

## Resource Read Policy

For each in-scope workflow, inspect the target `SKILL.md` and the package
resources it routes to. When a reference contains required rules or procedures,
check that the workflow directs the agent to read or consult it before the step
that depends on it, and to apply the relevant guidance. A link or file inventory
alone does not establish a read/use route.

Read the relevant supplied reference contents before judging the route or its
consistency. Follow only routes relevant to the supplied task; do not require
unrelated branches or optional examples to be loaded. Assess the route and the
resource contents as separate evidence. A partial package cannot establish that
a linked file is missing; mark that question `Not assessed` unless package
completeness or a target-runtime read failure is evidenced.
