import { defineConfig, loadEnv } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { seo } from './vite/seo.js';
import { devPhotos } from './vite/dev-photos.js';

export default defineConfig(({ mode }) => {
  const siteUrl = (loadEnv(mode, process.cwd(), '').SITE_URL ?? '').replace(/\/$/, '');
  return {
    // relative URLs throughout, so one build works in any folder: the root of the CDN's domain and
    // marceljager.github.io/cats/ alike
    base: './',
    plugins: [devPhotos(), svelte({ configFile: false }), seo(siteUrl)],
  };
});
