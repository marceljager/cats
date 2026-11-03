<script>
  // @ts-check
  // the page's one lightbox (opened through lightbox.js): the photo itself lifts off the page and
  // springs up into the big frame, then shrinks back into the same spot when closed
  import { onMount, tick } from 'svelte';
  import { animate } from 'motion';
  import Text from '../ui/Text.svelte';
  import Photo from '../ui/Photo.svelte';
  import Icon from '../ui/Icon.svelte';
  import Button from '../ui/Button.svelte';
  import { setLightbox } from '../services/lightbox.js';
  import { photoFile } from '../services/photos.js';
  import { isWide, reducedMotion } from '../motion/viewport.js';

  const SMALL = 'drop-shadow(0 6px 5px rgba(40, 60, 15, 0.3))';
  const BIG = 'drop-shadow(0 30px 34px rgba(20, 30, 15, 0.45))';

  let dialog;
  let bigFrame = $state();
  let items = $state.raw([]);
  let index = $state(-1); // the photo showing, -1 while closed
  let ready = $state(false);
  let lit = $state(false);
  let busy = false;
  let source = null;
  let opener = null;
  let keyed = false; // whether the last thing done in the lightbox was a key (so the focus ring belongs back)
  let hidden = null;
  const current = $derived(index >= 0 ? items[index] : null);
  const many = $derived(items.length > 1);
  // the frame's width on this screen (see .frame), so srcset fetches a file that fits it, not the page
  const sizes = $derived.by(() => {
    if (!current || typeof window === 'undefined') return '100vw';
    const phone = !isWide();
    const w = Math.min(innerWidth * (phone ? 0.86 : 0.74), innerHeight * (phone ? 0.64 : 0.66) * ratioValue(current.ratio));
    return `${Math.round(w)}px`;
  });
  // what's already on screen of photo i (the print on the line, the stop's photo): shown blurred
  // while the big file loads; a photo not loaded on the page yet gets the smallest file instead
  const previewOf = (i) => source(i).img?.currentSrc || photoFile(items[i].photo, 320, 'webp');
  // '4 / 5' → 0.8
  const ratioValue = (ratio) => {
    const [w, h] = String(ratio).split('/').map(Number);
    return h ? w / h : w;
  };

  // photo i where it sits on the page: its width, and its centre measured from the screen centre.
  // The big frame is the same photo, so the flight only resizes and moves it, never scales it.
  function onPage(i) {
    const { el, tilt = 0 } = source(i);
    const r = el.getBoundingClientRect();
    return {
      el,
      width: el.offsetWidth,
      x: r.left + r.width / 2 - innerWidth / 2,
      y: r.top + r.height / 2 - innerHeight / 2,
      tilt,
    };
  }

  // the photo on the page hides while it is up here, so it never shows twice
  function lift(el) {
    if (hidden) hidden.style.visibility = '';
    hidden = el;
    if (el) el.style.visibility = 'hidden';
  }

  async function show(req) {
    if (busy || index >= 0) return;
    // busy from the start, so a close can't slip in while the dialog is still being set up
    busy = true;
    items = req.items;
    source = req.source;
    opener = req.opener ?? document.activeElement;
    keyed = false;
    index = req.index;
    ready = false;
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    try {
      await tick();
      requestAnimationFrame(() => (lit = true));
      await flyOut();
    } finally {
      // whatever happens on the way, the dialog stays closable
      busy = false;
      ready = true;
    }
  }
  async function flyOut() {
    const from = onPage(index);
    lift(from.el);
    if (reducedMotion()) return;
    const to = bigFrame.offsetWidth;
    // pin the big frame onto the small photo before the browser paints, so the very first
    // frame on screen is still the photo on the page, not the big one
    bigFrame.style.width = `${from.width}px`;
    bigFrame.style.transform = `translateX(${from.x}px) translateY(${from.y}px) rotate(${from.tilt}deg)`;
    bigFrame.style.filter = SMALL;
    // the controls pop in while the photo is still bouncing into place, not after it settles
    const early = setTimeout(() => (ready = true), 180);
    await animate(
      bigFrame,
      {
        width: [from.width, to],
        x: [from.x, 0],
        y: [from.y, 0],
        rotate: [from.tilt, 0],
        filter: [SMALL, BIG],
      },
      { type: 'spring', visualDuration: 0.34, bounce: 0.42 },
    );
    // hand sizing back to CSS so the photo keeps fitting if the window changes
    bigFrame.style.width = '';
    clearTimeout(early);
  }

  // ...and shrinks back into that same photo on the page
  async function close() {
    if (busy || index < 0) return;
    ready = false;
    lit = false;
    if (!reducedMotion()) {
      busy = true;
      try {
        const to = onPage(index);
        await animate(
          bigFrame,
          { width: to.width, x: to.x, y: to.y, rotate: to.tilt, filter: SMALL },
          { type: 'spring', visualDuration: 0.28, bounce: 0.25 },
        );
      } finally {
        busy = false;
      }
    }
    // show the page's photo again in the same frame the big one goes, not when the close event
    // comes a task later; otherwise one frame paints with neither of them
    lift(null);
    dialog.close();
  }
  // after the dialog's own close event: everything back as it was, focus on the opener
  async function resetAfterClose() {
    index = -1;
    ready = false;
    lit = false;
    document.documentElement.style.overflow = '';
    lift(null);
    // wait until the photo is back in place (visible again) before handing focus back to it;
    // closed by a tap or click, the photo gets the focus without its ring
    await tick();
    if (!opener) return;
    if (!keyed) quietFocus(opener);
    opener.focus({ focusVisible: keyed });
  }
  // browsers that ignore focusVisible: the ring stays hidden until the next key or until it loses the focus
  function quietFocus(el) {
    el.classList.add('quiet-focus');
    const off = () => {
      el.classList.remove('quiet-focus');
      el.removeEventListener('blur', off);
      removeEventListener('keydown', off, true);
    };
    el.addEventListener('blur', off);
    addEventListener('keydown', off, true);
  }
  const step = (d) => {
    if (busy || !many) return;
    index = (index + d + items.length) % items.length;
    lift(source(index).el);
  };

  function stepWithArrows(e) {
    if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  }
  // Esc flies the photo back instead of snapping shut
  function flyBackOnEscape(e) {
    e.preventDefault();
    close();
  }
  // a click anywhere outside the photo closes it (the backdrop is there, just invisible)
  function closeOnBackdrop(e) {
    if (e.target === dialog) close();
  }
  // swipe left / right on touch screens
  let sx = 0;
  let sy = 0;
  const swipeStart = (e) => {
    sx = e.clientX;
    sy = e.clientY;
  };
  const swipeEnd = (e) => {
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - sy)) step(dx < 0 ? 1 : -1);
  };

  onMount(() => setLightbox(show)); // gives back the unregister, run when it goes
