import { useRef, useEffect, useState } from 'react';
import { DATA } from './dataAdapter.js';
import { GridMeshBG } from './Backgrounds.jsx';
import { CHAT_SUGGESTIONS } from '../../data.js';
import { ElectricBorder } from './ElectricBorder.jsx';
import RotatingText from './reactbits/RotatingText.jsx';
import HeroParticles from './HeroParticles.jsx';

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
      <span className="hero-chat-corner tl" />
      <span className="hero-chat-corner tr" />
      <span className="hero-chat-corner bl" />
      <span className="hero-chat-corner br" />
      <div className="hero-chat-label">VERONICA · AI COPILOT · STANDBY</div>
      <form className="hero-chat-form" onSubmit={submit}>
        <div className="hero-chat-bar">
          <div className="hero-chat-sigil">V</div>
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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
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
  const [assembled, setAssembled] = useState(false);
  const scrollTo = (id) => () => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  const renderWord = (word, startDelay, cls = '') => (
    <span className={`word ${cls}`}>
      {[...word].map((c, i) => <AnimChar key={i} ch={c} delay={startDelay + i * 22} />)}
    </span>
  );

  return (
    <section className="hero" id="top" data-screen-label="01 Hero">
      {bg.grid && <GridMeshBG accent={accent} />}
      <HeroParticles onAssembled={() => setAssembled(true)} />
      <div className={`hero-photo with-particles${assembled ? ' assembled' : ''}`} />
      <div className="wrap hero-content">
        <h1 className="hero-name">
          <span className="line">{renderWord('AKASH', 200)}</span>
          <span className="line red">{renderWord('JAMES', 420)}</span>
        </h1>
        <div className="hero-meta">
          <p className="hero-tag reveal in d3">
            builds{' '}
            <RotatingText
              texts={[
                'agents that close loops.',
                'vision systems at the edge.',
                'RAG pipelines that retrieve at scale.',
                'platforms 0 → 1.',
                'GPU stacks that ship.',
              ]}
              rotationInterval={3000}
              staggerDuration={0.018}
              staggerFrom="first"
              splitBy="characters"
              mainClassName="hero-rotate"
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            />
          </p>
        </div>
        <HeroChatPill />
      </div>
      <button className="hero-scroll hot" onClick={scrollTo('manifesto')}
        style={{ background: 'transparent', border: 'none', color: 'inherit' }}>
        <div className="scroll-sonar">
          <div className="scroll-ring" />
          <div className="scroll-ring" />
          <div className="scroll-ring" />
          <div className="scroll-dot" />
        </div>
        <div className="scroll-stem" />
        <span className="scroll-label">SCROLL</span>
      </button>
    </section>
  );
}

export function Marquee() {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const BASE = 1.4;  // px/frame base speed (~84 px/s at 60 fps)
    const MAX  = 8;    // cap on swipe-added velocity
    const FRIC = 0.88; // velocity decay per frame

    let pos = 0, vel = 0, raf, halfW = 0;
    const measure = () => { halfW = track.scrollWidth / 2; };
    measure();

    track.style.animation = 'none'; // JS owns the motion now

    raf = requestAnimationFrame(function tick() {
      pos -= Math.max(0, BASE + vel);
      if (pos <= -halfW) pos += halfW;
      track.style.transform = `translateX(${pos}px)`;
      vel *= FRIC;
      if (Math.abs(vel) < 0.02) vel = 0;
      raf = requestAnimationFrame(tick);
    });

    // Pointer/touch tracking — swipe left boosts speed, swipe right slows it
    let px = 0, pt = 0, active = false;
    const onDown  = (e) => { active = true; px = e.clientX; pt = performance.now(); };
    const onMove  = (e) => {
      if (!active) return;
      const now = performance.now(), dt = now - pt;
      if (dt < 2) return;
      vel = Math.max(-MAX, Math.min(MAX, -(e.clientX - px) / dt * 16));
      px = e.clientX; pt = now;
    };
    const onUp = () => { active = false; };

    const el = track.parentElement;
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerup',    onUp);
    el.addEventListener('pointerleave', onUp);

    const ro = new ResizeObserver(measure);
    ro.observe(track);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup',    onUp);
      el.removeEventListener('pointerleave', onUp);
      ro.disconnect();
    };
  }, []);

  const items = ['AGENTS', 'MULTIMODAL', 'VISION', 'EDGE', 'CUDA', 'AGENTS', 'LLMS', 'DEEPSTREAM', 'RAG', 'JETSON', 'TENSORRT'];
  const line = items.map((t, i) => (
    <span key={i} className="marquee-item">{t}<span className="sep" /></span>
  ));
  return (
    <div className="marquee">
      <div className="marquee-track" ref={trackRef}>
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
          {DATA.stats.map((s, i) => {
            const isCoffee = s.label === 'COFFEE UNITS';
            if (isCoffee) {
              return (
                <ElectricBorder key={i} color="#f59e0b" borderRadius={8} speed={0.9} chaos={0.1}
                  className="reveal" style={{ transitionDelay: `${i * 40}ms` }}>
                  <div className="stat" style={{ '--stat-accent': '#f59e0b', borderTop: 'none' }}>
                    <div className="stat-num">{s.num}</div>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-sub">{s.sub}</div>
                  </div>
                </ElectricBorder>
              );
            }
            return (
              <div className="stat reveal" key={i} style={{ transitionDelay: `${i * 40}ms` }}>
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
