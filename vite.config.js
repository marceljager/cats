import { defineConfig, loadEnv } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { seo } from './vite/seo.js';
import { devPhotos } from './vite/dev-photos.js';

// the site's address and Instagram account aren't in the repo: SITE_URL and SITE_INSTAGRAM come from
// .env or the environment (GitHub Actions variables), see contactFrom in src/content.js
const envPrefix = ['VITE_', 'SITE_'];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), envPrefix);
  return {
    // relative URLs throughout, so one build works in any folder: the root of the CDN's domain and
    // marceljager.github.io/cats/ alike
    base: './',
    envPrefix,
    plugins: [devPhotos(), svelte({ configFile: false }), seo(env)],
  };
});
