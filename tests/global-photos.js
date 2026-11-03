// before any test runs: the encoded photos and src/photos.json, as npm run build makes them, so
// a fresh checkout can run vitest straight away (the encoder skips photos that are up to date)
import { optimizeImages } from '../scripts/encode-photos.js';

export default async function () {
  await optimizeImages({ log: () => {} });
}
