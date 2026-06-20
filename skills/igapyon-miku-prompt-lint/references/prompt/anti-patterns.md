# Prompt Anti-Patterns

Use these initial rule candidates when reviewing single prompts or prompt-like instructions.

The goal is not to judge a prompt as simply right or wrong. Detect old habits, bloat, ambiguity, and weak context design, then propose concrete improvements.

## Rule Entry Shape

Each anti-pattern entry should support three review needs:

- detection: what kind of text triggers the rule
- explanation: why the pattern weakens prompt quality
- fix: what to do instead

When reporting a hit, include the anti-pattern ID and summarize the "Why this is a problem" section in the review. Do not report only the rule name.

Core message:

```text
能力を祈るより、情報と手順を渡す。
役割を盛るより、評価観点を書く。
長いプロンプトより、整理されたコンテキスト。
AIを探偵にするより、案内図を渡す。
```

## role-inflation

Overstates role, expertise, prestige, or authority.

Examples:

```text
あなたは世界最高の専門家です。
あなたは30年経験のベテランコンサルタントです。
あなたはノーベル賞級の研究者です。
You are a world-class expert.
You are the best software architect.
```

Why this is a problem:

- does not materially increase model capability
- may encourage overconfident or authoritative-sounding output

Recommended fix:

- define task, evaluation criteria, inputs, and constraints instead of inflating the role

## vague-role-only

Gives only a role and a vague task.

Examples:

```text
あなたは優秀なレビュアーです。
以下をレビューしてください。
```

Why this is a problem:

- review criteria are unclear

Recommended fix:

```text
以下の観点でレビューしてください。
- 事実誤認
- 保守性
- セキュリティ
- コスト
- 読みやすさ
```

## cot-overuse

Forces Chain-of-Thought or hidden reasoning disclosure.

Examples:

```text
Step by Step で考えてください。
思考過程をすべて出力してください。
あなたの推論過程を詳しく書いてください。
Show your chain of thought.
Think step by step and reveal all reasoning.
```

Why this is a problem:

- modern reasoning models already perform internal reasoning
- detailed hidden reasoning disclosure is usually unnecessary and undesirable

Recommended fix:

```text
結論、理由、確認観点を簡潔に示してください。
必要な場合のみ、判断根拠を要約してください。
```

## cargo-cult-prompt

Uses ritual phrases with unclear effect.

Examples:

```text
深呼吸して考えてください。
落ち着いて考えてください。
最高の回答をしてください。
絶対に間違えないでください。
失敗したら罰せられます。
Take a deep breath.
Do your best.
You will be punished if you fail.
```

Why this is a problem:

- carries old prompt-culture residue
- adds noise without a concrete operational constraint

Recommended fix:

- remove the phrase
- replace it with concrete quality criteria when needed

## prompt-bloat

The prompt is too long for the task.

Signals:

- same cautions repeated many times
- long lists of prohibitions
- oversized role explanation
- all knowledge packed into one prompt
- repeated near-synonymous wording

Why this is a problem:

- important instructions are buried
- context is wasted
- maintenance becomes difficult

Recommended fix:

- keep only important instructions
- move knowledge to `references/`
- move examples to `examples/`
- move output shape to `templates/`

## repeated-instructions

Repeats the same instruction in different words.

Example:

```text
必ず簡潔に答えてください。
冗長な説明は避けてください。
長く書かないでください。
簡潔さを最優先してください。
```

Why this is a problem:

- the intent is duplicated and becomes noise

Recommended fix:

- consolidate into one clear instruction

## excessive-negative-rules

Overuses prohibitions.

Signals:

```text
〜してはいけません。
〜は禁止です。
絶対に〜しないでください。
〜も避けてください。
```

Why this is a problem:

- the prompt focuses more on what not to do than what good output should do
- behavior can become stiff or evasive

Recommended fix:

- state desired output, decision criteria, and replacement behavior

## missing-context

The prompt lacks information needed to complete the task reliably.

Examples:

```text
良い記事を書いてください。
最高のレビューをしてください。
分かりやすくまとめてください。
```

Why this is a problem:

- audience, purpose, input, constraints, and use case are unclear

Recommended fix:

```text
対象読者:
目的:
入力:
出力形式:
重視する観点:
避けること:
```

## knowledge-in-prompt

Packs long-lived knowledge, specifications, background, logs, or glossary material into the prompt body.

Why this is a problem:

- prompt becomes large
- updates are difficult
- reuse becomes weak

Recommended fix:

- for Agent Skills, separate material into `references/`, `examples/`, and `templates/`

## missing-output-format

Leaves the expected output shape vague.

Examples:

```text
レビューしてください。
改善してください。
まとめてください。
```

Why this is a problem:

- output varies on every run
- downstream processing is harder

Recommended fix:

- specify Markdown headings, bullets, tables, JSON, or another concrete format

## over-specific-persona

Adds excessive personality, backstory, emotion, or character setting.

Why this is a problem:

- useful for character tasks, but often noisy for business or engineering prompts

Recommended fix:

- minimize persona outside character use cases
- prioritize task steps and evaluation criteria

## style-mixed-with-task

Mixes many style requirements with task instructions without priority.

Example:

```text
優しく、厳密に、専門的に、初心者向けに、短く、詳しく、面白く、感動的に説明してください。
```

Why this is a problem:

- conditions conflict or become impossible to satisfy together

Recommended fix:

```text
最優先: 正確性
次点: 初心者向けの分かりやすさ
文体: 丁寧、ただし冗長にしない
```

## outdated-prompt-style

Keeps 2023-2024 style prompt trends as fixed boilerplate.

Examples:

```text
あなたは世界最高の〇〇です。
深呼吸してください。
Step by Stepで考えてください。
絶対にミスしないでください。
```

Why this is a problem:

- weak or noisy for modern high-capability and reasoning models

Recommended fix:

- emphasize context, evaluation criteria, input information, and output conditions
