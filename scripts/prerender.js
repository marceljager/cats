// after `vite build`: renders the page with the server build and writes the HTML into dist/index.html,
// so the story is readable without JavaScript (crawlers, link previews); the browser then hydrates it
import { readdir, readFile, writeFile, rm } from 'node:fs/promises';

const ssrDir = new URL('../.ssr/', import.meta.url);
const indexFile = new URL('../dist/index.html', import.meta.url);

const { default: render } = await import(new URL('entry-server.js', ssrDir));
const { head, body } = render();

const html = await readFile(indexFile, 'utf8');
if (!html.includes('<div id="app"></div>')) throw new Error('dist/index.html has no empty <div id="app"></div> to fill');

await writeFile(indexFile, html.replace('</head>', `${head}</head>`).replace('<div id="app"></div>', `<div id="app">${body}</div>`));
await rm(ssrDir, { recursive: true });

// the site is the landing page alone: no other page (the dev-only kit.html review page
// included) may end up in the upload
const pages = (await readdir(new URL('../dist/', import.meta.url), { recursive: true })).filter((f) => /\.html?$/i.test(f));
if (pages.join() !== 'index.html') throw new Error(`dist/ must hold only index.html, found: ${pages.join(', ')}`);
console.log('prerendered dist/index.html');
