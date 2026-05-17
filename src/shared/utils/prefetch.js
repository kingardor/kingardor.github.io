import { fetchGithubProjects } from './fetchGithubProjects.js'

const API_BASE = 'https://veronica-proxy-vercel.vercel.app'

// Promises are created on first import — import this module as early as
// possible (main.jsx) so data is in-flight during the loader window.
export const prefetched = {
  github: fetchGithubProjects('kingardor', 6),
  youtube: fetch(`${API_BASE}/api/youtube-feed?d=${Date.now()}`)
    .then(r => (r.ok ? r.json() : null))
    .catch(() => null),
}
