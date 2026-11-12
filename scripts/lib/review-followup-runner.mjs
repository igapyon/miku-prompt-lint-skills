import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { canonicalJson, sha256 } from "./review-followup-contract.mjs";
import { CODEX_ARGUMENT_TEMPLATE } from "./review-followup-protocol.mjs";

export function codexArguments({ cwd, model = "gpt-6-luna" }) {
  return CODEX_ARGUMENT_TEMPLATE.map((value) => value === "<isolated-case-root>" ? cwd : value === "gpt-6-luna" ? model : value);
}

export function codexArgumentTemplate({ model = "gpt-6-luna" } = {}) {
  return codexArguments({ cwd: "<isolated-case-root>", model });
}

export function runCodex({ prompt, cwd, timeoutMs, model = "gpt-6-luna", spawnProcess = spawn }) {
  return new Promise((resolve) => {
    const args = codexArguments({ cwd, model });
    const child = spawnProcess(process.env.CODEX_BIN ?? "codex", args, {
      cwd,
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ stdout, stderr, ...value });
    };
    const timer = setTimeout(() => {
      finish({ exitCode: null, signal: "SIGTERM", timedOut: true });
      child.kill("SIGTERM");
    }, timeoutMs);
    child.stdout.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", (chunk) => { stderr += chunk; });
    child.on("error", (error) => {
      stderr += `${error.stack ?? error}\n`;
      finish({ exitCode: null, signal: null, timedOut: false });
    });
    child.on("close", (exitCode, signal) => finish({ exitCode, signal, timedOut: false }));
    child.stdin.end(prompt);
  });
}

export function renderCasePrompt({ item, activationProfile, stagedSkillPath }) {
  if (item.mode === "activation-metadata") {
    return [
      "Classify the simulated user turn using only the activation profile below.",
      "Return only JSON with one property, activation. Use one of these values: activate, inactive, meta, suggest-and-wait, ask-for-target.",
      `Activation profile: ${JSON.stringify(activationProfile)}`,
      `Current user turn: ${JSON.stringify(item.input.user)}`,
      `Relevant preceding conversation history: ${JSON.stringify(item.input.history ?? [])}`
    ].join("\n") + "\n";
  }
  const target = { ...item.input };
  delete target.user;
  const history = target.history ?? [];
  delete target.history;
  const sessionDir = path.dirname(path.dirname(path.dirname(stagedSkillPath)));
  const skillPath = path.relative(sessionDir, stagedSkillPath).split(path.sep).join("/");
  return [
    `The subject Skill is available in this project at ${skillPath}/SKILL.md.`,
    `User turn: ${JSON.stringify(item.input.user)}`,
    ...(history.length ? [`Relevant preceding conversation history: ${JSON.stringify(history)}`] : []),
    ...(Object.keys(target).length ? [`Supplied review context: ${JSON.stringify(target)}`] : [])
  ].join("\n") + "\n";
}

export function parseCodexEvents(stdout) {
  const events = [];
  for (const line of stdout.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try { events.push(JSON.parse(line)); }
    catch { events.push({ type: "invalid-json-line", raw: line }); }
  }
  return events;
}

export function finalAgentMessage(events) {
  const messages = events.filter((event) => event.type === "item.completed" && event.item?.type === "agent_message");
  return messages.at(-1)?.item?.text ?? "";
}

export function auditSkillReads(events, { sessionDir, stagedSkill, manifest, mode }) {
  const reads = [];
  const externalSkillReads = [];
  const issues = [];
  const externalPattern = /(?:~|\/Users\/[^/]+|\/home\/[^/]+)\/(?:\.codex|\.agents)\/skills\/igapyon-miku-prompt-lint(?:\/|\b)|\$CODEX_HOME\/(?:skills|\.agents\/skills)\/igapyon-miku-prompt-lint/;
  const commands = events.filter((event) => event.type === "item.completed" && event.item?.type === "command_execution");
  for (const event of commands) {
    const command = event.item.command ?? "";
    const output = event.item.aggregated_output ?? "";
    const exitCode = event.item.exit_code;
    const external = externalPattern.test(command);
    if (external) externalSkillReads.push({ eventId: event.item.id, command, exitCode });
    if (!stagedSkill || !/\b(cat|sed|head|tail|rg|less|more|nl)\b/.test(command)) continue;
    const eventReads = [];
    for (const file of manifest) {
      const absolute = path.join(stagedSkill, ...file.path.split("/"));
      const relative = path.join(path.relative(sessionDir, stagedSkill), ...file.path.split("/"));
      const positions = [command.indexOf(absolute), command.indexOf(relative)].filter((position) => position >= 0);
      if (positions.length && fileContentsMatchOutput(absolute, output)) {
        eventReads.push({
          position: Math.min(...positions),
          read: { path: file.path, sha256: file.sha256, eventIds: [event.item.id] }
        });
      }
    }
    eventReads.sort((a, b) => a.position - b.position);
    for (const { read } of eventReads) {
      if (!reads.some((existing) => existing.eventIds.includes(event.item.id) && existing.path === read.path)) reads.push(read);
    }
    const mentionsSkill = command.includes("igapyon-miku-prompt-lint") || /(?:^|\s)SKILL\.md\b/.test(command);
    if (mentionsSkill && !(command.includes(stagedSkill) || command.includes(path.relative(sessionDir, stagedSkill))) && !external) {
      issues.push(`Unresolved Skill read path in trace event ${event.item.id}.`);
    }
  }
  if (externalSkillReads.length) issues.push("An external/global prompt-lint Skill path was accessed.");
  if (mode !== "activation-metadata" && !reads.some(({ path: readPath }) => readPath === "SKILL.md")) {
    issues.push("The staged Skill entrypoint read was not verified from trace output.");
  }
  return {
    status: issues.length ? "unverifiable" : "verified",
    reads,
    externalSkillReads,
    issues,
    manifestSha256: sha256(canonicalJson(manifest)),
    stagedSkillPath: stagedSkill ? path.resolve(stagedSkill) : null,
    commandAttempts: commands.map((event) => ({
      eventId: event.item.id,
      command: event.item.command ?? "",
      exitCode: event.item.exit_code,
      ranSentinel: (event.item.command ?? "").includes("/tmp/prompt-lint-target-was-run")
    })),
    sessionRoot: path.basename(sessionDir)
  };
}

function fileContentsMatchOutput(filePath, output) {
  if (!output) return false;
  const contents = fs.readFileSync(filePath, "utf8");
  return contents.length > 0 && output.includes(contents);
}
