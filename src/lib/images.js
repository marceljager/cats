// what scripts/images.js made of each photo (src/photos.json): the widths that exist in AVIF, WebP
// and a JPEG (or PNG) fallback, so <picture> can offer them all and the browser picks one
import photos from '../photos.json';

export const info = (src) => (src ? photos[src] : undefined);

// '/photos/x.jpg' → 'photos/x.jpg', relative to the page (the site is one page at its folder's root),
// so the same build works at a domain's root (behind the CDN) and in a subfolder
// (marceljager.github.io/cats/). Not import.meta.env.BASE_URL: the prerender's server build sets that to '/'
const url = (path) => path.replace(/^\//, '');

// "…-320.avif 320w, …-480.avif 480w, …"; the JPEG fallback comes in fewer widths, and a PNG one
// (a cut-out) in none, so then there's no srcset and the img's own src stands
export function srcset(src, fmt) {
  const p = info(src);
  if (!p) return undefined;
  const widths = fmt ? p.widths : p.fallbackWidths;
  if (!widths.length) return undefined;
  return widths.map((w) => `${url(p.name)}-${w}.${fmt ?? p.fallback} ${w}w`).join(', ');
}

// one file at least `px` wide (or the largest there is): for places without srcset, like SVG <image>
export function pick(src, px, fmt) {
  const p = info(src);
  if (!p) return src && url(src);
  const widths = fmt ? p.widths : p.fallbackWidths;
  if (!widths.length) return `${url(p.name)}.${p.fallback}`;
  const w = widths.find((x) => x >= px) ?? widths.at(-1);
  return `${url(p.name)}-${w}.${fmt ?? p.fallback}`;
}
