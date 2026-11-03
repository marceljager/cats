// counting visits on GoatCounter (the script in index.html; no cookies, so no consent banner).
// Page views count themselves; these are the clicks worth knowing about, as GoatCounter events.
// It skips localhost by itself, so the dev server counts nothing.
import { contact } from '../../content.js';

export function track(name) {
  window.goatcounter?.count?.({ path: name, event: true });
}

// the links that leave the page, told apart by where they go: one listener for the whole page
// catches them in the contact card, the share note and the flyer's tear-off strips alike
const links = [
  [(u) => u.startsWith(`mailto:${contact.email}`), 'napsat-email'],
  [(u) => u.includes('instagram.com/'), 'instagram'],
  [(u) => u.startsWith('https://wa.me/'), 'sdilet-whatsapp'],
  [(u) => u.includes('facebook.com/sharer'), 'sdilet-facebook'],
  [(u) => u.startsWith('mailto:?'), 'sdilet-email'],
];

export function trackLinks() {
  // capture: the flyer tears its strip off on the same click
  document.addEventListener(
    'click',
    (e) => {
      const href = e.target.closest?.('a[href]')?.getAttribute('href');
      const hit = href && links.find(([test]) => test(href));
      if (hit) track(hit[1]);
    },
    true,
  );
}
