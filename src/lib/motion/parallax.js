// @ts-check
// Svelte action: drift an element vertically as it passes through the viewport.
// `speed` is the share of its distance from the viewport centre it moves by
// (positive lags behind the scroll, negative runs ahead). Pass { speed, media } to limit it to
// a media query, e.g. only where two cards sit side by side.
//
// The hero's forest does this in CSS instead (a scroll-driven animation over the first 1000px of
// the page, see Hero.svelte). These layers sit further down and drift by their own distance from
// the middle of the screen, some nested in others (the living room's window, and the sky and
// the rows of trees inside it), so they are placed by script, on the page's one scroll listener.
import { onScreen, onScrollFrame, reducedMotion } from './viewport.js';

const read = (opts) => (typeof opts === 'number' ? { speed: opts } : opts);

export function parallax(node, opts = 0.06) {
  if (reducedMotion()) return {};
  let speed;
  let mq;
  const configure = (o) => {
    const { speed: s, media } = read(o);
    speed = s;
    mq = media ? matchMedia(media) : null;
  };
  const place = () => {
    if (mq && !mq.matches) {
      node.style.translate = '';
      return;
    }
    if (!onScreen(node, 200)) return;
    const r = node.getBoundingClientRect();
    const offset = (r.top + r.height / 2 - innerHeight / 2) * speed;
    node.style.translate = `0 ${offset.toFixed(1)}px`;
  };
  configure(opts);
  const stop = onScrollFrame(place);
  place();
  return {
    update(o) {
      configure(o);
      place();
    },
    destroy() {
      stop();
      node.style.translate = '';
    },
  };
}
