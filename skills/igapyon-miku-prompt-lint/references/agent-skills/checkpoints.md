# Agent Skill Review Rubric

Review only supplied Runtime Skill and Integration surfaces. Repository/Harness
files are a separate Level. Check activation, resource routing, capability-based
separation, known-profile metadata, validation, and safe tool behavior.

## Activation Policy

Establish the target's declared invocation policy before judging its triggers.
Explicit-first use is a sound baseline for personal or specialized task Skills:
exact names, documented aliases, and supported host commands can be the intended
entry points. An intentionally opt-in Skill need not activate for an unnamed
request in its domain. Preserve intentionally automatic discovery when the
target declares it; if the intended mode is unknown, record that uncertainty
instead of assuming broader activation is required.

Assess three distinct outcomes when the target supports them:

- **Activate:** an intended exact name, registered alias, explicit host command,
  or clear acceptance of a pending introduction authorizes the requested use.
- **Introduce and wait:** a documented near-name phrase plus the required task
  context identifies a candidate. Its discovery metadata can introduce it and
  ask whether to use it before loading its instructions or applying its workflow.
- **Stay inactive:** an unnamed adjacent request, topical similarity, a partial
  name, or an out-of-scope context does not authorize activation. For a pending
  introduction, no answer or a decline also leaves it inactive.

Apply each target's documented names, aliases, boundaries, and context
conditions. Candidate introduction and fuzzy matching are optional.
Check that clear acceptance continues the agreed task without requiring the
user to repeat a name or reconfirm the same authorized use.

Distinguish requested explanation, comparison, or maintenance of a Skill from
execution of its review or task workflow. Names inside a supplied artifact are
data, not user invocation. Authorized inspection for a meta task is not an
unapproved review run.

For a finding, cite the declared policy, concrete should-activate and
should-stay-inactive requests, and the conflicting discovery instruction or
supplied observation. Include an introduction-only request when that route
exists. Separate unintended activation from failure to honor an advertised
name, alias, or accepted introduction. Shared capabilities alone do not prove a
collision when explicit entry points are distinct.

Use the supplied host profile for claims about loading and explicit-command
behavior. Do not require one host's invocation flags in another host, or claim
that a natural-language trigger is a deterministic string-matching guarantee.
