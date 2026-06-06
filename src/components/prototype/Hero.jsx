import { useRef, useEffect, useState } from 'react';
import { DATA } from './dataAdapter.js';
import { GridMeshBG } from './Backgrounds.jsx';
import { CHAT_SUGGESTIONS } from '../../data.js';
import { ElectricBorder } from './ElectricBorder.jsx';
import RotatingText from './reactbits/RotatingText.jsx';
import HeroParticles from './HeroParticles.jsx';

const SEED_KEY = 'chat:seed';

// ── Scroll configuration ─────────────────────────────────────────────────────
const MIN_HOLD_MS      = 1200; // min ms to hold snap before releasing
const INTER_GAP_MS     = 250;  // wheel-event gap that signals a new gesture
const RAMP_MS          = 500;  // ms: animation ramp-up after particle assembly
const VIDEO_FADE_IN    = 0.12; // p: video reaches full opacity
const CONTENT_FADE_OUT = 0.15; // p: hero content fully gone
const CUE_FADE_OUT     = 0.08; // p: scroll cue fades on scroll start
const CUE_FADE_BACK    = 0.88; // p: scroll cue reappears at snap
const REVEAL_START     = 0.72; // p: manifesto reveal begins (also re-arms snap latch)
const REVEAL_END       = 0.92; // p: snap locks here — manifesto fully shown
const REVEAL_RANGE     = REVEAL_END - REVEAL_START;

/** Normalized scroll progress [0,1] for a sticky scroll zone. Returns raw value — callers apply ramp. */
function calcScrollProgress(el) {
  const rect = el.getBoundingClientRect();
  return Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
}

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
  }, [assembled]);

  // Cross-module contract with main.jsx: __resolveHeroVideo is set there and
  // called here when the video is ready to play. main.jsx also installs a 10s safety-release.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const resolve = () => { window.__resolveHeroVideo?.(); window.__resolveHeroVideo = null; };
    if (video.readyState >= 3) { resolve(); return; }
    video.addEventListener('canplaythrough', resolve, { once: true });
    return () => video.removeEventListener('canplaythrough', resolve);
  }, []);

  useEffect(() => {
    const zone      = zoneRef.current;
    const video     = videoRef.current;
    const content   = contentRef.current;
    const scrollCue = scrollCueRef.current;
    const manifesto = manifestoRef.current;
    const photo     = zone?.querySelector('.hero-photo');
    if (!zone || !video) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // iOS won't seek until the video has been activated by a user gesture.
    // Prime it on first touch so currentTime works throughout the scroll.
    let touchPrimed = false;
    const onTouchPrime = () => {
      if (touchPrimed) return;
      touchPrimed = true;
      video.play().then(() => video.pause()).catch(() => {});
    };
    window.addEventListener('touchstart', onTouchPrime, { once: true, passive: true });

    // Seek gating: only one seek in flight at a time; coalesce to the latest target.
    // Without this, rapid scroll fires queue up full-frame decodes on mobile.
    let pendingTime = null;
    const onSeeked = () => {
      if (pendingTime !== null) {
        const t = pendingTime; pendingTime = null;
        video.currentTime = t;
      }
    };
    video.addEventListener('seeked', onSeeked);

    const onScroll = () => {
      if (!assembledRef.current) return;

      const rawP = calcScrollProgress(zone); // rawP: unramped — used for latch re-arm guard below
      const ramp = Math.min(1, (performance.now() - enabledAtRef.current) / RAMP_MS);
      const p = rawP * ramp;

      // Re-arm the snap latch when user scrolls back before the reveal window.
      // Uses rawP (not p) so the guard fires even during the ramp window.
      if (rawP < REVEAL_START) {
        snapDoneRef.current = false;
        snapLockRef.current = false;
        lastWheelRef.current = 0;
      }

      // Drift release: if scroll drifted away from the hold point (keyboard/scrollbar), release
      if (snapLockRef.current && Math.abs(window.scrollY - snapYRef.current) > 4) {
        snapLockRef.current = false;
      }

      if (video.readyState >= 2 && video.duration) {
        const t = p * video.duration;
        if (video.seeking) { pendingTime = t; } else { video.currentTime = t; }
      }

      // Cross-fade from static hero.webp to video
      video.style.opacity = Math.min(1, p / VIDEO_FADE_IN).toFixed(3);

      // Content fades out fast — gone by p=CONTENT_FADE_OUT
      const contentP = Math.max(0, Math.min(1, p / CONTENT_FADE_OUT));
      if (content) {
        content.style.opacity = (1 - contentP).toFixed(3);
        content.style.transform = `translateY(${(contentP * -20).toFixed(1)}px)`;
      }
      if (scrollCue) {
        // Fades out fast on scroll start; returns when parked at snap point
        const fadeOut = 1 - Math.min(1, p / CUE_FADE_OUT);
        const fadeBack = Math.max(0, Math.min(1, (p - CUE_FADE_BACK) / 0.06));
        scrollCue.style.opacity = Math.max(fadeOut, fadeBack).toFixed(3);
      }

      // Manifesto: word-by-word reveal from REVEAL_START to REVEAL_END
      if (manifesto) {
        const words = manifesto.querySelectorAll('.hero-manifesto-word');
        const n = words.length;
        const mP = Math.max(0, Math.min(1, (p - REVEAL_START) / REVEAL_RANGE));
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
          snapYRef.current = zoneTop + totalScrollable2 * REVEAL_END;
          window.scrollTo({ top: snapYRef.current }); // instant — keeps scrollY == snapY
        }
      }

      // As manifesto reveals: blackout photo, darken right half for text contrast.
      const panP = Math.max(0, Math.min(1, (p - REVEAL_START) / REVEAL_RANGE));
      if (photo) {
        if (panP > 0) {
          photo.style.transition = 'none';
          photo.style.opacity = '0';
        } else {
          photo.style.transition = '';
          photo.style.opacity = '';
        }
      }
      if (manifesto) {
        manifesto.style.background = panP > 0
          ? `linear-gradient(to right, transparent 30%, rgba(0,0,0,${(panP * 0.82).toFixed(2)}) 52%)`
          : 'none';
      }

      const eased = 1 - Math.pow(1 - p, 3);
      zone.style.setProperty('--vignette-strength', eased.toFixed(3));
    };

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

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      // Run after the tab compositor is restored, not mid-restore
      requestAnimationFrame(() => {
        const p2 = calcScrollProgress(zone); // no ramp — tab restore should snap to exact frame
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
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('visibilitychange', onVisibility);
      video.removeEventListener('seeked', onSeeked);
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
          src={window.matchMedia('(max-width: 900px)').matches ? '/hero-scroll-mobile.mp4' : '/hero-scroll.mp4'}
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
