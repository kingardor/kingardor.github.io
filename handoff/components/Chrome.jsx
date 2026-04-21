import { useState, useEffect, useRef } from 'react';

export function TopNav({ onAsk }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 60);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const links = [
    { n: '01', t: 'MANIFESTO', id: 'manifesto' },
    { n: '02', t: 'CAREER',    id: 'career' },
    { n: '03', t: 'SKILLS',    id: 'skills' },
    { n: '04', t: 'WORK',      id: 'projects' },
    { n: '05', t: 'SIGNALS',   id: 'videos' },
    { n: '06', t: 'CONTACT',   id: 'contact' },
  ];
  const jump = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <nav className={`top-nav ${scrolled ? 'scrolled' : ''}`}>
      <a href="#top" className="brand hot" onClick={jump('top')}>AJ<span className="dot">.</span></a>
      <div className="nav-links">
        {links.map(l => (
          <a key={l.id} href={`#${l.id}`} className="nav-link hot" onClick={jump(l.id)}>
            <span className="n">{l.n}</span>{l.t}
          </a>
        ))}
      </div>
      <button className="ask-btn hot" onClick={onAsk}>
        <span className="v">V</span> ASK VERONICA
      </button>
    </nav>
  );
}

/*
 * STUB Veronica overlay. In the live integration, swap the demo replyFor()
 * with your existing SSE streaming / tool-loop code from ChatPage.jsx, OR
 * make TopNav's onAsk redirect to #/chat and delete this component entirely.
 */
export function Veronica({ open, onClose }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 400);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, pending]);

  const suggestions = [
    'What are you working on now?',
    'Tell me about your edge AI work.',
    'Are you hiring or being hired?',
    'What is Veronica, exactly?',
  ];

  // TODO: replace with SSE call to veronica-proxy-vercel /api/chat
  const replyFor = (q) => {
    return "Wire me to the real backend — see handoff/CLAUDE_CODE_PROMPT.md step 6.";
  };

  const send = (text) => {
    const t = (text ?? input).trim();
    if (!t) return;
    setMsgs(m => [...m, { role: 'me', text: t }]);
    setInput('');
    setPending(true);
    setTimeout(() => {
      setMsgs(m => [...m, { role: 'v', text: replyFor(t) }]);
      setPending(false);
    }, 900);
  };

  return (
    <div className={`veronica ${open ? 'open' : ''}`}>
      <div className="veronica-orbit" />
      <div className="veronica-core" />
      <div className="v-head">
        <div className="v-ident">
          <div className="v-sigil">V</div>
          <div>
            <div className="v-name">Veronica</div>
            <div className="v-acro">VERSATILE ONLINE INTELLIGENT COGNITIVE AGENT</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="v-status">ONLINE</div>
          <button className="v-close hot" onClick={onClose} aria-label="Close">×</button>
        </div>
      </div>
      <div className="v-body" ref={scrollRef}>
        {msgs.length === 0 ? (
          <div className="v-empty">
            <div className="v-empty-v">V</div>
            <div>
              <h1>Ask me anything<br/>about Akash.</h1>
              <div className="acro" style={{ marginTop: 14 }}>I answer in his voice, slightly sharper.</div>
            </div>
            <div className="v-suggests">
              {suggestions.map((s, i) => (
                <button key={i} className="v-sugg hot" onClick={() => send(s)}>
                  <span>{s}</span> <span className="ar">→</span>
                </button>
              ))}
            </div>
            <div className="hint">DEMO MODE · REAL AGENT LIVES AT /chat</div>
          </div>
        ) : (
          <>
            {msgs.map((m, i) => (
              <div key={i} className={`v-msg ${m.role}`}>
                {m.role === 'v' && <div className="v-avatar">V</div>}
                <div className="v-bubble">{m.text}</div>
              </div>
            ))}
            {pending && (
              <div className="v-msg v">
                <div className="v-avatar">V</div>
                <div className="v-bubble">
                  <span className="v-typing"><span /><span /><span /></span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="v-input-wrap">
        <form className="v-input" onSubmit={e => { e.preventDefault(); send(); }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Interrogate Veronica..."
          />
          <button type="submit" className="v-send hot" disabled={!input.trim() || pending} aria-label="Send">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8H14M14 8L9 3M14 8L9 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square"/></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
