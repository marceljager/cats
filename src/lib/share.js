// sending the page on to friends: the phone's own share sheet where there is one, otherwise
// WhatsApp, Facebook, an e-mail or a copied link
import { cats } from '../content.js';

const names = `${cats[0].name} a ${cats[1].name}`;
export const title = `${names} hledají domov`;
export const text = `${names} hledají domov · koťata zdarma k darování v Praze a okolí – nevíte o někom?`;

const enc = encodeURIComponent;
// the page itself, without the #section someone happened to be on
const url = () => location.href.split('#')[0];

export const canShare = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';

// true when it went out (or the visitor closed the sheet themselves), false when it failed
export async function shareNative() {
  try {
    await navigator.share({ title, text, url: url() });
    return true;
  } catch (e) {
    return e?.name === 'AbortError';
  }
}

export async function copyLink() {
  try {
    await navigator.clipboard.writeText(url());
    return true;
  } catch {
    // no clipboard access (an older browser, an in-app browser, a page that isn't https):
    // the old way, through a hidden text field
    const back = document.activeElement;
    const field = document.createElement('textarea');
    field.value = url();
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed; opacity:0; pointer-events:none';
    document.body.append(field);
    field.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {}
    field.remove();
    // selecting the field took focus away from the button that was pressed
    back?.focus?.();
    return ok;
  }
}

// every way to share, in order; `native` only shows where the browser has a share sheet
export function options() {
  const u = url();
  return [
    { id: 'native', label: 'Sdílet', long: 'Sdílet přes telefon', icon: 'share' },
    { id: 'whatsapp', label: 'WhatsApp', long: 'Poslat přes WhatsApp', icon: 'whatsapp', href: `https://wa.me/?text=${enc(`${text} ${u}`)}` },
    { id: 'facebook', label: 'Facebook', long: 'Sdílet na Facebooku', icon: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(u)}` },
    { id: 'email', label: 'E-mail', long: 'Poslat e-mailem', icon: 'mail', href: `mailto:?subject=${enc('Víte o domově pro dvě koťata?')}&body=${enc(`${text}\n\n${u}`)}` },
    { id: 'copy', label: 'Odkaz', long: 'Zkopírovat odkaz', icon: 'link' },
  ];
}
