// @ts-check
// Svelte action: drift an element vertically as it passes through the viewport.
// `speed` is the share of its distance from the viewport centre it moves by, measured where it
// sits without its own drift (positive lags behind the scroll, negative runs ahead). Pass { speed, media } to limit it to
// a media query, e.g. only where two cards sit side by side.
//
// The hero's forest does this in CSS instead (a scroll-driven animation over the first 1000px of
// the page, see Hero.svelte). These layers sit further down and drift by their own distance from
// the middle of the screen, some nested in others (the living room's window, and the sky and
// the rows of trees inside it), so they are placed by script, on the page's one scroll listener.
import { onScreen, onScrollFrame, reducedMotion } from './viewport.js';

const read = (opts) => (typeof opts === 'number' ? { speed: opts } : opts);

/** @param {HTMLElement | SVGElement} node @param {number | { speed: number, media?: string }} [opts] */
export function parallax(node, opts = 0.06) {
  let speed;
  let mq;
  let offset = 0; // where it has drifted to now
  const configure = (o) => {
    const { speed: s, media } = read(o ?? 0.06);
    speed = s;
    mq = media ? matchMedia(media) : null;
  };
  const move = (to) => {
    offset = to;
    node.style.translate = to ? `0 ${to.toFixed(1)}px` : '';
  };
  const place = () => {
    if (reducedMotion() || (mq && !mq.matches)) return move(0);
    if (!onScreen(node, 200 + Math.abs(offset))) return;
    // measured where it sits without its own drift (but with any drift of a layer it is nested in)
    const r = node.getBoundingClientRect();
    move((r.top - offset + r.height / 2 - innerHeight / 2) * speed);
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
      move(0);
    },
  };
}
