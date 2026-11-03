<script>
  // @ts-check
  // photos pegged on clotheslines; any of them flies up big into the page's lightbox
  import { onMount } from 'svelte';
  import Text from '../ui/Text.svelte';
  import { swing } from '../motion/springs.js';
  import Photo from '../ui/Photo.svelte';
  import { zoom } from '../services/lightbox.js';
  import { gallery } from '../../content.js';

  const RATIO = { portrait: '4 / 5', landscape: '5 / 4', square: '1 / 1' };
  const TILT = [-3, 2, -1.5, 3, -2.5, 1.5, -2, 2.5];

  // photos per line: four on desktop, three on a tablet or an unfolded Duo, two on phones
  let per = $state(4);
  const wide = $derived(per > 2);
  const rows = $derived.by(() => {
    const out = [];
    for (let i = 0; i < gallery.length; i += per) out.push(gallery.slice(i, i + per).map((g, j) => ({ ...g, i: i + j })));
    return out;
  });
  const sag = $derived(wide ? 34 : 18);
  // how far below the string's ends each slot hangs (the string sags in the middle)
  const drop = (j, n) => {
    const t = (j + 0.5) / n;
    return 4 * sag * t * (1 - t);
  };

  const prints = $state([]);
  const printImages = $state([]);
  const items = gallery.map((g) => ({ photo: g.photo, hint: g.hint, alt: g.caption, caption: g.caption, ratio: RATIO[g.orientation] }));
  // the print itself lifts off its peg, caption and all, and flies back onto it when closed
  const show = (i, e) =>
    zoom({ items, index: i, source: (k) => ({ el: prints[k], tilt: TILT[k % TILT.length], img: printImages[k] }), opener: e.currentTarget });

  onMount(() => {
    const four = matchMedia('(min-width: 1024px)');
    const three = matchMedia('(min-width: 640px)');
    const updatePerRow = () => (per = four.matches ? 4 : three.matches ? 3 : 2);
    updatePerRow();
    four.addEventListener('change', updatePerRow);
    three.addEventListener('change', updatePerRow);
    return () => {
      four.removeEventListener('change', updatePerRow);
      three.removeEventListener('change', updatePerRow);
    };
  });
</script>

