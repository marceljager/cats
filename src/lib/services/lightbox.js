// one lightbox for the whole page (Lightbox.svelte, mounted once in App): any photo lifts off the
// page, springs up big and flies back to where it came from when closed.
//   zoom({ items, index, source, opener })
//     items:  [{ photo, alt, hint, ratio, caption?, tape? }]  the photos you can step through
//     source: (i) => ({ el, tilt })  the photo on the page that item i flies out of and back into,
//             and its lean in degrees
//     opener: what gets the focus back once it closes (by default whatever had it)
//   zoomPhoto({ el, photo, alt, hint, ratio, tilt, tape, opener })  a lone photo (a stop, a cat)
import { track } from './track.js';

let show = null;

// Lightbox.svelte hands over its opener when it mounts; until then a click opens nothing, and so
// counts nothing either
export function setLightbox(fn) {
  show = fn;
}

export function zoom({ items, index = 0, source, opener = null }) {
  if (!show) return;
  show({ items, index, source, opener });
  track('foto');
}

export function zoomPhoto({ el, photo, alt, hint = '', ratio = '4 / 5', tilt = 0, tape = false, opener = null }) {
  zoom({ items: [{ photo, alt, hint, ratio, tape }], source: () => ({ el, tilt }), opener });
}
