// The photos while the dev server runs (wired up in vite.config.js).
import { optimizeImages } from '../scripts/encode-photos.js';

// dev server only (npm run build runs scripts/encode-photos.js itself, before vite): photos/ →
// public/photos/ at start, and again whenever a photo in photos/ is added, changed or removed.
// One run at a time; a run that fails is reported and the next change still gets its own run.
export function devPhotos() {
  let queue = Promise.resolve();
  const run = (log) => {
    const job = queue.then(() => optimizeImages({ log }));
    queue = job.catch(() => {});
    return job;
  };
  return {
    name: 'dev-photos',
    apply: 'serve',
    async buildStart() {
      await run((m) => this.info(m));
    },
    configureServer(server) {
      const dir = new URL('../photos/', import.meta.url).pathname;
      server.watcher.add(dir);
      const changed = async (file) => {
        if (!file.startsWith(dir)) return;
        try {
          await run((m) => server.config.logger.info(m));
          server.ws.send({ type: 'full-reload' });
        } catch (err) {
          server.config.logger.error(`images: ${err.message}`);
        }
      };
      server.watcher.on('add', changed).on('change', changed).on('unlink', changed);
    },
  };
}
