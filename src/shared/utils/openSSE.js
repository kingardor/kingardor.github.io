/**
 * openSSE — typed SSE client for Veronica v2 protocol.
 *
 * SSE event shapes:
 *   { t: 'text',     v: string }          — prose chunk, append to message content
 *   { t: 'thinking', v: string }          — Qwen3 chain-of-thought chunk
 *   { t: 'tool',     name, status }       — tool executing (update status indicator)
 *   { t: 'block',    name, data }         — rich data block (render as UI card/chart)
 *
 * Legacy plain-text chunks (non-JSON data lines) are forwarded as { t: 'text', v: data }.
 */
export function openSSE({
  base,
  text,
  history,
  onEvent,
  onDone,
  onError,
  onOpen,
  timeoutMs = 60000,
}) {
  const qs = new URLSearchParams()
  qs.set('text', text)
  if (history?.length) qs.set('history', JSON.stringify(history))
  const url = `${base.replace(/\/$/, '')}/api/chat?${qs.toString()}`

  const es = new EventSource(url, { withCredentials: false })
  let ended = false

  es.onopen = () => { onOpen?.() }

  es.onmessage = (ev) => {
    const raw = ev?.data ?? ''
    if (!raw) return

    // Terminal sentinel
    if (raw === '[DONE]') {
      if (!ended) { ended = true; try { es.close() } catch {} ; onDone?.() }
      return
    }

    // Try to parse as typed JSON event
    try {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.t) {
        onEvent?.(parsed)
        return
      }
    } catch {}

    // Fallback: legacy plain-text chunk (shouldn't happen with v2 backend, but safe)
    onEvent?.({ t: 'text', v: raw })
  }

  es.onerror = () => {
    if (!ended) { ended = true; try { es.close() } catch {} ; (onError || onDone)?.() }
  }

  const timer = setTimeout(() => {
    if (!ended) {
      ended = true
      try { es.close() } catch {}
      ;(onError || onDone)?.(new Error('SSE timeout'))
    }
  }, timeoutMs)

  return {
    close: () => { ended = true; clearTimeout(timer); try { es.close() } catch {} }
  }
}
