import { useRef, useEffect } from 'react';
import { DATA } from './dataAdapter.js';
import { GridMeshBG } from './Backgrounds.jsx';

function AnimChar({ ch, delay }) {
  return (
    <span className="ch" style={{ animationDelay: `${delay}ms` }}>
      {ch === ' ' ? '\u00A0' : ch}
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
        <div className="hero-status reveal in">
          <span className="dot green" /> {DATA.profile.status}
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>│</span>
          <span className="dot" /> {DATA.profile.role}
        </div>
        <h1 className="hero-name">
          <span className="line">{renderWord('AKASH', 200)}</span>
          <span className="line red">{renderWord('JAMES', 700)}</span>
        </h1>
        <div className="hero-meta">
          <p className="hero-tag reveal in d3">
            <strong>AI systems that ship.</strong> {DATA.profile.tagline}
          </p>
          <div className="hero-location reveal in d4">
            <div>{DATA.profile.location}</div>
            <div className="val">{DATA.profile.tz}</div>
            <div style={{ marginTop: 8 }}>{DATA.profile.role.split(' · ')[0]}</div>
            <div className="val">{DATA.profile.org}</div>
          </div>
        </div>
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
          <div className="kicker">AKASH JAMES · <span className="accent">ON THE CRAFT</span></div>
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
