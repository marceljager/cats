import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// the tests run the site's own modules as they are, without vite.config.js's seo and photo plugins
export default defineConfig({
  plugins: [svelte({ configFile: false })],
  // the browser build of svelte, so a test in a browser-like environment can mount components
  resolve: { conditions: ['browser'] },
  test: { include: ['tests/**/*.test.js'], globalSetup: ['tests/global-photos.js'] },
});
