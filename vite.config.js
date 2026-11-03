import { defineConfig, loadEnv } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { seo } from './scripts/seo.js';
import { images } from './scripts/dev-photos.js';

export default defineConfig(({ mode }) => {
  const siteUrl = (loadEnv(mode, process.cwd(), '').SITE_URL ?? '').replace(/\/$/, '');
  return {
    // relative URLs throughout, so one build works in any folder: the root of the CDN's domain and
    // marceljager.github.io/cats/ alike
    base: './',
    plugins: [images(), svelte({ configFile: false }), seo(siteUrl)],
  };
});
