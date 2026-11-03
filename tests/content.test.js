// content.js is edited by hand: what the rest of the site takes for granted about it
import { existsSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { cats, catNames, contact, gallery, site, stops, vet } from '../src/content.js';
import { KINDS } from '../src/lib/art/scenery.js';

// '/photos/velik.jpg' → the original in photos/
const original = (photo) => existsSync(new URL(`..${photo}`, import.meta.url));
const unique = (list) => new Set(list).size === list.length;

describe('cats', () => {
  test('each has an id of its own and the fields the sections show', () => {
    expect(unique(cats.map((c) => c.id))).toBe(true);
    for (const c of cats) {
      for (const field of ['id', 'name', 'sex', 'age', 'namedAfter', 'photoHint', 'says']) expect(c[field], `${c.id}.${field}`).toBeTruthy();
      expect(['mountains', 'pin']).toContain(c.namedIcon);
    }
  });
  test('their photos and head photos are in photos/', () => {
    for (const c of cats) for (const photo of [c.photo, c.head].filter(Boolean)) expect(original(photo), photo).toBe(true);
  });
  test('a head frame says where the face is, in parts of the photo', () => {
    for (const { id, headFrame: f } of cats.filter((c) => c.headFrame)) {
      for (const k of ['x', 'y', 'w']) expect(f[k], `${id}.headFrame.${k}`).toBeGreaterThan(0);
      for (const k of ['x', 'y', 'w']) expect(f[k], `${id}.headFrame.${k}`).toBeLessThanOrEqual(1);
      expect(f.ratio).toBeGreaterThan(0);
    }
  });
  test('their names read as one phrase, the "a" kept with the name after it', () => {
    expect(catNames).toBe('Velík a Polly');
  });
});

describe('stops', () => {
  test('the trip starts at 0 km and every stop is further on than the last', () => {
    expect(stops[0].km).toBe(0);
    for (let i = 1; i < stops.length; i++) expect(stops[i].km, stops[i].id).toBeGreaterThan(stops[i - 1].km);
  });
  test('each has an id of its own, a place, a country, a title and a story', () => {
    expect(unique(stops.map((s) => s.id))).toBe(true);
    for (const s of stops) {
      for (const field of ['place', 'country', 'title', 'photoHint']) expect(s[field], `${s.id}.${field}`).toBeTruthy();
      expect(s.story.length, s.id).toBeGreaterThan(0);
    }
  });
  test('a place on the map is one the map can draw', () => {
    for (const s of stops.filter((s) => s.doodle)) expect(KINDS, s.id).toContain(s.doodle);
  });
  test('a detour is a labelled lookout or rest stop', () => {
    for (const s of stops.filter((s) => s.detour)) {
      expect(s.detour.label, s.id).toBeTruthy();
      expect(['lookout', 'rest'], s.id).toContain(s.detour.icon);
    }
  });
  test('their photos are in photos/', () => {
    for (const s of stops.filter((s) => s.photo)) expect(original(s.photo), s.photo).toBe(true);
  });
});

test('gallery photos have a known shape and are in photos/', () => {
  for (const g of gallery) {
    expect(['portrait', 'landscape', 'square']).toContain(g.orientation);
    expect(g.caption).toBeTruthy();
    if (g.photo) expect(original(g.photo), g.photo).toBe(true);
  }
});

test('the vet report has a verdict and what was done at each visit', () => {
  expect(vet.verdict).toBeTruthy();
  for (const v of vet.visits) expect(v.done.length, v.title).toBeGreaterThan(0);
});

test('contact has an address and a pre-filled message', () => {
  expect(contact.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]+$/);
  expect(contact.mail.subject).toBeTruthy();
  expect(contact.mail.body).toBeTruthy();
});

test('the title and description fit a search result', () => {
  expect(site.title.length).toBeLessThanOrEqual(60);
  expect(site.description.length).toBeLessThanOrEqual(160);
});
