// Mint skin: the "MY QUESTION:" write-in coupon, cut from the box back.
// A round red TRY ME push button sends; while she talks it becomes a pull tab.
import { useEffect } from 'react'

export default function Coupon({ v, inputRef }) {
  const { input, setInput, loading, send, stop } = v

  // Grow with the question, up to four lines.
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    if (input) el.style.height = `${Math.min(el.scrollHeight, 4 * 27 + 8)}px`
  }, [input, inputRef])

  const submit = (e) => {
    e.preventDefault()
    if (!loading && input.trim()) send(input)
  }

  return (
    <form className="mbv-coupon" onSubmit={submit}>
      <span className="mbv-coupon-cut" aria-hidden="true">✂ CUT HERE</span>
      <div className="mbv-coupon-body">
        <label className="mbv-coupon-h" htmlFor="mbv-q">MY QUESTION:</label>
        <textarea
          id="mbv-q"
          ref={inputRef}
          className="mbv-coupon-in"
          rows={1}
          value={input}
          maxLength={2000}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) submit(e)
          }}
          placeholder="Write in your question…"
          autoComplete="off"
          spellCheck
          enterKeyHint="send"
        />
        <p className="mbv-coupon-fine" aria-hidden="true">No stamp needed · Enter sends · Shift+Enter: new line</p>
      </div>
      {loading ? (
        <button type="button" className="mbv-pull" onClick={stop}>
          <span className="mbv-pull-hole" aria-hidden="true" />
          <span>PULL TAB</span><b aria-hidden="true">■</b>
          <span className="mbv-sr"> (stop her)</span>
        </button>
      ) : (
        <button type="submit" className="mbv-push" aria-disabled={!input.trim()} aria-label="Try me: send your question">
          <span aria-hidden="true">TRY<br />ME</span>
        </button>
      )}
    </form>
  )
}
