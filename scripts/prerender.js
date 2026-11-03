// after `vite build`: renders the page with the server build and writes the HTML into dist/index.html,
// so the story is readable without JavaScript (crawlers, link previews); the browser then hydrates it
import { readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ssrDir = new URL('../.ssr/', import.meta.url);
const distDir = new URL('../dist/', import.meta.url);
const indexFile = new URL('index.html', distDir);
const APP = '<div id="app"></div>';

// the built page with the rendered head and body put in
export function fill(html, { head, body }) {
  if (!html.includes(APP)) throw new Error(`dist/index.html has no empty ${APP} to fill`);
  return html.replace('</head>', `${head}</head>`).replace(APP, `<div id="app">${body}</div>`);
}

// the site is the landing page alone: no other page (the dev-only kit.html review page
// included) may end up in the upload
export function checkOnlyIndex(files) {
  const pages = files.filter((f) => /\.html?$/i.test(f));
  if (pages.join() !== 'index.html') throw new Error(`dist/ must hold only index.html, found: ${pages.join(', ')}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { default: render } = await import(new URL('entry-server.js', ssrDir).href);
  await writeFile(indexFile, fill(await readFile(indexFile, 'utf8'), render()));
  await rm(ssrDir, { recursive: true });
  checkOnlyIndex(await readdir(distDir, { recursive: true }));
  console.log('prerendered dist/index.html');
}
