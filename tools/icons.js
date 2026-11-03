// public/apple-touch-icon.png (iOS home screen, which doesn't take SVG) from public/favicon.svg
//   npm run icons
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const at = (p) => fileURLToPath(new URL(`../public/${p}`, import.meta.url));

// a 180×180 PNG of the SVG icon; iOS rounds the corners itself, so the square is filled edge to
// edge in the page's night blue (no transparent corners)
export function touchIcon(svg, out) {
  return sharp(svg, { density: ((72 * 180) / 64) * 2 })
    .resize(180, 180)
    .flatten({ background: '#10233a' })
    .png({ compressionLevel: 9 })
    .toFile(out);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await touchIcon(at('favicon.svg'), at('apple-touch-icon.png'));
  console.log('icons: wrote public/apple-touch-icon.png');
}
