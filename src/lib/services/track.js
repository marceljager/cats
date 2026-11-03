// @ts-check
// counting visits on GoatCounter (the script in index.html; no cookies, so no consent banner).
// Page views count themselves; these are the clicks worth knowing about, as GoatCounter events.
// It skips localhost by itself, so the dev server counts nothing.

export function track(name) {
  window.goatcounter?.count?.({ path: name, event: true });
}

// the links worth counting say so themselves, data-track="event name" (the contact card's e-mail
// and Instagram, the share note's and the flyer's links): one listener for the whole page
export function trackLinks() {
  // capture: the flyer tears its strip off on the same click
  document.addEventListener(
    'click',
    (e) => {
      const name = /** @type {Element} */ (e.target).closest?.('[data-track]')?.getAttribute('data-track');
      if (name) track(name);
    },
    true,
  );
}
