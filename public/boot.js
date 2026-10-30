// Runs before the app bundle. Timestamp lets main.jsx hold the loader for its
// minimum time; the pageshow reload handles bfcache restores (back nav on
// mobile) where the loader was already removed.
window.__LOADER_START = Date.now();
window.addEventListener('pageshow', function (e) { if (e.persisted) location.reload(); });
