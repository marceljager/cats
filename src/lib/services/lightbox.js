// @ts-check
// one lightbox for the whole page (Lightbox.svelte, mounted once in App): any photo lifts off the
// page, springs up big and flies back to where it came from when closed.
import { track } from './track.js';

/**
 * @typedef {{ photo: string | null, alt: string, hint: string, ratio: string, caption?: string, tape?: boolean }} LightboxItem
 *   one photo you can step through; ratio like '4 / 5'
 * @typedef {{ el: HTMLElement, tilt: number, img?: HTMLImageElement | null }} LightboxSource
 *   the photo on the page an item flies out of and back into, its lean in degrees, and its <img>
 *   (shown blurred while the big file loads)
 * @typedef {{ items: LightboxItem[], index?: number, source: (i: number) => LightboxSource, opener?: HTMLElement | null }} LightboxRequest
 *   opener gets the focus back once it closes (by default whatever had it)
 */

/** @type {((request: LightboxRequest) => void) | null} */
let show = null;

// Lightbox.svelte hands over its opener when it mounts and takes it back when it goes; without
// one a click opens nothing, and so counts nothing either. Returns the unregister.
/** @param {(request: LightboxRequest) => void} fn */
export function setLightbox(fn) {
  show = fn;
  return () => {
    if (show === fn) show = null;
  };
}

/** @param {LightboxRequest} request */
export function zoom({ items, index = 0, source, opener = null }) {
  if (!show) return;
  show({ items, index, source, opener });
  track('foto');
}

// a lone photo (a stop, a cat)
/** @param {{ el: HTMLElement, img?: HTMLImageElement | null, photo: string | null, alt: string, hint?: string, ratio?: string, tilt?: number, tape?: boolean, opener?: HTMLElement | null }} photo */
export function zoomPhoto({ el, img = null, photo, alt, hint = '', ratio = '4 / 5', tilt = 0, tape = false, opener = null }) {
  zoom({ items: [{ photo, alt, hint, ratio, tape }], source: () => ({ el, tilt, img }), opener });
}
