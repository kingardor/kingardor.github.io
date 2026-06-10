import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'top', label: 'HOME' },
  { id: 'career', label: 'CAREER' },
  { id: 'skills', label: 'STACK' },
  { id: 'projects', label: 'WORK' },
  { id: 'videos', label: 'SIGNALS' },
  { id: 'writing', label: 'NOTES' },
  { id: 'honours', label: 'HONOURS' },
  { id: 'contact', label: 'CONTACT' },
];

/**
 * Top-edge minimal chrome: AJ. wordmark, mono section index with live
 * active-state, Ask Veronica. Mobile collapses to wordmark + Ask.
 */
export function TopNav({ onAsk }) {
  const [active, setActive] = useState('top');

  useEffect(() => {
    const els = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(entries => {
      // Pick the most visible intersecting section
      const hit = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (hit) setActive(hit.target.id);
    }, { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.1, 0.5] });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const jump = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="ob-nav" aria-label="Sections">
      <a className="ob-nav-mark" href="#top" onClick={jump('top')}>
        AJ<span className="ob-ember">.</span>
      </a>
      <div className="ob-nav-links mono-ob">
        {SECTIONS.slice(1).map((s, i) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={jump(s.id)}
            className={active === s.id ? 'active' : undefined}
          >
            <span className="ob-nav-num">{String(i + 1).padStart(2, '0')}</span>
            {s.label}
          </a>
        ))}
      </div>
      <div className="ob-nav-actions">
        <button
          className="ob-nav-kbd ob-nav-tour mono-ob"
          onClick={() => window.dispatchEvent(new CustomEvent('ob:tour'))}
          aria-label="Start guided tour"
        >
          ▶ TOUR
        </button>
        <button
          className="ob-nav-kbd mono-ob"
          onClick={() => window.dispatchEvent(new CustomEvent('ob:palette'))}
          aria-label="Open command palette"
        >
          ⌘K
        </button>
        <button className="ob-nav-ask mono-ob" onClick={onAsk}>
          <span className="ob-nav-sigil">V</span>ASK VERONICA
        </button>
      </div>
    </nav>
  );
}
