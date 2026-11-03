<script>
  // a "home wanted" flyer pinned to the living-room wall, the kind with tear-off strips along the
  // bottom; here each strip is a way to send us on to someone who might have room
  import { onMount } from 'svelte';
  import { animate, motionValue } from 'motion';
  import Text from '../ui/Text.svelte';
  import Icon from '../ui/Icon.svelte';
  import Tape from '../ui/Tape.svelte';
  import CatHead from '../art/CatHead.svelte';
  import { options, shareWith, linkCopier } from '../services/share.svelte.js';
  import { reducedMotion } from '../motion/viewport.js';
  import { site } from '../../content.js';

  let list = $state.raw([]);
  const link = linkCopier();
  // a torn-off strip leaves an empty slot for a moment, until a new one slides in
  const AWAY = 1600;
  let gone = $state({});
  const regrow = new Set();

  // the share sheet and the page's address are only known in the browser, not at prerender
  onMount(() => {
    list = options();
    return () => {
      link.stop();
      regrow.forEach(clearTimeout);
    };
  });

  // each strip hangs a touch crooked, as cut paper does
  const TILT = [-1.4, 0.9, -0.5, 1.3, -1];
  const FLYER_TILT = 1.2;

  // holding a strip: it stays joined to the flyer along its top edge, like real paper, and bends
  // after the pointer. Pointing at it, it only leans a little towards you; pressing grabs it, and
  // while you hold it, it bends further after the pointer and stretches as you pull down, resisting
  // more the further it goes. Only letting go (the click, see tear) tears it off.
  const poses = new WeakMap(); // strip -> { bend, stretch, drop } motion values, read by tear()
  function hold(node) {
    // bend: skew in degrees (the top edge stays put, the free end swings); stretch: scaleY from the
    // top; drop: only for the new strip sliding in from under the perforation
    const bend = motionValue(0);
    const stretch = motionValue(1);
    const drop = motionValue(0);
    poses.set(node, { bend, stretch, drop });
    const apply = () => {
      node.style.transform = `translateY(${drop.get()}px) skewX(${bend.get()}deg) scaleY(${stretch.get()})`;
    };
    const offs = [bend, stretch, drop].map((v) => v.on('change', apply));
    const follow = { type: 'spring', stiffness: 520, damping: 30 };
    const settle = { type: 'spring', stiffness: 260, damping: 12 };
    let held = false;
    // the hinge is the strip's top centre, where it is joined to the flyer
    function towards(e) {
      if (reducedMotion()) return;
      const r = node.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = Math.max(e.clientY - r.top, 8);
      const angle = (Math.atan2(dx, dy) * 180) / Math.PI;
      if (!held) {
        animate(bend, Math.max(-6, Math.min(6, angle * 0.3)), follow);
        return;
      }
      // paper resists: the stretch eases off the further you pull
      const pull = Math.max(0, dy - node.offsetHeight * 0.6);
      animate(bend, Math.max(-24, Math.min(24, angle * 0.7)), follow);
      animate(stretch, 1.03 + 0.17 * (1 - Math.exp(-pull / 70)), follow);
    }
    const enter = (e) => e.pointerType === 'mouse' && towards(e);
    const move = (e) => (held || e.pointerType === 'mouse') && towards(e);
    const down = (e) => {
      held = true;
      node.setPointerCapture?.(e.pointerId);
      if (!reducedMotion()) animate(stretch, 1.03, follow);
      towards(e);
    };
    const letGo = () => {
      held = false;
      animate(bend, 0, settle);
      animate(stretch, 1, settle);
    };
    const up = () => (held = false);
    const leave = () => !held && letGo();
    const events = { pointerenter: enter, pointermove: move, pointerdown: down, pointerup: up, pointercancel: letGo, pointerleave: leave };
    for (const [type, fn] of Object.entries(events)) node.addEventListener(type, fn);
    return {
      destroy() {
        offs.forEach((off) => off());
        [bend, stretch, drop].forEach((v) => v.stop());
        for (const [type, fn] of Object.entries(events)) node.removeEventListener(type, fn);
      },
    };
  }

  // tearing it off: a copy of the strip comes away from wherever it was bent, tumbling, and the
  // slot stays empty for a moment before a fresh one slides down into place. The real control only
  // turns see-through, so a keyboard user's focus stays on it.
  function tear(el, i, id) {
    if (gone[id]) return;
    gone = { ...gone, [id]: true };
    const pose = poses.get(el);
    const t = setTimeout(() => {
      regrow.delete(t);
      gone = { ...gone, [id]: false };
      // back in view (a CSS fade); the next strip down the pad slides in from under the perforation
      el.style.opacity = '';
      if (reducedMotion() || !pose) return;
      pose.drop.jump(-18);
      animate(pose.drop, 0, { type: 'spring', stiffness: 320, damping: 15 });
    }, AWAY);
    regrow.add(t);
    if (reducedMotion()) return;
    const li = el.parentElement.getBoundingClientRect();
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const bend = pose?.bend.get() ?? 0;
    const stretch = pose?.stretch.get() ?? 1;
    const piece = el.cloneNode(true);
    piece.removeAttribute('id');
    piece.setAttribute('aria-hidden', 'true');
    piece.tabIndex = -1;
    piece.classList.add('torn');
    const tilt = FLYER_TILT + TILT[i % TILT.length];
    Object.assign(piece.style, {
      position: 'fixed',
      left: `${li.left + li.width / 2 - w / 2}px`,
      top: `${li.top}px`,
      width: `${w}px`,
      height: `${h}px`,
      margin: '0',
      zIndex: '50',
      pointerEvents: 'none',
      transformOrigin: '50% 0',
      transform: '',
      opacity: '1',
      transition: 'none',
    });
    document.body.append(piece);
    // the strip left on the flyer is see-through until the next one slides in
    el.style.opacity = '0';
    // it falls the way it was pulled: a strip bent to the left tumbles off to the left
    const side = Math.abs(bend) > 2 ? Math.sign(bend) : i % 2 ? 1 : -1;
    // the paper gives with a little snap, springs straight, then drops, spinning and fading
    animate(
      piece,
      {
        y: [0, 12, 280],
        x: [0, side * 4, side * 50],
        skewX: [bend, bend * 0.3, 0],
        scaleY: [stretch, 1, 1],
        rotate: [tilt, tilt + side * 5, tilt + side * 40],
        opacity: [1, 1, 0],
      },
      { duration: 0.95, times: [0, 0.12, 1], ease: ['easeOut', [0.5, 0, 0.9, 0.6]] },
    ).then(() => piece.remove());
    pose?.bend.jump(0);
    pose?.stretch.jump(1);
  }

