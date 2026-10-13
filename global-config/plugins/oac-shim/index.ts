// oac-shim — OpenCode V2 compatibility layer for OAC.
//
// OAC's agents and commands speak the V1 tool surface. This plugin restores it
// so they run unmodified on V2:
//
//   task      : renamed to `subagent` in V2 -> re-exposed with OAC's
//               `subagent_type` parameter and short-name -> agent-ID resolution.
//   todoread  : does not exist in V2 -> re-implemented here.
//   todowrite : exists natively in V2; overridden here so OAC keeps its exact
//               replacement-list semantics with a matching todoread view.
//
// Set OAC_SHIM_DEBUG=1 to log to /tmp/oac-shim-debug.log.

import { Plugin } from "@opencode/plugin";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const debug = (message) => {
  if (!process.env.OAC_SHIM_DEBUG) return;
  try {
    appendFileSync("/tmp/oac-shim-debug.log", `${new Date().toISOString()} ${message}\n`);
  } catch {}
};

const STATUS_MARKS = {
  pending: "[ ]",
  in_progress: "[~]",
  completed: "[x]",
  cancelled: "[-]",
};

const stateDir = path.join(
  process.env.XDG_STATE_HOME || path.join(os.homedir(), ".local", "state"),
  "opencode",
  "oac-shim",
);

// --- pure helpers ---------------------------------------------------------

const normalize = (value) => String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

const renderTodos = (todos) => {
  if (!todos.length) return "No todos yet. Use todowrite to plan.";
  return todos
    .map((todo) => `${STATUS_MARKS[todo.status] ?? "[ ]"} ${todo.content} (${todo.priority ?? "medium"})`)
    .join("\n");
};

// The built-in `subagent` tool's agent field is not in the published schema
// package, so read its input schema at runtime and find the agent-ish key.
const findAgentKey = (schema) => {
  const keys = Object.keys(schema?.properties ?? {});
  return (
    keys.find((key) => /^(agent|agentid|agent_id|subagent|subagent_type)$/i.test(key)) ??
    keys.find((key) => /agent/i.test(key)) ??
    "agent"
  );
};

const pickAgent = (agents, wanted) => {
  const target = normalize(wanted);
  if (!target) return undefined;
  const exact = agents.find((agent) => agent.id === wanted || agent.name === wanted);
  if (exact) return exact.id;
  return agents.find(
    (agent) =>
      normalize(agent.id) === target ||
      normalize(agent.id.split("/").pop()) === target ||
      normalize(agent.name) === target,
  )?.id;
};

// --- todo persistence -----------------------------------------------------

const todoFile = (sessionID) => path.join(stateDir, `${sessionID}.json`);

const readTodos = (sessionID) => {
  try {
    const parsed = JSON.parse(readFileSync(todoFile(sessionID), "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeTodos = (sessionID, todos) => {
  mkdirSync(stateDir, { recursive: true });
  writeFileSync(todoFile(sessionID), JSON.stringify(todos, null, 2));
};

const TODO_SCHEMA = {
  type: "object",
  properties: {
    todos: {
      type: "array",
      description: "The complete todo list. Replaces the previous one.",
      items: {
        type: "object",
        properties: {
          content: { type: "string" },
          status: { type: "string", enum: ["pending", "in_progress", "completed", "cancelled"] },
          priority: { type: "string", enum: ["high", "medium", "low"] },
        },
        required: ["content", "status"],
      },
    },
  },
  required: ["todos"],
};

export default Plugin.define({
  id: "oac-shim",

  async setup(context) {
    debug("setup: start");

    // The agent editor returns an empty list during setup (the project is not
    // fully loaded yet), so resolve agents lazily on each call instead.
    const listAgents = async () => {
      let found = [];
      try {
        await context.agent.transform((editor) => {
          const raw = editor.list();
          found = raw.map((agent) => ({ id: agent.id, name: agent.name }));
        });
      } catch (error) {
        debug(`listAgents failed: ${error}`);
      }
      return found;
    };

    await context.tool.transform((editor) => {
      editor.add({
        name: "todowrite",
        description:
          "Create or update the session todo list. Pass the complete list; it replaces the previous one.",
        input: TODO_SCHEMA,
        execute: async (input, ctx) => {
          const todos = Array.isArray(input?.todos) ? input.todos : [];
          writeTodos(ctx.sessionID, todos);
          return { content: renderTodos(todos) };
        },
      });

      editor.add({
        name: "todoread",
        description: "Read the current session's todo list.",
        input: { type: "object", properties: {} },
        execute: async (_input, ctx) => ({ content: renderTodos(readTodos(ctx.sessionID)) }),
      });

      const subagent = editor.list().find((tool) => tool.name === "subagent" || tool.id === "subagent");
      if (!subagent) return;

      const agentKey = findAgentKey(subagent.input);

      editor.add({
        name: "task",
        description:
          "Launch a subagent (V2 alias of `subagent`). Accepts OAC's `subagent_type` and resolves short agent names to V2 agent IDs.",
        input: {
          type: "object",
          properties: {
            subagent_type: { type: "string", description: "Agent name (e.g. ContextScout) or V2 agent ID." },
            description: { type: "string", description: "Short task description." },
            prompt: { type: "string", description: "Task instructions for the subagent." },
            background: { type: "boolean", description: "Run in the background." },
            task_id: { type: "string", description: "Optional id to resume a previous subagent session." },
          },
          required: ["subagent_type", "prompt"],
        },
        // Forwarding `subagent`'s result without re-declaring its output schema
        // makes V2 reject it ("Tool result declared output without an output
        // schema"), so mirror the underlying tool's schema here.
        output: subagent.output,
        execute: async (input, ctx) => {
          const agents = await listAgents();
          const resolved = pickAgent(agents, input?.subagent_type);
          if (!resolved) {
            return {
              content: `Unknown agent: ${input?.subagent_type}. Available: ${agents.map((a) => a.id).join(", ")}`,
            };
          }
          const forwarded = {
            [agentKey]: resolved,
            description: input.description ?? String(input.prompt ?? "").slice(0, 80),
            prompt: input.prompt,
          };
          if (input.background !== undefined) forwarded.background = input.background;
          if (input.task_id !== undefined) forwarded.task_id = input.task_id;
          return subagent.execute(forwarded, ctx);
        },
      });
    });

    debug("setup: tool.transform done");
    return () => {};
  },
});