</script>

<dialog
  bind:this={dialog}
  class="lightbox"
  class:lit
  aria-label={current ? (many ? `Fotka ${index + 1} z ${items.length}: ` : '') + (current.caption || current.alt || current.hint) : 'Fotka'}
  onclose={resetAfterClose}
  oncancel={flyBackOnEscape}
  onclick={closeOnBackdrop}
  onkeydown={(e) => {
    keyed = true;
    stepWithArrows(e);
  }}
  onpointerdown={() => (keyed = false)}
>
  {#if current}
    <div class="frame" class:ready bind:this={bigFrame} role="presentation" style="--r:{ratioValue(current.ratio)}" onpointerdown={swipeStart} onpointerup={swipeEnd}>
      {#key index}
        <div class="pic" class:captioned={current.caption}>
          <Photo src={current.photo} hint={current.hint} alt={current.alt || current.caption} ratio={current.ratio} tape={current.tape ?? false} zoom={false} {sizes} eager preview={current.photo ? previewOf(index) : null} />
          {#if current.caption}
            <Text variant="small" as="span" class="caption" aria-hidden="true">{current.caption}</Text>
          {/if}
        </div>
      {/key}
      <span class="nav shut"><Button variant="round" theme="paper" bounce={{ over: { scale: 1.1, rotate: 0, y: 0 } }} onclick={close} aria-label="Zavřít"><Icon name="close" size={24} /></Button></span>
      {#if many}
        <span class="nav prev"><Button variant="round" theme="paper" bounce={{ over: { scale: 1.1, rotate: 0, y: 0, x: -3 } }} onclick={() => step(-1)} aria-label="Předchozí fotka"><Icon name="left" size={28} /></Button></span>
        <span class="nav next"><Button variant="round" theme="paper" bounce={{ over: { scale: 1.1, rotate: 0, y: 0, x: 3 } }} onclick={() => step(1)} aria-label="Další fotka"><Icon name="right" size={28} /></Button></span>
      {/if}
    </div>
  {/if}
</dialog>

<style>
  /* no visible backdrop, just the big photo floating over the page */
  .lightbox {
    width: 100vw;
    max-width: 100vw;
    height: 100dvh;
    max-height: 100dvh;
    margin: 0;
    padding: 0;
    border: 0;
    /* a light, soft veil over the page; fades with the flight */
    background: rgba(251, 250, 245, 0);
    transition: background-color 0.45s ease, backdrop-filter 0.45s ease;
    display: grid;
    place-items: center;
    overflow: visible;
  }
  .lightbox:not([open]) {
    display: none;
  }
  .lightbox.lit {
    background: rgba(251, 250, 245, 0.62);
    backdrop-filter: blur(3px);
  }
  .lightbox::backdrop {
    background: transparent;
  }
  .frame {
    position: relative;
    width: min(74vw, calc(66dvh * var(--r)));
    touch-action: pan-y;
    filter: drop-shadow(0 30px 34px rgba(20, 30, 15, 0.45));
    transform-origin: 50% 50%;
  }
  /* a gallery polaroid: the same frame and caption strip as the print on the line (Gallery's
     .print), sized from its own width so the two are one object at two sizes */
  .pic {
    position: relative;
    display: block;
    container-type: inline-size;
    animation: swap 0.3s var(--ease-out);
  }
  .captioned :global(.photo) {
    padding: 4.5% 4.5% 17%;
  }
  .pic :global(.caption) {
    position: absolute;
    left: 6%;
    right: 6%;
    bottom: 0;
    height: 17cqw;
    display: grid;
    place-items: center;
    line-height: 1.15;
    text-align: center;
    color: var(--ink-soft);
    /* grows and shrinks with the photo in flight: the print's own size at the line's width, a
       little bigger once the photo is up, so it never wraps mid-flight or jumps when it lands */
    font-size: clamp(0.95rem, 4.4cqw, 1.3rem);
  }
  @keyframes swap {
    from { opacity: 0.4; scale: 0.97; }
  }
  /* round cartoon buttons pinned to the photo: close on its corner, arrows at its sides */
  .nav {
    position: absolute;
    display: block;
    opacity: 0;
    scale: 0.6;
    pointer-events: none;
    transition: opacity 0.12s ease, scale 0.25s var(--ease-back);
  }
  .ready .nav {
    opacity: 1;
    scale: 1;
    pointer-events: auto;
  }
  .shut {
    top: -18px;
    right: -18px;
    --round: 46px;
  }
  .prev,
  .next {
    top: 50%;
    translate: 0 -50%;
  }
  .prev {
    left: -76px;
  }
  .next {
    right: -76px;
  }
  @media (max-width: 759px) {
    .frame {
      width: min(86vw, calc(64dvh * var(--r)));
    }
    /* phones: the arrows sit just under the photo's bottom corners */
    .prev,
    .next {
      top: auto;
      bottom: -70px;
      translate: 0 0;
    }
    .prev {
      left: 6px;
    }
    .next {
      right: 6px;
    }
    .shut {
      top: -16px;
      right: -12px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .pic {
      animation: none;
    }
  }
</style>