</script>

<aside class="flyer" id="sdilet" aria-labelledby="sdilet-h">
  <Tape tilt={-8} width={74} style="top:-13px; left:18px;" />
  <Tape tilt={7} width={66} style="top:-11px; right:22px;" />

  <div class="body">
  <div class="head">
    <svg class="faces" viewBox="-34 -40 68 62" aria-hidden="true">
      <CatHead catId="velik" cx={-12} cy={0} r={15} mood="happy" tilt={-8} delay={0} />
      <CatHead catId="polly" cx={14} cy={4} r={13} mood="happy" tilt={8} delay={0.6} />
    </svg>
    <div>
      <Text variant="heading" id="sdilet-h" class="flyer-title">{site.share.heading}</Text>
      <Text class="flyer-text">
        Nemáte pro nás místo? Nevadí. Pošlete nás dál, třeba je náš domov u&nbsp;někoho z&nbsp;vašich známých.
      </Text>
    </div>
  </div>
  </div>

  <!-- the tear-off strips: cut free at their sides, hanging from a punched line; each one sends us on
       in its own way. Grab one and pull: it follows your hand and tears off when you let go -->
  <ul class="tabs" style="--n:{list.length || 4}">
    {#each list as o, i (o.id)}
      <li class:gone={gone[o.id]} style="--tilt:{TILT[i % TILT.length]}deg">
        {#if o.kind === 'link'}
          <a
            class="tab"
            href={o.href}
            target={o.target}
            rel="noopener"
            data-track={o.event}
            aria-label={o.long}
            onclick={(e) => tear(e.currentTarget, i, o.id)}
            draggable="false"
            use:hold
          >
            <Icon name={o.icon} size={34} />
            <span class="tab-label">{o.label}</span>
          </a>
        {:else}
          <button
            class="tab"
            type="button"
            aria-label={o.long}
            onclick={(e) => {
              tear(e.currentTarget, i, o.id);
              shareWith(o, link);
            }}
            draggable="false"
            use:hold
          >
            <Icon name={o.icon} size={34} />
            <span class="tab-label">{o.label}</span>
          </button>
        {/if}
      </li>
    {/each}
  </ul>
  <p class="status" role="status">
    {#if link.copied}Odkaz je zkopírovaný, stačí ho vložit do zprávy.{:else if link.failed}Odkaz se nepovedlo zkopírovat. Zkopírujte ho prosím z&nbsp;adresního řádku.{/if}
  </p>
</aside>

<style>
  .flyer {
    position: relative;
    width: min(100%, 600px);
    /* its own beat after the postcard, not a footnote to it */
    margin: clamp(48px, 9vw, 104px) auto 0;
    transform: rotate(1.2deg);
    text-align: left;
    font-family: var(--f-marker);
    filter: drop-shadow(0 10px 8px rgba(60, 35, 10, 0.22));
  }
  .body {
    padding: 26px 22px 20px;
    background:
      radial-gradient(circle at 80% 10%, rgba(255, 255, 255, 0.7), transparent 60%),
      var(--paper);
    position: relative;
    border: 3px solid var(--ink);
    border-bottom: 0;
    border-radius: 6px 6px 0 0;
  }
  /* the perforation the strips tear along: a row of little punched holes */
  .body::after {
    content: '';
    position: absolute;
    left: 6px;
    right: 6px;
    bottom: 0;
    height: 5px;
    background: radial-gradient(circle, var(--ink) 1.6px, transparent 2.1px) 0 50% / 9px 5px repeat-x;
    opacity: 0.75;
  }
  .head {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 14px;
  }
  .faces {
    width: clamp(84px, 22vw, 116px);
    overflow: visible;
  }
  .flyer :global(.flyer-title) {
    margin: 0 0 6px;
    text-wrap: balance;
  }
  .flyer :global(.flyer-text) {
    margin: 0;
    max-width: 46ch;
    text-wrap: pretty;
  }

  /* the strips: separate pieces of the same paper, cut apart with scissors (a thin slit of wall
     between them) and hanging from a line of punched holes along the flyer's bottom edge */
  .tabs {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(var(--n), 1fr);
    gap: 4px;
    margin: 0;
    padding: 0;
  }
  .tabs li {
    display: flex;
    rotate: var(--tilt);
    transform-origin: 50% 0;
  }
  .tab {
    position: relative;
    flex: 1;
    display: grid;
    justify-items: center;
    align-content: center;
    gap: 7px;
    min-width: 0;
    min-height: 104px;
    margin: 0;
    padding: 14px 4px 18px;
    font: inherit;
    color: var(--ink);
    text-decoration: none;
    /* a faint curl at the free end, where cut paper lifts off the wall */
    background:
      linear-gradient(to top, rgba(120, 90, 40, 0.13), transparent 26%),
      var(--paper);
    border: 3px solid var(--ink);
    border-top: 0;
    border-radius: 0 0 5px 5px;
    box-shadow: 0 7px 6px -5px rgba(60, 35, 10, 0.35);
    cursor: grab;
    /* the strip is dragged by hand, never as a link or a picture, and the page still scrolls under a finger */
    -webkit-user-drag: none;
    user-select: none;
    -webkit-user-select: none;
    touch-action: pan-y;
    -webkit-tap-highlight-color: transparent;
    transform-origin: 50% 0;
    transition: background-color 0.15s ease, opacity 0.25s ease;
  }
  .tab:hover {
    background:
      linear-gradient(to top, rgba(120, 90, 40, 0.1), transparent 26%),
      #fffdf2;
  }
  .tab:active {
    cursor: grabbing;
  }
  .tab :global(svg) {
    pointer-events: none;
  }
  .tab:focus-visible {
    outline: 3px solid var(--route);
    outline-offset: -8px;
  }
  /* the torn-off copy, falling free of the flyer */
  :global(.tab.torn) {
    box-shadow: 0 14px 14px -8px rgba(60, 35, 10, 0.4);
    border-top: 2px dotted var(--ink);
  }
  /* one word per strip, never broken: on a narrow phone the label shrinks to fit its strip */
  .tab {
    container-type: inline-size;
  }
  .tab-label {
    font-family: var(--f-label);
    font-variation-settings: 'wdth' 75;
    font-weight: 700;
    font-size: min(0.9rem, 17cqw);
    letter-spacing: 0.02em;
    line-height: 1.1;
    text-align: center;
    white-space: nowrap;
  }
  /* torn off: an empty slot on the flyer until the new strip slides in */
  .gone .tab {
    opacity: 0;
    pointer-events: none;
  }
  .status {
    min-height: 1.4em;
    margin: 14px 0 0;
    text-align: center;
    font-family: var(--f-marker);
    font-size: 0.95rem;
    color: var(--ink);
  }
  /* phones: the two faces sit above the heading, so the words get the flyer's whole width */
  @media (max-width: 479px) {
    .head {
      grid-template-columns: 1fr;
      gap: 6px;
    }
    .faces {
      width: 84px;
      margin-left: -4px;
    }
  }
  @media (min-width: 640px) {
    .body {
      padding: 30px 32px 24px;
    }
  }
</style>
