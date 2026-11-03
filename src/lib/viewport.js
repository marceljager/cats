// The window as every moving thing on the page sees it: the reduced-motion setting, whether an
// element is on screen, and one shared scroll listener.

// asked fresh each time, so switching the system setting takes effect without a reload
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// whether any part of `el` is inside the viewport, or within `margin` px of it
export function onScreen(el, margin = 0) {
  const r = el.getBoundingClientRect();
  return r.bottom > -margin && r.top < innerHeight + margin;
}

// One scroll (and resize) listener for the whole page: every subscriber runs at most once per
// animation frame, however many scroll events land in it. Returns the unsubscribe.
const subscribers = new Set();
let raf = 0;

function flush() {
  raf = 0;
  for (const fn of subscribers) fn();
}
function queue() {
  raf ||= requestAnimationFrame(flush);
}

export function onScrollFrame(fn) {
  if (subscribers.size === 0) {
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
  }
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
    if (subscribers.size > 0) return;
    removeEventListener('scroll', queue);
    removeEventListener('resize', queue);
    cancelAnimationFrame(raf);
    raf = 0;
  };
}
