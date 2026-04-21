import { useState, useEffect } from 'react';

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
