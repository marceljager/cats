// the page as the build prerenders it (src/entry-server.js): crawlers, link previews and anyone
// without JavaScript get the whole story, not an empty shell
import { expect, test } from 'vitest';
import render from '../src/entry-server.js';
import { cats, contact, gallery, stops, vet } from '../src/content.js';

const { body } = render();
// the rendered text, without tags, entities and the no-break spaces the copy uses
const text = body
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;| /g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ');
const plain = (s) => s.replace(/ /g, ' ');

test('both cats, by name and in their own words', () => {
  for (const c of cats) {
    expect(text).toContain(c.name);
    expect(text).toContain(plain(c.says));
  }
});

test('every stop of the trip, with its place, title and story', () => {
  for (const s of stops) {
    expect(text).toContain(plain(s.place));
    expect(text).toContain(plain(s.title));
    for (const p of s.story) expect(text).toContain(plain(p));
  }
});

test('the gallery captions, the vet report and how to get in touch', () => {
  for (const g of gallery) expect(text).toContain(plain(g.caption));
  expect(text).toContain(vet.verdict);
  for (const v of vet.visits) expect(text).toContain(v.title);
  expect(text).toContain(contact.email);
});
