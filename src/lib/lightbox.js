// one lightbox for the whole page (Lightbox.svelte, mounted once in App): any photo lifts off the
// page, springs up big and flies back to where it came from when closed.
//   items:  [{ photo, alt, hint, ratio, caption?, tape? }]  the photos you can step through
//   source: (i) => ({ el, rotate })  the photo on the page that item i flies out of and back into
import { track } from './track.js';

let show = null;

export function setLightbox(fn) {
  show = fn;
}

export function zoom({ items, index = 0, source, opener = null }) {
  show?.({ items, index, source, opener });
  track('foto');
}

// a lone photo (a stop, a cat, the family): its shape and tilt are read off the photo itself
export function zoomPhoto(figure, { photo, alt, hint = '', tape = false }, opener = null) {
  const css = getComputedStyle(figure);
  const ratio = css.getPropertyValue('--ratio').trim() || '4 / 5';
  const rotate = parseFloat(css.getPropertyValue('--tilt')) || 0;
  zoom({ items: [{ photo, alt, hint, ratio, tape }], source: () => ({ el: figure, rotate }), opener });
}
