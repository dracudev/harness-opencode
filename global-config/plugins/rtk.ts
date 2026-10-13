import { spawnSync } from "node:child_process"

const RTK_TOOLS = new Set(["bash", "shell"])

function rewrite(command: string): string | undefined {
  const result = spawnSync("rtk", ["rewrite", command], { encoding: "utf8" })
  if (result.status !== 0) return undefined
  const out = (result.stdout ?? "").trim()
  return out && out !== command ? out : undefined
}

function rtkAvailable(): boolean {
  try {
    return spawnSync("rtk", ["--version"], { encoding: "utf8" }).status === 0
  } catch {
    return false
  }
}

type V2Hook = (name: string, callback: (input: any) => Promise<void> | void) => Promise<{ dispose: () => Promise<void> }>

async function setupRtkV2(ctx: { tool: { hook: V2Hook } }) {
  if (!rtkAvailable()) return
  const registration = await ctx.tool.hook("execute.before", async (call: any) => {
    const tool = String(call?.tool ?? "").toLowerCase()
    if (!RTK_TOOLS.has(tool)) return
    const args = call?.input
    if (!args || typeof args !== "object") return
    const command = args.command
    if (typeof command !== "string" || !command) return
    const rewritten = rewrite(command)
    if (rewritten) args.command = rewritten
  })
  return () => registration.dispose()
}

const rtkV1 = async ({ $ }: any) => {
  try {
    await $`which rtk`.quiet()
  } catch {
    return {}
  }
  return {
    "tool.execute.before": async (input: any, output: any) => {
      const tool = String(input?.tool ?? "").toLowerCase()
      if (!RTK_TOOLS.has(tool)) return
      const args = output?.args
      if (!args || typeof args !== "object") return
      const command = args.command
      if (typeof command !== "string" || !command) return
      const result = await $`rtk rewrite ${command}`.quiet().nothrow()
      const rewritten = String(result.stdout).trim()
      if (rewritten && rewritten !== command) args.command = rewritten
    },
  }
}

export default { id: "rtk", server: rtkV1, setup: setupRtkV2 }
