// DCP inyecta referencias "@N@" y avisos de compresión en el contexto saliente, y
// los modelos (DeepSeek) los copian al final de su respuesta. En V2 ya no existe
// experimental.text.complete, así que se limpian del stream SSE antes de persistirse.

import { appendFileSync, writeFileSync } from "node:fs"

const DIAG_LOG = "/tmp/opencode/dcp-strip.log"
let diagLines = 0

function diag(line: string) {
  try {
    appendFileSync(DIAG_LOG, new Date().toISOString() + " " + line + "\n")
    if (++diagLines > 200) {
      writeFileSync(DIAG_LOG, "")
      diagLines = 0
    }
  } catch {}
}

const FULL_TAG = /\n+@(?:\d+|blocked)@/g
const TAIL = /(?:\n+|\n*@[^\s@]*)$/
const NUDGE_STARTS = [
  "Evaluate the conversation for compressible ranges.",
  "CRITICAL WARNING:",
]

function isPartialTag(s: string): boolean {
  const body = s.match(/^\n*@(.*)$/)?.[1]
  if (body === undefined) return false
  return /^\d{0,6}$/.test(body) || "blocked".startsWith(body)
}

function markerPrefixLen(s: string): number {
  for (let k = Math.min(s.length, 64); k > 0; k--) {
    const tail = s.slice(-k)
    if (NUDGE_STARTS.some((m) => m.startsWith(tail))) return k
  }
  return 0
}

function findNudge(s: string): number {
  let hit = -1
  for (const m of NUDGE_STARTS) {
    let i = s.indexOf(m)
    while (i >= 0 && i > 0 && s[i - 1] !== "\n") i = s.indexOf(m, i + 1)
    if (i >= 0 && (hit < 0 || i < hit)) hit = i
  }
  return hit
}

type Filter = {
  push(text: string): string
  flush(): string
  stats(): { muted: boolean; tags: number }
}

function createFilter(): Filter {
  let carry = ""
  let muted = false
  let tags = 0
  return {
    push(text) {
      if (muted) return ""
      let buf = carry + text
      carry = ""

      const hit = findNudge(buf)
      if (hit >= 0) {
        muted = true
        return buf.slice(0, hit).replace(/\n+$/, "")
      }
      const k = markerPrefixLen(buf)
      if (k) {
        carry = buf.slice(-k)
        buf = buf.slice(0, -k)
      }

      tags += (buf.match(FULL_TAG) ?? []).length
      buf = buf.replace(FULL_TAG, "")
      const m = buf.match(TAIL)
      if (m && (/^\n+$/.test(m[0]) || isPartialTag(m[0]))) {
        carry = m[0] + carry
        buf = buf.slice(0, m.index)
      }
      return buf
    },
    flush() {
      if (muted) return ""
      tags += (carry.match(FULL_TAG) ?? []).length
      const out = carry.replace(FULL_TAG, "")
      carry = ""
      return out
    },
    stats() {
      return { muted, tags }
    },
  }
}

function transformLine(line: string, filter: Filter): { line: string; touched: boolean } {
  if (!line.startsWith("data:")) return { line, touched: false }
  const payload = line.slice(5).trimStart()
  if (!payload || payload === "[DONE]") return { line, touched: false }

  let parsed: any
  try {
    parsed = JSON.parse(payload)
  } catch {
    return { line, touched: false }
  }

  let touched = false
  for (const choice of parsed?.choices ?? []) {
    const delta = choice?.delta ?? choice?.message
    if (!delta || typeof delta.content !== "string") continue
    const next = filter.push(delta.content)
    if (next !== delta.content) {
      delta.content = next
      touched = true
    }
  }
  return touched ? { line: "data: " + JSON.stringify(parsed), touched } : { line, touched }
}

export function stripTagStream(response: Response): Response {
  const type = response.headers.get("content-type") ?? ""
  if (!response.body || !type.includes("text/event-stream")) return response

  const filter = createFilter()
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let pending = ""

  const body = response.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        pending += decoder.decode(chunk, { stream: true })
        let index: number
        while ((index = pending.indexOf("\n")) >= 0) {
          const line = pending.slice(0, index)
          pending = pending.slice(index + 1)
          const out = transformLine(line, filter)
          controller.enqueue(encoder.encode(out.line + "\n"))
        }
      },
      flush(controller) {
        pending += decoder.decode()
        if (pending) controller.enqueue(encoder.encode(transformLine(pending, filter).line))
        const rest = filter.flush()
        if (rest) {
          const tail = { choices: [{ delta: { content: rest } }] }
          controller.enqueue(encoder.encode("data: " + JSON.stringify(tail) + "\n\n"))
        }
        const s = filter.stats()
        diag(`stream muted=${s.muted} tags=${s.tags}`)
      },
    }),
  )

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
}

export default {
  id: "dcp-tag-strip",
  async setup(ctx: any) {
    await ctx.session.hook("http.response", (event: any) => {
      const ct = event.response?.headers?.get?.("content-type") ?? ""
      diag(`resp kind=${event.kind} ct=${ct || "-"}`)
      if (event.kind !== "primary") return
      event.response = stripTagStream(event.response)
    })
  },
}
