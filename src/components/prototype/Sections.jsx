import { useRef, useState, useEffect } from 'react';
import { DATA } from './dataAdapter.js';
import { DataRainBG, AuroraBG } from './Backgrounds.jsx';

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
            <span>{String(slideIdx + 1).padStart(2,'0')} / {String(total).padStart(2,'0')}</span>
            <div className="bar" />
            <span>SCRUB</span>
          </div>
        </div>
        <div className="career-track" ref={trackRef}>
          {DATA.career.map((r, i) => (
            <div className="career-slide" key={i}>
              <div className="ghost-year">{r.yearShort}</div>
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
              <div className="career-right">
                <div className="career-frame">
                  <span className="corner-target tl" />
                  <span className="corner-target tr" />
                  <span className="corner-target bl" />
                  <span className="corner-target br" />
                  {r.live
                    ? <span className="label live">LIVE · TRANSMITTING</span>
                    : <span className="label">ARCHIVE · CLASSIFIED</span>}
                  <div className="stripes" />
                  <div className="caption">{r.capt}</div>
                  <div className="big-year"><span>{r.year}</span></div>
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
          <div>
            <div className="kicker"><span className="accent">ARSENAL</span> · 002</div>
            <div className="title">The stack,<br/>spoken aloud.</div>
          </div>
        </div>
        <p className="skills-sentence reveal">
          {words.map((w, i) => {
            const clean = w.replace(/[.,]/g, '');
            const isKey = DATA.keyWords.includes(clean);
            return <span key={i} className={`word ${isKey ? 'is-key' : ''}`}>{w} </span>;
          })}
        </p>
        <div className="skills-grid">
          {DATA.skillGroups.map((g, i) => (
            <div className="skill-cell reveal" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="bar" />
              <div className="idx">GRP · {g.idx}</div>
              <div className="name">{g.name}</div>
              <div className="items">
                {g.items.map(it => <span className="chip" key={it}>{it}</span>)}
              </div>
              <div className="huge">{g.huge}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Projects accepts an optional `projects` prop that overrides DATA.projects (for live fetch) */
export function Projects({ projects: propProjects }) {
  const projects = propProjects || DATA.projects;
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <section className="projects" id="projects" data-screen-label="05 Projects">
      <div className="wrap">
        <div className="projects-head reveal">
          <div>
            <div className="kicker"><span className="accent">MISSION FILES</span> · 003</div>
            <div className="title">Selected<br/>works.</div>
          </div>
          <div className="caption">CLICK TO OPEN<br/>{projects.length} CLASSIFIED</div>
        </div>
        <div className="projects-grid">
          {projects.map((p, i) => (
            <a className={`project-card ${p.feature ? 'feature' : ''} reveal`} key={i}
               onMouseMove={onMove}
               href={p.href || '#'}
               target={p.href && !p.href.startsWith('#') ? '_blank' : undefined}
               rel={p.href && !p.href.startsWith('#') ? 'noreferrer' : undefined}
               onClick={!p.href || p.href === '#' ? e => e.preventDefault() : undefined}
               style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="code">{p.code}{p.feature && ' · FEATURED'}</div>
              <div className="name">{p.name}</div>
              {p.feature && (
                <div className="preview">
                  <span className="badge">VERONICA · AGENT ONLINE</span>
                </div>
              )}
              <div className="desc">{p.desc}</div>
              <div className="tags">
                {(p.tags || []).map(t => <span className="tag" key={t}>{t}</span>)}
              </div>
              <div className="open">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square"/></svg>
              </div>
              <div className="meter" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Videos accepts an optional `videos` prop that overrides DATA.videos (for live fetch) */
export function Videos({ videos: propVideos }) {
  const videosData = propVideos || DATA.videos;
  const [active, setActive] = useState(0);
  const allVideos = [videosData.featured, ...(videosData.strip || [])].filter(Boolean);
  const cur = allVideos[active] || allVideos[0];
  if (!cur) return null;
  return (
    <section className="videos" id="videos" data-screen-label="06 Videos">
      <div className="wrap">
        <div className="videos-head reveal">
          <div>
            <div className="kicker"><span className="accent">SIGNALS</span> · 004</div>
            <div className="title">Live from<br/>the workshop.</div>
          </div>
          <div className="meta">AKASH JAMES · YOUTUBE</div>
        </div>
        <div className="crt-stage reveal hot">
          <div className="screen" style={{
            background:
              'radial-gradient(circle at 30% 40%, rgba(239,43,58,0.15), transparent 50%),' +
              'radial-gradient(circle at 70% 60%, rgba(255,77,122,0.15), transparent 50%),' +
              'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 12px, transparent 12px 24px)'
          }} />
          <div className="scanlines" />
          <div className="chroma" />
          <div className="hud-overlay">
            <span className="corner tl" /><span className="corner tr" />
            <span className="corner bl" /><span className="corner br" />
          </div>
          <div className="rec">REC · CH {cur.num}</div>
          <div className="play">
            <a
              className="play-btn"
              href={cur.url || '#'}
              target={cur.url ? '_blank' : undefined}
              rel={cur.url ? 'noreferrer' : undefined}
              aria-label="Play"
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M9 6L22 14L9 22V6Z" fill="currentColor"/></svg>
            </a>
          </div>
          <div className="title-bar">{cur.title}</div>
        </div>
        <div className="video-strip">
          {allVideos.map((v, i) => (
            <button
              key={i}
              className={`video-thumb ${active === i ? 'active' : ''}`}
              onClick={() => setActive(i)}
              style={{ background: 'transparent', padding: 0 }}>
              {v.thumb
                ? <div className="img" style={{ backgroundImage: `url(${v.thumb})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                : <div className="img" style={{
                    background:
                      `radial-gradient(circle at ${20 + i * 13}% ${30 + i * 11}%, rgba(239,43,58,0.2), transparent 60%),` +
                      'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 6px, transparent 6px 12px)'
                  }} />
              }
              <div className="num">#{v.num}</div>
            </button>
          ))}
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
          <div>
            <div className="kicker"><span className="accent">FIELD NOTES</span> · 005</div>
            <div className="title">Writing.</div>
          </div>
          <div className="kicker">FROM THE <span className="accent">BLOG</span></div>
        </div>
        <div className="writing-list">
          {DATA.writing.map((w, i) => (
            <a className="writing-row reveal hot" key={i}
               href={w.href || '#'}
               target={w.href ? '_blank' : undefined}
               rel={w.href ? 'noreferrer' : undefined}
               onClick={!w.href ? e => e.preventDefault() : undefined}
               style={{ transitionDelay: `${i * 50}ms` }}>
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
          <div>
            <div className="kicker"><span className="accent">HONOURS</span> · 006</div>
            <div className="title">Notable.</div>
          </div>
        </div>
        <div className="honours-grid">
          {DATA.honours.map((h, i) => (
            <div className="honour reveal" key={i} style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="sigil"><span className="star">★</span></div>
              <div className="body">
                <div className="k">{h.k}</div>
                <div className="t">{h.t}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Transmission({ onAsk, bg = { aurora: true }, accent = '#ef2b3a' }) {
  return (
    <section className="transmission" id="contact" data-screen-label="09 Contact">
      {bg.aurora && <AuroraBG accent={accent} />}
      <div className="wrap transmission-inner">
        <div className="label reveal">ESTABLISHING TRANSMISSION</div>
        <h2 className="headline reveal d1">
          Let's build<br/>something<br/>
          <span className="red">outrageous.</span>
        </h2>
        <div className="reveal d2" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a className="cta hot" href={`mailto:${DATA.contactEmail}`}>
            <span>OPEN CHANNEL</span>
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 11L11 3M11 3H5M11 3V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" fill="none"/></svg>
          </a>
          <button className="cta hot" onClick={onAsk}
            style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink)', boxShadow: 'none' }}>
            <span>OR ASK VERONICA</span>
          </button>
        </div>
        <div className="socials reveal d3">
          {DATA.socials.map((s, i) => (
            <a key={i}
               href={s.href || '#'}
               target={s.href && !s.href.startsWith('mailto') ? '_blank' : undefined}
               rel={s.href && !s.href.startsWith('mailto') ? 'noreferrer' : undefined}
               className="hot">{s.k} · {s.v}</a>
          ))}
        </div>
      </div>
      <footer>
        <div className="wrap">© {new Date().getFullYear()} AKASH JAMES · BUILT WITH VERONICA</div>
      </footer>
    </section>
  );
}
