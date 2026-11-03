// Svelte action: drift an element vertically as it passes through the viewport.
// `speed` is the share of its distance from the viewport centre it moves by
// (positive lags behind the scroll, negative runs ahead). Pass { speed, media } to limit it to
// a media query, e.g. only where two cards sit side by side. One shared scroll listener.
const items = new Set();
let raf = 0;
let reduce = false;

function frame() {
  raf = 0;
  const mid = innerHeight / 2;
  for (const it of items) {
    if (it.mq && !it.mq.matches) {
      it.node.style.translate = '';
      continue;
    }
    const r = it.node.getBoundingClientRect();
    if (r.bottom < -200 || r.top > innerHeight + 200) continue;
    const offset = (r.top + r.height / 2 - mid) * it.speed;
    it.node.style.translate = `0 ${offset.toFixed(1)}px`;
  }
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(frame);
}

export function parallax(node, opts = 0.06) {
  if (typeof window === 'undefined') return;
  reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  const { speed, media } = typeof opts === 'number' ? { speed: opts } : opts;
  const it = { node, speed, mq: media ? matchMedia(media) : null };
  if (items.size === 0) {
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
  }
  items.add(it);
  schedule();
  return {
    update(o) {
      it.speed = typeof o === 'number' ? o : o.speed;
      schedule();
    },
    destroy() {
      items.delete(it);
      node.style.translate = '';
      if (items.size === 0) {
        removeEventListener('scroll', schedule);
        removeEventListener('resize', schedule);
      }
    },
  };
}
