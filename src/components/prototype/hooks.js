import { useEffect } from 'react';

/**
 * Reveal-on-scroll: adds .in to .reveal elements as they intersect.
 * Pass deps for content that re-renders after async fetches (projects,
 * videos) so late-mounted rows get observed too.
 */
export function useReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(e => e.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((ents) => {
      ents.forEach(ent => {
        if (ent.isIntersecting) {
          ent.target.classList.add('in');
          io.unobserve(ent.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach(e => io.observe(e));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
