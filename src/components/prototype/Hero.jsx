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
  const zoneRef        = useRef(null);
  const videoRef       = useRef(null);
  const contentRef     = useRef(null);
  const scrollCueRef   = useRef(null);
  const manifestoRef   = useRef(null);
  const assembledRef   = useRef(false);
  const enabledAtRef   = useRef(0);
  const snapDoneRef    = useRef(false); // latch: snap fired this pass; cleared when rawP < 0.72
  const snapLockRef    = useRef(false); // true while actively holding position
  const snapYRef       = useRef(0);    // the locked scroll Y
  const snapAtRef      = useRef(0);    // timestamp when snap fired
  const lastWheelRef   = useRef(0);    // timestamp of most recent wheel event during hold

  const scrollTo = (id) => () => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  const renderWord = (word, startDelay, cls = '') => (
    <span className={`word ${cls}`}>
      {[...word].map((c, i) => <AnimChar key={i} ch={c} delay={startDelay + i * 22} />)}
    </span>
  );

  useEffect(() => {
    assembledRef.current = assembled;
    if (assembled) enabledAtRef.current = performance.now();
    // Mobile: play video on loop after particle assembly completes
    if (assembled && window.matchMedia('(max-width: 900px)').matches && videoRef.current) {
      const v = videoRef.current;
      v.loop = true;
      v.style.opacity = '1';
      v.play().catch(() => {});
    }
  }, [assembled]);

  useEffect(() => {
    const zone      = zoneRef.current;
    const video     = videoRef.current;
    const content   = contentRef.current;
    const scrollCue = scrollCueRef.current;
    const manifesto = manifestoRef.current;
    if (!zone || !video) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    if (prefersReduced || isMobile) return;

    const onScroll = () => {
      if (!assembledRef.current) return;

      const rect = zone.getBoundingClientRect();
      const vh   = window.innerHeight;
      const totalScrollable = rect.height - vh;
      const scrolled = Math.max(0, -rect.top);
      const rawP = Math.max(0, Math.min(1, scrolled / totalScrollable));

      const ramp = Math.min(1, (performance.now() - enabledAtRef.current) / 500);
      const p = rawP * ramp;

      // Re-arm the snap latch when user scrolls back before the reveal window
      if (rawP < 0.72) {
        snapDoneRef.current = false;
        snapLockRef.current = false;
        lastWheelRef.current = 0;
      }

      // Drift release: if scroll drifted away from the hold point (keyboard/scrollbar), release
      if (snapLockRef.current && Math.abs(window.scrollY - snapYRef.current) > 4) {
        snapLockRef.current = false;
      }

      if (video.readyState >= 2 && video.duration) {
        video.currentTime = p * video.duration;
      }

      // Cross-fade from static hero.webp to video
      video.style.opacity = Math.min(1, p / 0.12).toFixed(3);

      // Content fades out fast — gone by p=0.15
      const contentP = Math.max(0, Math.min(1, p / 0.15));
      if (content) {
        content.style.opacity = (1 - contentP).toFixed(3);
        content.style.transform = `translateY(${(contentP * -20).toFixed(1)}px)`;
      }
      if (scrollCue) {
        // Fades out fast on scroll start; returns when parked at snap point
        const fadeOut = 1 - Math.min(1, p / 0.08);
        const fadeBack = Math.max(0, Math.min(1, (p - 0.88) / 0.06));
        scrollCue.style.opacity = Math.max(fadeOut, fadeBack).toFixed(3);
      }

      // Manifesto: word-by-word reveal from p=0.72 to p=0.92
      if (manifesto) {
        const words = manifesto.querySelectorAll('.hero-manifesto-word');
        const n = words.length;
        const mP = Math.max(0, Math.min(1, (p - 0.72) / 0.20));
        words.forEach((w, i) => {
          const wP = Math.max(0, Math.min(1, mP * n - i));
          w.style.opacity = wP.toFixed(3);
          w.style.transform = `translateY(${((1 - wP) * 10).toFixed(1)}px)`;
        });

        // Snap to manifesto: fire once per pass (snapDoneRef guards re-fire)
        if (mP >= 1 && !snapDoneRef.current) {
          snapDoneRef.current = true;
          snapLockRef.current = true;
          snapAtRef.current = performance.now();
          lastWheelRef.current = performance.now(); // treat snap moment as last-event baseline
          const zoneTop = window.scrollY + zone.getBoundingClientRect().top;
          const totalScrollable2 = zone.offsetHeight - window.innerHeight;
          snapYRef.current = zoneTop + totalScrollable2 * 0.92;
          window.scrollTo({ top: snapYRef.current }); // instant — keeps scrollY == snapY
        }
      }

      const eased = 1 - Math.pow(1 - p, 3);
      zone.style.setProperty('--vignette-strength', eased.toFixed(3));
    };

    // MIN_HOLD: hard floor — no release possible before this elapsed since snap
    // INTER_GAP: gap between consecutive wheel events that indicates fresh gesture
    // (macOS trackpad inertia fires <100ms apart while flowing; a new gesture has a clear pause)
    const MIN_HOLD_MS   = 1200;
    const INTER_GAP_MS  = 250;

    const onWheel = (e) => {
      if (!snapLockRef.current) return;

      const now = performance.now();

      // Always hard-stop regardless of speed or timing
      e.preventDefault();
      window.scrollTo({ top: snapYRef.current });

      const sinceSnap = now - snapAtRef.current;
      const sinceLast = now - lastWheelRef.current;

      // Release only when: minimum hold elapsed AND this event arrived after a clear gap
      if (sinceSnap >= MIN_HOLD_MS && sinceLast >= INTER_GAP_MS) {
        snapLockRef.current = false;
        lastWheelRef.current = 0;
        return;
      }

      lastWheelRef.current = now;
    };

    // Touch: absorb all moves while locked; touchend marks gesture over; touchstart = new gesture
    const onTouchStart = (e) => {
      if (!snapLockRef.current) return;
      const sinceSnap = performance.now() - snapAtRef.current;
      if (sinceSnap >= MIN_HOLD_MS) {
        snapLockRef.current = false;
      }
    };
    const onTouchMove = (e) => {
      if (!snapLockRef.current) return;
      e.preventDefault();
    };
    const onTouchEnd = () => {};

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      // Run after the tab compositor is restored, not mid-restore
      requestAnimationFrame(() => {
        const rect2 = zone.getBoundingClientRect();
        const scrolled2 = Math.max(0, -rect2.top);
        const p2 = Math.max(0, Math.min(1, scrolled2 / (rect2.height - window.innerHeight)));
        const target = p2 * (video.duration || 0);
        // play() wakes the decoder the browser evicted while backgrounded;
        // pause() + reseek locks it back to the exact scroll frame.
        // A same-value currentTime assignment is a browser no-op — this forces a real decode.
        video.play()
          .then(() => { video.pause(); video.currentTime = target; })
          .catch(() => { video.currentTime = target + 0.0001; }); // fallback: nudge forces seek
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <section className="hero" id="top" data-screen-label="01 Hero"
             ref={zoneRef} style={{ height: '400vh' }}>
      <div className="hero-pin">
        {bg.grid && <GridMeshBG accent={accent} />}
        <HeroParticles onAssembled={() => setAssembled(true)} />
        {/* Static photo: handles particle reveal, remains as base layer */}
        <div className={`hero-photo with-particles${assembled ? ' assembled' : ''}`} />
        {/* Video: fades in over static photo as scroll begins (JS-controlled) */}
        <video
          ref={videoRef}
          className="hero-video"
          src="/hero-scroll.mp4"
          muted
          playsInline
          preload="auto"
        />
        <div className="wrap hero-content" ref={contentRef}>
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
        <button className="hero-scroll hot" ref={scrollCueRef} onClick={scrollTo('career')}
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

        <div className="hero-manifesto-overlay" ref={manifestoRef} aria-hidden="true">
          <div className="hero-manifesto-label hero-manifesto-word">MANIFESTO · 001</div>
          <p className="hero-manifesto-text">
            {DATA.manifesto.flatMap((w, i) => [
              <span key={i} className={`hero-manifesto-word${w.accent ? ' hi-accent' : ''}`}>{w.txt}</span>,
              ' ',
            ])}
          </p>
        </div>
      </div>
    </section>
  );
}

export function Marquee() {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const BASE = 2.5;  // px/frame base speed (~150 px/s at 60 fps)
    const MAX  = 28;   // cap on drag-added velocity
    const FRIC = 0.93; // velocity decay per frame (after release)

    let pos = 0, vel = 0, raf, halfW = 0;
    const measure = () => { halfW = track.scrollWidth / 2; };
    measure();

    track.style.animation = 'none'; // JS owns the motion now

    let active = false;
    raf = requestAnimationFrame(function tick() {
      pos -= Math.max(0, BASE + vel);
      if (pos <= -halfW) pos += halfW;
      track.style.transform = `translateX(${pos}px)`;
      // Only apply friction after release — finger-down keeps exact drag speed
      if (!active) {
        vel *= FRIC;
        if (Math.abs(vel) < 0.03) vel = 0;
      }
      raf = requestAnimationFrame(tick);
    });

    // Pointer/touch tracking — swipe left boosts speed, swipe right slows it
    let px = 0, pt = 0;
    const onDown  = (e) => { active = true; px = e.clientX; pt = performance.now(); };
    const onMove  = (e) => {
      if (!active) return;
      const now = performance.now(), dt = now - pt;
      if (dt < 1) return;
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
