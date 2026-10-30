/**
 * Maps the shared content module (src/content) to the DATA shape the home
 * sections consume. Content lives in one place; this file only reshapes it.
 */

import {
  CAREER,
  HONOURS,
  PROJECTS,
  WRITING,
  VIDEOS,
  LINKS,
  EMAIL,
  PROFILE,
  STATS,
  MANIFESTO,
  SKILLS,
  SKILLS_SENTENCE,
  KEY_WORDS,
} from '../../content/index.js';

/* ── Career: newest first, the current role is the live chapter ── */
const career = CAREER.map((r, i) => {
  const year = r.current ? 'NOW' : String(r.startYear);
  return {
    num: String(i + 1).padStart(2, '0'),
    role: r.role,
    org: r.org,
    period: r.period,
    year,
    yearShort: year === 'NOW' ? 'NOW' : year.slice(2),
    live: !!r.current,
    blurb: r.blurb,
    tags: r.tags || [],
    capt: r.current ? 'CURRENTLY ORCHESTRATING' : `CHAPTER ${String(i + 1).padStart(2, '0')}`,
  };
});

/* ── Honours ── */
const honours = HONOURS.map(h => ({ k: h.key, t: h.title, href: h.url || null }));

/* ── Projects: curated order, Veronica pinned first ── */
const projects = PROJECTS.slice(0, 6).map((p, i) => ({
  code: `PRJ · ${String(i + 1).padStart(2, '0')}`,
  name: p.name,
  feature: !!p.featured,
  desc: p.desc,
  tags: p.tags.map(t => t.toUpperCase()),
  href: p.href || p.repo,
}));

/* ── Writing ── */
const writing = WRITING.map((p, i) => ({
  idx: String(i + 1).padStart(3, '0'),
  title: p.title,
  tag: 'BLOG',
  href: p.url,
}));

/* ── Videos: static fallback until /api/youtube-feed resolves ── */
const ytThumb = (url) => {
  const m = url?.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return m ? `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` : null;
};
const videos = {
  featured: { num: '01', title: '', url: VIDEOS[0] || null, thumb: ytThumb(VIDEOS[0]) },
  strip: VIDEOS.slice(1).map((url, i) => ({ num: String(i + 2).padStart(2, '0'), title: '', url, thumb: ytThumb(url) })),
};

/* ── Socials ── */
const socials = [
  { k: 'EMAIL',    v: EMAIL,                    href: LINKS.email },
  { k: 'GITHUB',   v: '/kingardor',             href: LINKS.github },
  { k: 'LINKEDIN', v: '/akashjames',            href: LINKS.linkedin },
  { k: 'MEDIUM',   v: 'akash-james.medium.com', href: LINKS.medium },
  { k: 'TWITTER',  v: '@king_ardor',            href: LINKS.twitter },
];

const HUGE = { 'Vision & Edge': 'V', 'Agents & LLMs': 'A', Modeling: 'M', Infra: 'I' };

export const DATA = {
  profile: {
    name: PROFILE.name.toUpperCase(),
    role: PROFILE.role.toUpperCase(),
    org: CAREER[0]?.org || 'BLUE',
    location: PROFILE.location.toUpperCase(),
    tz: PROFILE.tz,
    status: PROFILE.status.toUpperCase(),
    tagline: PROFILE.tagline,
  },
  contactEmail: EMAIL,
  stats: STATS.map(s => ({ ...s, label: s.label.toUpperCase() })),
  manifesto: MANIFESTO,
  skillsSentence: SKILLS_SENTENCE,
  keyWords: KEY_WORDS,
  skillGroups: SKILLS.groups.map((g, i) => ({
    idx: String(i + 1).padStart(2, '0'),
    name: g.name,
    items: g.items,
    huge: HUGE[g.name] || g.name[0],
  })),
  career,
  honours,
  projects,
  videos,
  writing,
  socials,
};
