// The site's own Vite plugins (wired up in vite.config.js): seo() for everything search engines and
// link previews read, images() for the photos while the dev server runs.
import { site, cats, stops, vet, contact } from '../src/content.js';
import { optimizeImages } from './images.js';

// What search engines, link previews and AI assistants get, all from content.js: the title and
// description (put into index.html), Open Graph tags, JSON-LD, llms.txt, robots.txt and, with an
// address, the canonical link, og:image, ai-catalog.json and sitemap.xml.
// siteUrl (SITE_URL in .env or the environment, e.g. https://velikapolly.cz) turns on everything
// that needs an absolute address.
export function seo(siteUrl) {
  const { name, title, description, story } = site;
  const abs = (path) => siteUrl + path;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: story,
    inLanguage: 'cs',
    ...(siteUrl && { url: abs('/'), image: abs('/og.png') }),
    about: cats.map((c) => ({ '@type': 'Thing', name: c.name, alternateName: c.namedAfter, description: c.says })),
  };

  const llms = [
    `# ${name}`,
    '',
    `> ${story}`,
    '',
    'Jednostránkový web, kde dvě zachráněná koťata (sourozenci, kluk a holka) hledají nový domov v Česku. Vyprávějí sama za sebe.',
    '',
    '## Koťata',
    '',
    ...cats.map((c) => `- ${c.name} (${c.namedAfter}): ${c.sex}, ${c.age}${c.neutered ? ', vykastrovaný' : ''}. ${c.says}`),
    '- Ideálně spolu, odděleně je to ale taky možné.',
    '',
    '## Cesta',
    '',
    ...stops.map((s) => `- ${s.place} (${s.country}, ${s.km} km): ${s.title}. ${s.story.join(' ')}`),
    '',
    '## Zdraví',
    '',
    `- ${vet.verdict}`,
    ...vet.visits.map((v) => `- ${v.title} (${v.who}): ${v.done.join(', ')}`),
    '',
    '## Kontakt',
    '',
    `- E-mail: ${contact.email}`,
    ...(contact.placeholder ? [] : [`- Instagram: https://instagram.com/${contact.instagram}`]),
    ...(siteUrl ? ['', '## Stránky', '', `- [${name}](${abs('/')}): celý příběh, fotky a kontakt`] : []),
    '',
  ].join('\n');

  const host = siteUrl && new URL(siteUrl).hostname.replaceAll('.', '-');
  const catalog = {
    specVersion: '1.0',
    entries: [
      {
        identifier: `urn:air:${host}:velik-a-polly`,
        displayName: name,
        type: 'text/html',
        url: abs('/'),
        representativeQueries: ['Která koťata v Praze hledají domov?', 'Jak adoptovat Velíka a Polly?'],
      },
      {
        identifier: `urn:air:${host}:llms-txt`,
        displayName: `${name} (text pro AI)`,
        type: 'text/markdown',
        url: abs('/llms.txt'),
        representativeQueries: ['Kolik je Velíkovi a Polly let a jsou zdraví?', 'Odkud koťata Velík a Polly pocházejí?'],
      },
    ],
  };

  // everyone may crawl; the noindex meta (not robots.txt) keeps the page out of results while the
  // contacts are placeholders, since a blocked page can't show crawlers that meta
  const robots = ['User-agent: *', 'Allow: /', ...(siteUrl ? ['', `Sitemap: ${abs('/sitemap.xml')}`] : []), ''].join('\n');
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <url><loc>${abs('/')}</loc></url>`,
    '</urlset>',
    '',
  ].join('\n');

  const files = {
    'llms.txt': ['text/markdown; charset=utf-8', llms],
    'robots.txt': ['text/plain; charset=utf-8', robots],
    ...(siteUrl && { '.well-known/ai-catalog.json': ['application/json', JSON.stringify(catalog, null, 2) + '\n'] }),
    ...(siteUrl && { 'sitemap.xml': ['application/xml', sitemap] }),
  };

  return {
    name: 'seo',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (!ctx.filename.endsWith('/index.html')) return;
        const meta = (property, content) => ({ tag: 'meta', attrs: { property, content }, injectTo: 'head' });
        return [
          { tag: 'title', children: title, injectTo: 'head' },
          { tag: 'meta', attrs: { name: 'description', content: description }, injectTo: 'head' },
          // kept out of search results until the real e-mail and Instagram are in (contact.placeholder
          // in content.js); the page stays reachable by its link, it just isn't indexed
          ...(contact.placeholder ? [{ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' }] : []),
          meta('og:type', 'website'),
          meta('og:locale', 'cs_CZ'),
          meta('og:site_name', name),
          meta('og:title', title),
          meta('og:description', description),
          { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
          ...(siteUrl
            ? [
                { tag: 'link', attrs: { rel: 'canonical', href: abs('/') }, injectTo: 'head' },
                meta('og:url', abs('/')),
                meta('og:image', abs('/og.png')),
                meta('og:image:width', '1200'),
                meta('og:image:height', '630'),
                meta('og:image:alt', 'Velík a Polly, dvě koťata, která hledají domov'),
                { tag: 'link', attrs: { rel: 'ai-catalog', href: abs('/.well-known/ai-catalog.json') }, injectTo: 'head' },
              ]
            : []),
          { tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify(jsonLd), injectTo: 'head' },
        ];
      },
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const file = files[req.url.slice(1)];
        if (!file) return next();
        res.setHeader('Content-Type', file[0]);
        res.end(file[1]);
      });
    },
    generateBundle() {
      if (this.environment.config.build.ssr) return;
      if (!siteUrl) this.warn('SITE_URL is not set: no canonical, og:url, og:image, ai-catalog.json or sitemap.xml in this build');
      for (const [fileName, [, source]] of Object.entries(files)) this.emitFile({ type: 'asset', fileName, source });
    },
  };
}

// dev server only (npm run build runs scripts/images.js itself, before vite): photos/ →
// public/photos/ at start, and again whenever a photo in photos/ is added, changed or removed.
// One run at a time; a run that fails is reported and the next change still gets its own run.
export function images() {
  let queue = Promise.resolve();
  const run = (log) => {
    const job = queue.then(() => optimizeImages({ log }));
    queue = job.catch(() => {});
    return job;
  };
  return {
    name: 'images',
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
