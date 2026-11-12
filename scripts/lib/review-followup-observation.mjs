export function parseObservation(item, text, sourceAudit) {
  const notes = [];
  if (item.mode === "activation-metadata") {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      const observed = match ? JSON.parse(match[0]) : {};
      if (Object.keys(observed).some((key) => key !== "activation")) notes.push("Activation response included unexpected keys.");
      return { observed, notes };
    } catch {
      return { observed: {}, notes: ["Activation response was not valid JSON."] };
    }
  }
  const ruleIds = new Set([...text.matchAll(/(?:`Rule`\s*:\s*|`)((?:prompt|context|agent-skill|repository)\/[a-z0-9-]+)(?:`|\s)/g)].map((match) => match[1]));
  const observedRules = [];
  for (const rule of ruleIds) {
    const pos = text.indexOf(rule);
    const previousFinding = text.lastIndexOf("\n- ", pos);
    const nextFinding = text.indexOf("\n- ", pos + rule.length);
    const block = text.slice(previousFinding >= 0 ? previousFinding : 0, nextFinding >= 0 ? nextFinding : undefined);
    const severity = block.match(/\[\s*(High|Medium|Low)\s*\|/i)?.[1]
      ?? block.match(/(?:Prompt|Context|Agent Skill|Repository\/Harness)\s*\|\s*\[?(High|Medium|Low)\s*\|/i)?.[1]
      ?? block.match(/(?:`?Severity`?|\*\*Severity\*\*)\s*[:|]\s*(High|Medium|Low)\b/i)?.[1];
    const disposition = /\bNot assessed\b/i.test(block) ? "Not assessed"
      : /\bNot applicable\b/i.test(block) ? "Not applicable"
        : "Applicable";
    observedRules.push({ ruleId: rule, disposition, ...(severity ? { severity } : {}) });
  }
  const outputFields = detectOutputFields(text);
  const observed = {
    ruleAssertions: observedRules,
    outputFields,
    reportMode: outputFields.includes("Applicability") || outputFields.includes("Change type") ? "detailed" : "concise",
    targetExecution: sourceAudit.commandAttempts.some(({ ranSentinel }) => ranSentinel) ? "attempted" : "none",
    readFiles: sourceAudit.reads.map(({ path: readPath }) => readPath)
  };
  if (item.mode === "skeleton") {
    observed.outputCount = text.trim() ? 1 : 0;
    observed.unknownValues = /\bTODO\b/.test(text) ? "TODO" : "missing";
    observed.createSkillPackage = sourceAudit.commandAttempts.some(({ command }) => /(?:mkdir|touch|tee|cat\s*>|apply_patch)/.test(command));
    observed.packageDraftInResponse = /### `(?:SKILL\.md|references\/|templates\/)/.test(text);
  }
  if (!text.trim()) notes.push("No final assistant response was captured.");
  return { observed, notes };
}

export function detectOutputFields(text) {
  const fields = [];
  for (const field of ["Level", "Severity", "Confidence", "Applicability", "Category", "Issue", "Rule", "Evidence", "Why it matters", "Suggestion", "Change type"]) {
    const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`(?:\\*\\*|\\x60)?${escaped}(?:\\*\\*|\\x60)?\\s*[:|]`).test(text)) fields.push(field);
  }
  const conciseHeading = /(?:^|\n)-\s*\*\*(?:Prompt|Context|Agent Skill|Repository\/Harness)\s*\|\s*\[?(?:High|Medium|Low)\s*\|\s*(?:High|Medium|Low)\s+confidence\]?/i.test(text);
  if (conciseHeading) {
    for (const field of ["Level", "Severity", "Confidence"]) if (!fields.includes(field)) fields.push(field);
    if (/(?:^|\n)-\s*\*\*[^\n]*\*\*\s*—\s*\S/m.test(text) && !fields.includes("Issue")) fields.push("Issue");
  }
  if (/\b(?:Prompt|Context|Agent Skill|Repository\/Harness)\s*\|\s*\[?(?:High|Medium|Low)\s*\|/i.test(text) && !fields.includes("Level")) fields.push("Level");
  if (/`(?:prompt|context|agent-skill|repository)\/[a-z0-9-]+`/.test(text)) fields.push("Rule ID");
  return [...new Set(fields)];
}
