// what search engines and link previews get (scripts/seo.js)
import { describe, expect, test } from 'vitest';
import { headTags, seoFiles } from '../scripts/seo.js';
import { cats, contact, site, stops } from '../src/content.js';

const URL_ = 'https://velikapolly.cz';
const attr = (tags, key, value) => tags.find((t) => t.attrs?.[key] === value);

describe('headTags', () => {
  test('the title and description come from content.js', () => {
    const tags = headTags('');
    expect(tags.find((t) => t.tag === 'title').children).toBe(site.title);
    expect(attr(tags, 'name', 'description').attrs.content).toBe(site.description);
    expect(attr(tags, 'property', 'og:title').attrs.content).toBe(site.title);
  });
  test('the page stays out of search results while the contacts are placeholders', () => {
    expect(Boolean(attr(headTags(''), 'name', 'robots'))).toBe(contact.placeholder);
  });
  test('only an address brings the canonical link and the preview picture', () => {
    expect(attr(headTags(''), 'rel', 'canonical')).toBeUndefined();
    const tags = headTags(URL_);
    expect(attr(tags, 'rel', 'canonical').attrs.href).toBe(`${URL_}/`);
    expect(attr(tags, 'property', 'og:image').attrs.content).toBe(`${URL_}/og.png`);
  });
  test('the JSON-LD names both cats', () => {
    const ld = JSON.parse(headTags(URL_).find((t) => t.attrs?.type === 'application/ld+json').children);
    expect(ld.about.map((a) => a.name)).toEqual(cats.map((c) => c.name));
    expect(ld.url).toBe(`${URL_}/`);
  });
});

describe('seoFiles', () => {
  test('llms.txt tells the whole story: the cats, every stop and how to get in touch', () => {
    const [type, llms] = seoFiles('')['llms.txt'];
    expect(type).toMatch(/^text\/markdown/);
    for (const c of cats) expect(llms).toContain(c.says);
    for (const s of stops) expect(llms).toContain(`${s.place} (${s.country}, ${s.km} km)`);
    expect(llms).toContain(contact.email);
  });
  test('without an address: robots.txt and llms.txt only, no sitemap', () => {
    const files = seoFiles('');
    expect(Object.keys(files).sort()).toEqual(['llms.txt', 'robots.txt']);
    expect(files['robots.txt'][1]).not.toContain('Sitemap');
  });
  test('with an address: the sitemap and ai-catalog.json point at it', () => {
    const files = seoFiles(URL_);
    expect(files['robots.txt'][1]).toContain(`Sitemap: ${URL_}/sitemap.xml`);
    expect(files['sitemap.xml'][1]).toContain(`<loc>${URL_}/</loc>`);
    const catalog = JSON.parse(files['.well-known/ai-catalog.json'][1]);
    expect(catalog.entries.map((e) => e.url)).toEqual([`${URL_}/`, `${URL_}/llms.txt`]);
  });
});
