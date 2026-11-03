// @ts-check
// sending the page on to friends: the phone's own share sheet where there is one, otherwise
// WhatsApp, Facebook, an e-mail or a copied link
import { site } from '../../content.js';
import { track } from './track.js';

const { name: title, share } = site;

const enc = encodeURIComponent;
// the page itself, without the #section someone happened to be on
const url = () => location.href.split('#')[0];

export const canShare = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';

// the phone's own share sheet: 'sent' once it went out, 'closed' when the visitor closed the sheet
// themselves, 'failed' when the browser couldn't open it (then offer another way)
export async function shareNative() {
  try {
    await navigator.share({ title, text: share.text, url: url() });
  } catch (e) {
    return e?.name === 'AbortError' ? 'closed' : 'failed';
  }
  track('sdilet-telefon');
  return 'sent';
}

// puts the page's address on the clipboard; true once it is there
export async function copyLink() {
  const ok = await writeClipboard(url());
  if (ok) track('sdilet-odkaz');
  return ok;
}

async function writeClipboard(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // no clipboard access (an older browser, an in-app browser, a page that isn't https):
    // the old way, through a hidden text field
    const back = /** @type {HTMLElement | null} */ (document.activeElement);
    const field = document.createElement('textarea');
    field.value = value;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed; opacity:0; pointer-events:none';
    document.body.append(field);
    field.select();
    let ok;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    field.remove();
    // selecting the field took focus away from the button that was pressed
    back?.focus?.();
    return ok;
  }
}

// what a "copy the link" button says for a moment after it is pressed: copied, or failed (then the
// visitor has to copy the address themselves). Every copy button on the page shows both.
export function linkCopier(ms = 2400) {
  let copied = $state(false);
  let failed = $state(false);
  let timer;
  return {
    get copied() {
      return copied;
    },
    get failed() {
      return failed;
    },
    async copy() {
      const ok = await copyLink();
      copied = ok;
      failed = !ok;
      clearTimeout(timer);
      timer = setTimeout(() => (copied = failed = false), ms);
    },
    stop() {
      clearTimeout(timer);
    },
  };
}

/**
 * @typedef {{ id: string, kind: 'link' | 'native' | 'copy', label: string, long: string, icon: string,
 *   href?: string, target?: '_blank', event?: string }} ShareOption
 *   kind says what it does: a link (href, opened in target; event is what visit counting calls it,
 *   put on the link as data-track), the phone's share sheet, or copying the address
 */

// every way to share, in order; the phone's share sheet only where the browser has one, or never
// with { native: false } (where a button of its own already opens it)
/** @returns {ShareOption[]} */
export function options({ native = canShare() } = {}) {
  const u = url();
  return [
    ...(native ? [{ id: 'native', kind: /** @type {const} */ ('native'), label: 'Sdílet', long: 'Sdílet přes telefon', icon: 'share' }] : []),
    { id: 'whatsapp', kind: 'link', label: 'WhatsApp', long: 'Poslat přes WhatsApp', icon: 'whatsapp', href: `https://wa.me/?text=${enc(`${share.text} ${u}`)}`, target: '_blank', event: 'sdilet-whatsapp' },
    { id: 'facebook', kind: 'link', label: 'Facebook', long: 'Sdílet na Facebooku', icon: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(u)}`, target: '_blank', event: 'sdilet-facebook' },
    { id: 'email', kind: 'link', label: 'E-mail', long: 'Poslat e-mailem', icon: 'mail', href: `mailto:?subject=${enc(share.subject)}&body=${enc(`${share.text}\n\n${u}`)}`, event: 'sdilet-email' },
    { id: 'copy', kind: 'copy', label: 'Odkaz', long: 'Zkopírovat odkaz', icon: 'link' },
  ];
}

// does what a native or copy option says (a link just opens): a share sheet that fails (some
// desktop browsers) still leaves the link to copy
/** @param {ShareOption} option @param {ReturnType<typeof linkCopier>} link */
export async function shareWith(option, link) {
  if (option.kind === 'native' && (await shareNative()) === 'failed') await link.copy();
  else if (option.kind === 'copy') await link.copy();
}
