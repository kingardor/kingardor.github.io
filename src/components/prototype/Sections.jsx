import React, { useRef, useState, useEffect } from 'react';
import { DATA } from './dataAdapter.js';
import { DataRainBG, AuroraBG } from './Backgrounds.jsx';
import MagicBento from './reactbits/MagicBento.jsx';

function SmartThumb({ id, thumb, style }) {
  const initial = id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : (thumb || '');
  const [src, setSrc] = useState(initial);
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style }}
      onLoad={e => { if (id && e.target.naturalWidth <= 120) setSrc(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`); }}
      onError={() => { if (id) setSrc(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`); }}
    />
  );
}

function getYTId(url) {
  return url?.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] || null;
}

export function Career({ bg = { rain: true }, accent = '#ef2b3a' }) {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const barRef = useRef(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const total = DATA.career.length;

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    const isMobile = window.matchMedia('(max-width: 900px)').matches;

    if (isMobile) {
      track.style.transform = 'translateX(0)';
      track.style.flexDirection = 'column';
      track.querySelectorAll('.career-slide').forEach(s => s.style.flex = '0 0 auto');
      return;
    }

    const onScroll = () => {
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const totalPx = rect.height - vh;
      const scrolled = Math.max(0, -rect.top);
      const p = Math.max(0, Math.min(1, scrolled / totalPx));
      const maxShift = (DATA.career.length - 1) * 100;
      track.style.transform = `translateX(-${p * maxShift}vw)`;
      if (barRef.current) barRef.current.style.setProperty('--p', `${p * 100}%`);
      const idx = Math.min(DATA.career.length - 1, Math.floor(p * DATA.career.length + 0.0001));
      setSlideIdx(idx);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="career" ref={wrapRef} id="career" data-screen-label="03 Career" style={{ height: `${total * 100}vh` }}>
      {bg.rain && <DataRainBG accent={accent} />}
      <div className="career-pin">
        <div className="career-head">
          <div>
            <div className="kicker"><span className="accent">CHAPTERS</span> · 2016 → NOW</div>
            <div className="career-title">A brief history<br/>of building.</div>
          </div>
          <div className="career-progress" ref={barRef}>
            <div className="bar" />
          </div>
        </div>
        <div className="career-track" ref={trackRef}>
          {DATA.career.map((r, i) => (
            <div className="career-slide" key={i}>
              <div className="ghost-year">{r.year}</div>
              <div className="career-left">
                <div className="career-num">CH · {r.num}</div>
                <h3 className="career-role">{r.role}</h3>
                <div className="career-org">{r.org}</div>
                <div className="career-period">{r.period}</div>
                <p className="career-blurb">{r.blurb}</p>
                <div className="career-tags">
                  {r.tags.map(t => <span className="career-tag" key={t}>{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Skills() {
  const words = DATA.skillsSentence.split(' ');
  return (
    <section className="skills" id="skills" data-screen-label="04 Skills">
      <div className="wrap">
        <div className="skills-head reveal">
          <div className="kicker"><span className="accent">ARSENAL</span> · 002</div>
          <div className="title">The stack,<br/>spoken aloud.</div>
        </div>
        <p className="skills-sentence reveal">
          {words.map((w, i) => {
            const clean = w.replace(/[.,]/g, '');
            const isKey = DATA.keyWords.includes(clean);
            return <span key={i} className={`word ${isKey ? 'is-key' : ''}`}>{w} </span>;
          })}
        </p>
        <MagicBento
          cards={DATA.skillGroups.map(g => ({
            code: `GRP · ${g.idx}`,
            name: g.name,
            desc: '',
            tags: g.items,
            href: null,
          }))}
          enableStars
          enableSpotlight
          enableBorderGlow
          glowColor="239, 43, 58"
          enableTilt
          clickEffect={false}
          columns={2}
        />
      </div>
    </section>
  );
}

/* Projects accepts an optional `projects` prop that overrides DATA.projects (for live fetch) */
export function Projects({ projects: propProjects }) {
  const projects = propProjects || DATA.projects;
  return (
    <section className="projects" id="projects" data-screen-label="05 Projects">
      <div className="wrap">
        <div className="projects-head reveal">
          <div className="kicker"><span className="accent">MISSION FILES</span> · 003</div>
          <div className="title">Selected<br/>works.</div>
        </div>
        <MagicBento
          cards={projects}
          enableStars
          enableSpotlight
          enableBorderGlow
          glowColor="239, 43, 58"
          enableTilt
          clickEffect
        />
      </div>
    </section>
  );
}

/* Videos accepts an optional `videos` prop that overrides DATA.videos (for live fetch) */
export function Videos({ videos: propVideos }) {
  const videosData = propVideos || DATA.videos;
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const allVideos = [videosData.featured, ...(videosData.strip || [])].filter(Boolean);
  const cur = allVideos[active] || allVideos[0];

  useEffect(() => { setPlaying(false); }, [active]);

  if (!cur) return null;

  const curId = getYTId(cur.url);

  return (
    <section className="videos" id="videos" data-screen-label="06 Videos">
      <div className="wrap">
        <div className="videos-head reveal">
          <div className="kicker"><span className="accent">SIGNALS</span> · 004</div>
          <div className="title">Live from<br/>the workshop.</div>
        </div>
        <div className="crt-stage reveal">
          {playing && curId ? (
            <iframe
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', zIndex: 2 }}
              src={`https://www.youtube.com/embed/${curId}?autoplay=1`}
              title={cur.title || 'YouTube video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              {curId
                ? <SmartThumb key={curId} id={curId} thumb={cur.thumb} />
                : <div className="screen" style={{
                    background:
                      'radial-gradient(circle at 30% 40%, rgba(239,43,58,0.15), transparent 50%),' +
                      'radial-gradient(circle at 70% 60%, rgba(255,77,122,0.15), transparent 50%),' +
                      'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 12px, transparent 12px 24px)'
                  }} />
              }
              <div className="scanlines" />
              <div className="chroma" />
              <div className="hud-overlay">
                <span className="corner tl" /><span className="corner tr" />
                <span className="corner bl" /><span className="corner br" />
              </div>
              <div className="rec">REC · CH {cur.num}</div>
              <div className="play">
                <button
                  className="play-btn hot"
                  onClick={() => curId ? setPlaying(true) : cur.url && window.open(cur.url, '_blank')}
                  aria-label="Play"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', border: 'none', cursor: 'pointer' }}
                >
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M9 6L22 14L9 22V6Z" fill="currentColor"/></svg>
                </button>
              </div>
              {cur.title && <div className="title-bar">{cur.title}</div>}
            </>
          )}
        </div>
        <div className="video-strip">
          {allVideos.map((v, i) => {
            const vId = getYTId(v.url);
            return (
            <button
              key={vId || String(i)}
              className={`video-thumb ${active === i ? 'active' : ''}`}
              onClick={() => setActive(i)}
              style={{ background: 'transparent', padding: 0 }}>
              {vId
                ? <SmartThumb key={vId} id={vId} thumb={v.thumb} />
                : <div className="img" style={{
                    background:
                      `radial-gradient(circle at ${20 + i * 13}% ${30 + i * 11}%, rgba(239,43,58,0.2), transparent 60%),` +
                      'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 6px, transparent 6px 12px)'
                  }} />
              }
              <div className="num">#{v.num}</div>
            </button>
          )})}
        </div>
      </div>
    </section>
  );
}

export function Writing() {
  return (
    <section className="writing" id="writing" data-screen-label="07 Writing">
      <div className="wrap">
        <div className="writing-head reveal">
          <div className="kicker"><span className="accent">FIELD NOTES</span> · 005</div>
          <div className="title">Writing.</div>
        </div>
        <div className="writing-list">
          {DATA.writing.map((w, i) => (
            <a className="writing-row reveal hot" key={i}
               href={w.href || '#'}
               target={w.href ? '_blank' : undefined}
               rel={w.href ? 'noreferrer' : undefined}
               onClick={!w.href ? e => e.preventDefault() : undefined}
               style={{ transitionDelay: `${i * 28}ms` }}>
              <span className="idx">#{w.idx}</span>
              <span className="title-line">{w.title}</span>
              <span className="go">{w.tag} <span>→</span></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Honours() {
  return (
    <section className="honours" id="honours" data-screen-label="08 Honours">
      <div className="wrap">
        <div className="writing-head reveal">
          <div className="kicker"><span className="accent">HONOURS</span> · 006</div>
          <div className="title">Notable.</div>
        </div>
        <div className="honours-grid">
          {DATA.honours.map((h, i) => {
            const Tag = h.href ? 'a' : 'div';
            const linkProps = h.href ? { href: h.href, target: '_blank', rel: 'noreferrer' } : {};
            return (
              <Tag className="honour reveal hot" key={i} style={{ transitionDelay: `${i * 32}ms` }} {...linkProps}>
                <div className="sigil"><span className="star">★</span></div>
                <div className="body">
                  <div className="k">{h.k}</div>
                  <div className="t">{h.t}</div>
                </div>
              </Tag>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── ScrambleText: scrambles into final text when trigger fires ── */
function ScrambleText({ text, className, trigger }) {
  const [display, setDisplay] = useState(text);
  const fired = useRef(false);
  useEffect(() => {
    if (!trigger || fired.current) return;
    fired.current = true;
    const CHARS = '!<>[]{}—_*#$@/\\?ABCDEFGHIJKLMNOPQRSTUVWXYZ01';
    let frame = 0;
    const STEPS = 22;
    const tick = () => {
      setDisplay(
        text.split('').map((ch, i) => {
          if (ch === ' ' || ch === '.') return ch;
          if (i < Math.floor((frame / STEPS) * text.length * 1.4)) return ch;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('')
      );
      frame++;
      if (frame <= STEPS) requestAnimationFrame(tick);
      else setDisplay(text);
    };
    const id = setTimeout(() => requestAnimationFrame(tick), 300);
    return () => clearTimeout(id);
  }, [trigger, text]);
  return <span className={className}>{display}</span>;
}

/* ── TypewriterKicker: types text when visible ── */
function TypewriterKicker({ text }) {
  const [display, setDisplay] = useState('');
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      let i = 0;
      timer = setInterval(() => {
        setDisplay(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(timer);
      }, 38);
    }, { threshold: 0.3 });
    io.observe(el);
    return () => { io.disconnect(); clearInterval(timer); };
  }, [text]);
  return <span ref={ref}>{display}<span className="cursor-blink">▌</span></span>;
}

/* ── MagneticButton: element follows cursor on hover ── */
function MagneticButton({ tag: Tag = 'a', children, className, style, ...props }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.32;
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.32;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ''; };
  return (
    <Tag ref={ref} className={className} style={{ transition: 'transform 0.4s cubic-bezier(.22,1,.36,1)', ...style }}
      onMouseMove={onMove} onMouseLeave={onLeave} {...props}>
      {children}
    </Tag>
  );
}

/* ── ClickSpark: burst of particles on click ── */
function ClickSpark({ children, className, ...props }) {
  const ref = useRef(null);
  const spark = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('span');
      p.className = 'spark-particle';
      const angle = (i / 8) * 360;
      p.style.cssText = `left:${x}px;top:${y}px;--angle:${angle}deg`;
      el.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
    props.onClick?.(e);
  };
  return (
    <div ref={ref} className={`spark-host ${className || ''}`} style={{ position: 'relative', display: 'inline-flex' }}>
      {React.cloneElement(children, { onClick: spark })}
    </div>
  );
}

function OrbVisual() {
  return (
    <div className="orb-container" aria-hidden>
      <div className="orb-ring orb-ring-3" />
      <div className="orb-ring orb-ring-2" />
      <div className="orb-ring orb-ring-1" />
      <div className="orb-core" />
      <span className="orb-data orb-data-1">GPU → PROD</span>
      <span className="orb-data orb-data-2">8 YRS</span>
      <span className="orb-data orb-data-3">3 PLATFORMS</span>
      <span className="orb-data orb-data-4">1 EXIT</span>
    </div>
  );
}

export function Transmission({ onAsk, bg = { aurora: true }, accent = '#ef2b3a' }) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="transmission" id="contact" data-screen-label="09 Contact">
      {bg.aurora && <AuroraBG accent={accent} />}
      <div className="wrap transmission-split">
        <div className="transmission-left">
          <div className="label reveal">
            <TypewriterKicker text="ESTABLISHING TRANSMISSION" />
          </div>
          <h2 className="headline reveal d1">
            Let's build<br/>something<br/>
            <ScrambleText text="outrageous." className="red" trigger={visible} />
          </h2>
          <div className="cta-row reveal d2">
            <ClickSpark>
              <MagneticButton tag="a" className="cta hot" href={`mailto:${DATA.contactEmail}`}>
                <span>OPEN CHANNEL</span>
                <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 11L11 3M11 3H5M11 3V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" fill="none"/></svg>
              </MagneticButton>
            </ClickSpark>
            <MagneticButton tag="button" className="cta ghost hot" onClick={onAsk}
              style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink)', boxShadow: 'none' }}>
              <span>OR ASK VERONICA</span>
            </MagneticButton>
          </div>
        </div>
        <div className="transmission-right reveal d2">
          <OrbVisual />
        </div>
      </div>
      <footer>
        <div className="wrap">© {new Date().getFullYear()} AKASH JAMES · BUILT WITH VERONICA</div>
      </footer>
    </section>
  );
}
