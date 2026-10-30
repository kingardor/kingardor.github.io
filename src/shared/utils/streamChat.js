/**
 * streamChat — POST client for the Veronica v2 stream (/api/chat).
 *
 * Request body: { text, history: [{ role, content }] }. The response is an SSE
 * body of typed events:
 *   { t: 'text',     v: string }    — prose chunk, append to message content
 *   { t: 'thinking', v: string }    — reasoning chunk
 *   { t: 'tool',     name, status } — tool executing (update status indicator)
 *   { t: 'block',    name, data }   — rich data block (render as UI card/chart)
 *   { t: 'error',    v: string }    — the turn failed upstream; v is visitor-safe
 * terminated by a `[DONE]` frame.
 *
 * POST keeps long histories out of the URL (Cloudflare caps URLs at 16KB) and
 * out of logs. The timeout is an inactivity timeout — a long multi-tool answer
 * that keeps streaming is never cut off. close() aborts silently.
 */

const STATUS_MESSAGES = {
  403: 'This channel only answers on akashjames.com.',
  413: 'That conversation got too long — refresh to start a new one.',
  429: 'Too many messages in a minute. Give it a moment and try again.',
}

export function streamChat({
  base = '',
  text,
  history,
  onEvent,
  onDone,
  onError,
  idleMs = 45000,
}) {
  const ctrl = new AbortController()
  let closed = false
  let ended = false
  let idleTimer

  const finish = (err) => {
    if (ended || closed) return
    ended = true
    clearTimeout(idleTimer)
    if (err) onError?.(err)
    else onDone?.()
  }
  const touch = () => {
    clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
      finish({ message: 'Veronica went quiet. Try again.' })
      ctrl.abort()
    }, idleMs)
  }

  const handleFrame = (raw) => {
    if (raw === '[DONE]') return finish()
    try {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.t) onEvent?.(parsed)
    } catch { /* ignore malformed frame */ }
  }

  ;(async () => {
    touch()
    let res
    try {
      res = await fetch(`${base.replace(/\/$/, '')}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({ text, history: history || [] }),
        signal: ctrl.signal,
      })
    } catch {
      return finish({ message: 'Couldn’t reach Veronica. Check your connection.' })
    }
    if (!res.ok || !res.body) {
      return finish({ status: res.status, message: STATUS_MESSAGES[res.status] || 'Veronica is unavailable right now.' })
    }

    const reader = res.body.getReader()
    const dec = new TextDecoder()
    let buf = ''
    try {
      while (!ended && !closed) {
        const { value, done } = await reader.read()
        if (done) break
        touch()
        buf += dec.decode(value, { stream: true })
        let sep
        while ((sep = buf.indexOf('\n\n')) !== -1) {
          const frame = buf.slice(0, sep)
          buf = buf.slice(sep + 2)
          for (const line of frame.split('\n')) {
            if (line.startsWith('data:')) handleFrame(line.slice(5).trimStart())
          }
        }
      }
    } catch { /* aborted or network drop — handled below */ }
    finish(ended ? undefined : { message: 'The connection dropped mid-answer.' })
  })()

  return {
    close: () => {
      closed = true
      clearTimeout(idleTimer)
      ctrl.abort()
    },
  }
}
