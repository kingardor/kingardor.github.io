export function openSSE({ base, text, history, onMessage, onDone, onError, onOpen, timeoutMs = 60000 }) {
  const qs = new URLSearchParams()
  qs.set('text', text)
  if (history?.length) qs.set('history', JSON.stringify(history))
  const url = `${base.replace(/\/$/, '')}/api/chat?${qs.toString()}`

  const es = new EventSource(url, { withCredentials: false })
  let ended = false

  es.onopen = () => { onOpen?.() }

  es.onmessage = (ev) => {
    // DO NOT TRIM!
    const data = ev?.data ?? ''
    if (!data) return
    if (data === '[DONE]') {
      if (!ended) { ended = true; try { es.close() } catch {} ; onDone?.() }
      return
    }
    onMessage?.(data)
  }

  es.onerror = () => {
    if (!ended) { ended = true; try { es.close() } catch {} ; (onError || onDone)?.() }
  }

  const timer = setTimeout(() => {
    if (!ended) { ended = true; try { es.close() } catch {} ; (onError || onDone)?.(new Error('SSE timeout')) }
  }, timeoutMs)

  return {
    close: () => { ended = true; clearTimeout(timer); try { es.close() } catch {} }
  }
}
