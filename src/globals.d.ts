// the GoatCounter script in index.html (visit counts), which src/lib/services/track.js talks to
interface Window {
  goatcounter?: { count(event: { path: string; event: boolean }): void };
}
