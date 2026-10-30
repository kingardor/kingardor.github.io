const API_BASE = import.meta.env.VITE_API_BASE ?? ''

// Promises are created on first import — import this module as early as
// possible (main.jsx) so data is in-flight during the loader window.
export const prefetched = {
  youtube: fetch(`${API_BASE}/api/youtube-feed?d=${Date.now()}`)
    .then(r => (r.ok ? r.json() : null))
    .catch(() => null),
}
