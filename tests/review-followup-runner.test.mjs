import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import test from "node:test";
import { codexArguments, runCodex } from "../scripts/lib/review-followup-runner.mjs";

test("the runner sends the prompt on stdin with isolated Codex arguments", async () => {
  const prompt = "raw evaluation prompt\n";
  const cwd = "/private/tmp/case-root";
  let invocation;
  let receivedInput;
  const result = await runCodex({
    prompt,
    cwd,
    model: "gpt-6-luna",
    timeoutMs: 1_000,
    spawnProcess(command, args, options) {
      invocation = { command, args, options };
      const child = makeFakeChild();
      child.stdin.end = (value) => {
        receivedInput = value;
        setImmediate(() => {
          child.stdout.write("{\"type\":\"turn.completed\"}\n");
          child.stderr.write("fake-stderr\n");
          child.emit("close", 0, null);
        });
      };
      return child;
    }
  });

  assert.equal(invocation.command, "codex");
  assert.deepEqual(invocation.args, codexArguments({ cwd, model: "gpt-6-luna" }));
  assert.deepEqual(invocation.options.stdio, ["pipe", "pipe", "pipe"]);
  assert.equal(invocation.options.cwd, cwd);
  assert.equal(receivedInput, prompt);
  assert.equal(result.stdout, "{\"type\":\"turn.completed\"}\n");
  assert.equal(result.stderr, "fake-stderr\n");
  assert.equal(result.exitCode, 0);
  assert.equal(result.timedOut, false);
});

test("the runner reports timeout and terminates its child process", async () => {
  let killedWith;
  const result = await runCodex({
    prompt: "prompt",
    cwd: "/private/tmp/case-root",
    timeoutMs: 5,
    spawnProcess() {
      const child = makeFakeChild();
      child.stdin.end = () => {};
      child.kill = (signal) => {
        killedWith = signal;
        child.emit("close", null, signal);
      };
      return child;
    }
  });

  assert.equal(killedWith, "SIGTERM");
  assert.equal(result.exitCode, null);
  assert.equal(result.signal, "SIGTERM");
  assert.equal(result.timedOut, true);
});

function makeFakeChild() {
  const child = new EventEmitter();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.stdin = { end() {} };
  child.kill = () => {};
  return child;
}
