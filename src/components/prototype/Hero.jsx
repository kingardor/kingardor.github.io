import { useRef, useEffect, useState } from 'react';
import { DATA } from './dataAdapter.js';
import { GridMeshBG } from './Backgrounds.jsx';
import { CHAT_SUGGESTIONS } from '../../data.js';

const SEED_KEY = 'chat:seed';

function HeroChatPill() {
  const [text, setText] = useState('');
  const [ghost, setGhost] = useState('');
  const [phase, setPhase] = useState('typing');
  const [idx, setIdx] = useState(0);
  const suggestions = CHAT_SUGGESTIONS || ['Ask me anything...'];

  useEffect(() => {
    const s = suggestions[idx] || '';
    let t;
    if (phase === 'typing') {
      if (ghost.length < s.length) t = setTimeout(() => setGhost(s.slice(0, ghost.length + 1)), 22);
      else t = setTimeout(() => setPhase('pause'), 1200);
    } else if (phase === 'pause') {
      t = setTimeout(() => setPhase('deleting'), 300);
    } else if (phase === 'deleting') {
      if (ghost.length) t = setTimeout(() => setGhost(s.slice(0, ghost.length - 1)), 10);
      else { setIdx(i => (i + 1) % suggestions.length); setPhase('typing'); }
    }
    return () => clearTimeout(t);
  }, [ghost, phase, idx, suggestions]);

  const submit = (e) => {
    e.preventDefault();
    const q = text.trim();
    if (q) {
      try { sessionStorage.setItem(SEED_KEY, q); } catch {}
      location.hash = `/chat?q=${encodeURIComponent(q)}`;
    } else {
      location.hash = '/chat';
    }
  };

  return (
    <div className="hero-chat reveal in d4">
      <div className="hero-chat-label">↳ <span className="accent">VERONICA</span> · AI COPILOT · ASK ANYTHING</div>
      <form className="hero-chat-form" onSubmit={submit}>
        <div className="hero-chat-bar">
          <div className="hero-chat-input-wrap">
            <input
              className="hero-chat-input hot"
              value={text}
              onChange={e => setText(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              aria-label="Ask Veronica"
            />
            {!text && (
              <span className="hero-chat-ghost" aria-hidden>
                {ghost}<span className="hero-chat-cursor" />
              </span>
            )}
          </div>
          <button type="submit" className="hero-chat-submit hot" aria-label="Send">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 11L11 3M11 3H5M11 3V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

function AnimChar({ ch, delay }) {
  return (
    <span className="ch" style={{ animationDelay: `${delay}ms` }}>
      {ch === ' ' ? ' ' : ch}
    </span>
  );
}

export function Hero({ bg = { grid: true }, accent = '#ef2b3a' }) {
  const scrollTo = (id) => () => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  const renderWord = (word, startDelay, cls = '') => (
    <span className={`word ${cls}`}>
      {[...word].map((c, i) => <AnimChar key={i} ch={c} delay={startDelay + i * 40} />)}
    </span>
  );

  return (
    <section className="hero" id="top" data-screen-label="01 Hero">
      {bg.grid && <GridMeshBG accent={accent} />}
      <div className="hero-photo" />
      <div className="hero-scan" />
      <div className="wrap hero-content">
        <h1 className="hero-name">
          <span className="line">{renderWord('AKASH', 200)}</span>
          <span className="line red">{renderWord('JAMES', 700)}</span>
        </h1>
        <div className="hero-meta">
          <p className="hero-tag reveal in d3">
            {DATA.profile.tagline}
          </p>
        </div>
        <HeroChatPill />
      </div>
      <button className="hero-scroll hot" onClick={scrollTo('manifesto')}
        style={{ background: 'transparent', border: 'none', color: 'inherit' }}>
        SCROLL
        <span className="line" />
      </button>
    </section>
  );
}

export function Marquee() {
  const items = ['AGENTS', 'MULTIMODAL', 'VISION', 'EDGE', 'CUDA', 'AGENTS', 'LLMS', 'DEEPSTREAM', 'RAG', 'JETSON', 'TENSORRT'];
  const line = items.map((t, i) => (
    <span key={i} className="marquee-item">{t}<span className="sep" /></span>
  ));
  return (
    <div className="marquee">
      <div className="marquee-track">
        {line}{line}
      </div>
    </div>
  );
}

export function Manifesto() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const words = Array.from(el.querySelectorAll('.word-fade'));
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.15;
      const prog = Math.max(0, Math.min(1, (start - rect.top) / (start - end + rect.height * 0.5)));
      const threshold = Math.floor(prog * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < threshold));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <section className="manifesto" id="manifesto" data-screen-label="02 Manifesto">
      <div className="wrap">
        <div className="manifesto-header reveal">
          <div className="manifesto-label">MANIFESTO · 001</div>
        </div>
        <div className="manifesto-body" ref={ref}>
          {DATA.manifesto.map((w, i) => (
            <span key={i} className={`word-fade ${w.accent ? 'hi-accent' : ''}`}>{w.txt} </span>
          ))}
        </div>
        <div className="manifesto-stats">
          {DATA.stats.map((s, i) => (
            <div className="stat reveal" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
