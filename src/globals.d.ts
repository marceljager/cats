// the GoatCounter script in index.html (visit counts), which src/lib/services/track.js talks to
interface Window {
  goatcounter?: { count(event: { path: string; event: boolean }): void };
}

// the build's SITE_ variables (envPrefix in vite.config.js), read by contactFrom in src/content.js
interface ImportMetaEnv {
  readonly SITE_URL?: string;
  readonly SITE_INSTAGRAM?: string;
}
