// hand-drawn replacements: an SVG, PNG or WebP in src/drawings named by its number on drawings.html
// (e.g. "M8-krava.webp") takes the place of that piece; anything without one stays drawn in code.
// boxes.json is written by the template export: where each piece's canvas sits in the piece's own
// coordinates, so a drawing made on that canvas lands exactly where the old piece was.
import boxes from '../drawings/boxes.json';

const files = import.meta.glob('../drawings/*.{svg,png,webp}', { eager: true, import: 'default' });
const art = {};
for (const [path, url] of Object.entries(files)) {
  const id = path.split('/').pop().split(/[-.]/)[0].toUpperCase();
  if (boxes[id]) art[id] = { ...boxes[id], url };
}

export const drawn = (id) => art[id];