<section class="section gallery" aria-labelledby="gallery-h">
  <div class="wrap">
    <Text variant="title" id="gallery-h">Fotky z&nbsp;cesty</Text>
    <Text variant="lede" class="gallery-lede">Lidi nás fotili na každém kroku. Klepněte na fotku a&nbsp;uvidíte ji v&nbsp;celé kráse.</Text>

    <div class="lines">
      {#each rows as row}
        <div class="line" style="--n:{row.length}; --sag:{sag}px">
          <svg class="string" viewBox="0 0 100 {sag * 2}" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 0 Q50 {sag * 2} 100 0" />
          </svg>
          <span class="hook l" aria-hidden="true"></span>
          <span class="hook r" aria-hidden="true"></span>
          {#each row as g, j (g.i)}
            <div class="slot" style="padding-top:{drop(j, row.length)}px">
              <button
                class="snap {g.orientation}"
                type="button"
                style="--tilt:{TILT[g.i % TILT.length]}deg; --d:{(g.i % 3) * 0.4}s"
                onclick={(e) => show(g.i, e)}
                aria-label="{g.caption}: zvětšit fotku"
                use:swing={{ target: '.sway', scroll: true, base: 80, max: 200 }}
              >
                <!-- the button stays put as the hover/click area; only the picture inside swings,
                     so a swinging photo can't slide out from under the pointer and re-trigger itself -->
                <span class="sway">
                <svg class="peg" viewBox="0 0 16 34" aria-hidden="true">
                  <rect x="1.5" y="1.5" width="6" height="31" rx="2" />
                  <rect x="8.5" y="1.5" width="6" height="31" rx="2" />
                  <rect class="spring" x="0.5" y="12" width="15" height="5" rx="2" />
                </svg>
                <span class="print" bind:this={prints[g.i]}>
                  <Photo bind:image={printImages[g.i]} src={g.photo} hint={g.hint} alt={g.caption} ratio={RATIO[g.orientation]} tape={false} zoom={false} sizes="(min-width: 1024px) 262px, (min-width: 640px) 31vw, 40vw" />
                  <Text variant="small" as="span" class="caption">{g.caption}</Text>
                </span>
                </span>
              </button>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</section>


<style>
  .gallery :global(.gallery-lede) {
    margin-top: 14px;
    color: var(--ink-soft);
    max-width: 40ch;
  }
  .lines {
    display: grid;
    gap: clamp(40px, 6vw, 72px);
    margin-top: clamp(36px, 5vw, 60px);
  }

  /* one clothesline: a sagging string between two hooks, the photos pegged along it */
  .line {
    position: relative;
    display: grid;
    grid-template-columns: repeat(var(--n), minmax(0, 1fr));
    align-items: start;
    padding-top: 14px;
  }
  .string {
    position: absolute;
    top: 14px;
    left: 0;
    width: 100%;
    height: calc(var(--sag) * 2);
    overflow: visible;
  }
  .string path {
    fill: none;
    stroke: #7a4f2a;
    stroke-width: 2.5;
    vector-effect: non-scaling-stroke;
  }
  .hook {
    position: absolute;
    top: 6px;
    width: 14px;
    height: 14px;
    background: #9aa3ad;
    border: 3px solid var(--ink);
    border-radius: 50%;
  }
  .hook.l {
    left: -7px;
  }
  .hook.r {
    right: -7px;
  }
  .slot {
    display: flex;
    justify-content: center;
  }

  /* a polaroid hanging from a wooden peg */
  .snap {
    position: relative;
    display: block;
    padding: 0;
    margin-top: -2px;
    border: 0;
    background: none;
    font: inherit;
    color: inherit;
    cursor: zoom-in;
    transform-origin: 50% 0;
    rotate: var(--tilt);
  }
  /* the swinging picture: hangs from the peg, ignores the pointer (the button around it catches it) */
  .sway {
    display: block;
    position: relative;
    transform-origin: 50% 0;
    pointer-events: none;
    transition: translate 0.4s var(--ease-out);
  }
  .snap:hover .sway {
    translate: 0 -4px;
  }
  /* on phones two prints share a line, so each takes nearly its half of it */
  /* never wider than its share of the line, however few photos hang on it */
  .snap {
    max-width: 94%;
  }
  .snap.portrait {
    width: clamp(132px, 39vw, 196px);
  }
  .snap.landscape {
    width: clamp(150px, 43vw, 262px);
  }
  .snap.square {
    width: clamp(136px, 41vw, 214px);
  }
  .snap:focus-visible {
    outline-offset: 6px;
  }
  .peg {
    position: absolute;
    z-index: 2;
    top: -16px;
    left: 50%;
    width: 14px;
    translate: -50% 0;
    overflow: visible;
  }
  .peg rect {
    fill: #c99a62;
    stroke: var(--ink);
    stroke-width: 2;
  }
  .peg .spring {
    fill: #9aa3ad;
  }
  /* the polaroid: frame and caption strip sized from its own width, so the small print on the
     line and the big one in the lightbox (Lightbox's .pic) are the same object at two sizes */
  .print {
    position: relative;
    display: block;
    container-type: inline-size;
  }
  .print :global(.photo) {
    padding: 4.5% 4.5% 17%;
  }
  .print :global(.caption) {
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
  }
  /* a small print on a phone or tablet: the strip grows to two lines, so a longer caption stays on the paper */
  @media (max-width: 1023px) {
    @container (max-width: 210px) {
      .print :global(.photo) {
        padding-bottom: 27%;
      }
      .print :global(.caption) {
        height: 27cqw;
        font-size: 0.875rem;
        line-height: 1.1;
        text-wrap: balance;
      }
    }
  }
</style>
