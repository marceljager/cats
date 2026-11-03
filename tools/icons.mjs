// public/apple-touch-icon.png (iOS home screen, which doesn't take SVG) from public/favicon.svg
//   node tools/icons.mjs
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const at = (p) => fileURLToPath(new URL(`../public/${p}`, import.meta.url));
// iOS rounds the corners itself, so the square is filled edge to edge (no transparent corners)
await sharp(at('favicon.svg'), { density: 72 * 180 / 64 * 2 })
  .resize(180, 180)
  .flatten({ background: '#10233a' })
  .png({ compressionLevel: 9 })
  .toFile(at('apple-touch-icon.png'));
console.log('icons: wrote public/apple-touch-icon.png');
