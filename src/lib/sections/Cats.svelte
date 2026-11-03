<script>
  import LuggageTags from './LuggageTags.svelte';
  import Text from '../ui/Text.svelte';
  import Photo from '../ui/Photo.svelte';
  import Tape from '../ui/Tape.svelte';
  import Card from '../ui/Card.svelte';
  import CatHead from '../art/CatHead.svelte';
  import Icon from '../ui/Icon.svelte';
  import { cats } from '../../content.js';
  import { bouncy, pop } from '../motion/springs.js';
  import { reducedMotion } from '../motion/viewport.js';
  import { zoomPhoto } from '../services/lightbox.js';

  // photo-booth frames: the two of them pulling a different face in each shot
  const HEART = 'M0 10 C0 10 -9 4.5 -9 -1 A4.6 4.6 0 0 1 0 -3.4 A4.6 4.6 0 0 1 9 -1 C9 4.5 0 10 0 10 Z';
  // three frames, each a tiny scene: both shake their heads, both hop one after the other,
  // and the two of them cuddle under a heart. `act` names the loop each head plays.
  // Each backdrop is one colour in three shades (bg, a lighter `light`, a darker `deep`) with its
  // own pattern: clouds, sunburst rays, little hearts.
  const FRAMES = [
    { bg: '#8fbbe0', light: '#b9d6ef', deep: '#6d9dcb', pattern: 'clouds', v: { x: 58, y: 84, mood: 'happy', tilt: -5, act: 'shake' }, p: { x: 108, y: 90, mood: 'happy', tilt: 7, act: 'shake later' } },
    { bg: '#f2c94c', light: '#f8dc85', deep: '#dcae2e', pattern: 'rays', v: { x: 54, y: 84, mood: 'cold', tilt: 3, look: 1, act: 'hop' }, p: { x: 110, y: 92, mood: 'cold', tilt: -4, look: -1, act: 'hop later' }, shadows: true },
    { bg: '#f4a6bd', light: '#f9c7d6', deep: '#e585a3', pattern: 'hearts', v: { x: 64, y: 86, mood: 'happy', tilt: 12 }, p: { x: 100, y: 92, mood: 'happy', tilt: -13 }, heart: true },
  ];

  // sunburst rays from just above the heads, every other wedge
  const RAYS = Array.from({ length: 12 }, (_, k) => {
    const a0 = (k * Math.PI) / 6;
    const a1 = a0 + Math.PI / 12;
    const R = 200;
    return `M80 60 L${(80 + Math.cos(a0) * R).toFixed(1)} ${(60 + Math.sin(a0) * R).toFixed(1)} L${(80 + Math.cos(a1) * R).toFixed(1)} ${(60 + Math.sin(a1) * R).toFixed(1)} Z`;
  }).join(' ');
  // a staggered grid of little hearts
  const SPOTS = [0, 1, 2, 3].flatMap((row) => [0, 1, 2, 3, 4].map((col) => [12 + col * 34 + (row % 2) * 17, 12 + row * 30]));

  // each cat's photo leans its own way, and flies back into the lightbox at the same angle
  const PHOTO_TILT = [-1.5, 1.5];

  let meow = $state({});

  function poke(id) {
    meow[id] = false;
    requestAnimationFrame(() => (meow[id] = true));
  }

  // the bubble pops out on a spring, hangs a moment, then floats up and fades (with reduced motion
  // it just shows for the same moment). A newer bubble replaces this one, so a bubble that was
  // replaced leaves the newer one alone when its own time is up.
  function meowPop(node, id) {
    let replaced = false;
    (async () => {
      if (reducedMotion()) {
        await new Promise((r) => setTimeout(r, 1300));
      } else {
        node.style.opacity = '0';
        await pop(node, { opacity: [0, 1], scale: [0.4, 1], y: [12, 0], rotate: [-10, 0] }, { bounce: 0.55, visualDuration: 0.32, opacity: { duration: 0.12 } });
        await pop(node, { opacity: 0, y: -16 }, { type: 'tween', duration: 0.45, delay: 0.55, ease: 'easeIn' });
      }
      if (!replaced) meow[id] = false;
    })();
    return {
      destroy() {
        replaced = true;
      },
    };
  }

  // a click opens the photo big (the cat already said hello on hover); with no photo yet, it meows
  const photoEls = $state([]);
  const photoImages = $state([]);
  function tap(cat, i, e) {
    if (cat.photo) zoomPhoto({ el: photoEls[i], img: photoImages[i], photo: cat.photo, alt: cat.name, hint: cat.photoHint, tilt: PHOTO_TILT[i], tape: true, opener: e.currentTarget });
    else poke(cat.id);
  }

  // on a desktop the cat says hello as soon as you point at its photo
  function hover(id) {
    if (matchMedia('(hover: hover)').matches && !meow[id]) poke(id);
  }
</script>

<section class="section cats" id="kotata" aria-labelledby="cats-h">
  <div class="wrap">
    <Text variant="title" id="cats-h" class="cats-title">Sourozenci na cestě</Text>
    <Text variant="lede" class="cats-lede">Dva malí cestovatelé. Pořád u&nbsp;lidí, nebojí se ani psů.</Text>

    <!-- an open storybook: one sibling on each page, bound by the same spine -->
    <div class="duo book">
      <svg class="ribbon" viewBox="0 0 24 96" preserveAspectRatio="none" aria-hidden="true">
        <path class="fill" d="M1.5 0 H22.5 V94.5 L12 80 L1.5 94.5 Z" />
        <path class="edge" d="M1.5 0 V94.5 L12 80 L22.5 94.5 V0" />
      </svg>
      <div class="pair">
        {#each cats as cat, i (cat.id)}
          <article class="cat {i ? 'b' : 'a'}" aria-labelledby="cat-{cat.id}">
            <button class="snap" type="button" onclick={(e) => tap(cat, i, e)} onmouseenter={() => hover(cat.id)} aria-label={cat.photo ? `${cat.name}: zvětšit fotku` : `Pohladit: ${cat.name}`}>
              <Photo bind:el={photoEls[i]} bind:image={photoImages[i]} src={cat.photo} hint={cat.photoHint} alt={cat.name} tilt={PHOTO_TILT[i]} zoom={false} sizes="300px" />
              {#if meow[cat.id]}
                <span class="meow" use:meowPop={cat.id}>Mňau!</span>
              {/if}
            </button>
            <Text variant="heading" id="cat-{cat.id}">{cat.name}</Text>
            <figure class="says">
              <Card variant="bubble">
                <svg class="tail" viewBox="0 0 40 34" aria-hidden="true">
                  <path class="tail-fill" d="M6 36 C14 26 18 14 12 2 C24 10 32 22 34 36 Z" />
                  <path class="tail-line" d="M6 33 C14 24 18 14 12 2 C24 10 32 22 34 33" />
                </svg>
                <figcaption class="who">
                  <svg class="mini" viewBox="-20 -24 40 42" aria-hidden="true">
                    <CatHead catId={cat.id} r={15} mood="calm" wobble={false} />
                  </svg>
                  {cat.name} říká
                </figcaption>
                <blockquote><Text variant="lede">{cat.says}</Text></blockquote>
              </Card>
              </figure>
            <LuggageTags {cat} />
          </article>
          {#if i === 0}
            <div class="seam" aria-hidden="true"></div>
          {/if}
        {/each}
      </div>

    </div>

    <div class="together">
      <!-- a photo-booth strip of the two of them, taped onto the booth's red curtain -->
      <div class="booth" aria-hidden="true" use:bouncy={{ rest: { rotate: -3 }, over: { rotate: -1, scale: 1.03, y: -4 } }}>
        <Tape tilt={3} width={64} style="top:-14px; left:calc(50% - 32px); z-index:2;" />
        {#each FRAMES as f, k}
          <svg class="shot" viewBox="0 0 160 130">
            <rect class="backdrop" width="160" height="130" style="fill:{f.bg}" />
            {#if f.pattern === 'clouds'}
              {#each [[28, 30, 1], [118, 20, 0.8], [140, 64, 0.7], [16, 74, 0.6]] as [cx, cy, sc]}
                <g transform="translate({cx} {cy}) scale({sc})" style="fill:{f.light}">
                  <rect x="-22" y="-2" width="44" height="12" rx="6" /><circle cx="-8" cy="0" r="10" /><circle cx="8" cy="-3" r="13" />
                </g>
              {/each}
            {:else if f.pattern === 'rays'}
              <path d={RAYS} style="fill:{f.light}" />
            {:else}
              {#each SPOTS as [x, y]}<path transform="translate({x} {y}) scale(0.55)" d={HEART} style="fill:{f.light}" />{/each}
            {/if}
            <path class="backdrop-shade" d="M0 104 Q80 92 160 104 V130 H0 Z" style="fill:{f.deep}" />
            {#if f.shadows}
              <ellipse class="hop-shadow" cx={f.v.x} cy="122" rx="26" ry="4" />
              <ellipse class="hop-shadow later" cx={f.p.x} cy="123" rx="22" ry="3.5" />
            {/if}
            <g class="act {f.v.act ?? ''}">
              <CatHead catId="velik" cx={f.v.x} cy={f.v.y} r={34} mood={f.v.mood} look={f.v.look ?? 0} tilt={f.v.tilt} delay={k * 0.35} />
            </g>
            <g class="act {f.p.act ?? ''}">
              <CatHead catId="polly" cx={f.p.x} cy={f.p.y} r={29} mood={f.p.mood} look={f.p.look ?? 0} tilt={f.p.tilt} delay={k * 0.35 + 0.6} />
            </g>
            {#if f.heart}<g transform="translate(70 10)"><g class="shot-heart"><Icon name="heart" size={24} /></g></g>{/if}
          </svg>
        {/each}
      </div>
      <div class="words">
        <Text variant="heading" as="p" class="big">Nejradši spolu.</Text>
        <Text class="together-p">Spolu jsme byli odjakživa, dávno předtím, než nás lidi našli. A&nbsp;takhle bychom to chtěli mít i&nbsp;v&nbsp;novém domově.</Text>
        <Text class="together-p soft">Kdyby to opravdu nešlo, zvládneme to i&nbsp;každý zvlášť. Ale spolu je nám líp.</Text>
        <ul class="tags">
          <li class="chip">2 sourozenci</li>
          <li class="chip">1 domov</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<style>
  .cats :global(.cats-lede) {
    margin-top: 14px;
    color: var(--ink-soft);
  }
  /* the book: a cover peeking out under a stack of pages, the pages shaded toward the spine */
  .book {
    position: relative;
    margin-top: 64px;
    /* phones: the cover shows most at the top and bottom, where the page stacks are */
    padding: 16px 6px;
    /* leather-brown hardcover */
    background: #8a5a36;
    border: 3px solid var(--ink);
    border-radius: 22px;
    box-shadow: inset -5px -6px 0 #6a4227, inset 4px 4px 0 #a5714a, 0 18px 20px -14px rgba(40, 60, 15, 0.6);
  }
  .pair {
    position: relative;
    display: grid;
    gap: 0;
  }
  .cat {
    position: relative;
    display: grid;
    gap: 14px;
    /* phones: three frames nest here (cover, page, bubble), so each gives up side room to the words */
    padding: 30px 14px;
    background: var(--paper);
    border: 3px solid var(--ink);
    /* the sheets underneath peek out at the page's outer edge, each a little shorter than the one above */
    --left-pages: -4px 0 0 -1px #efe6cf, -6px 0 0 -1px var(--ink), -10px 0 0 -3px #efe6cf, -12px 0 0 -3px var(--ink);
    --right-pages: 4px 0 0 -1px #efe6cf, 6px 0 0 -1px var(--ink), 10px 0 0 -3px #efe6cf, 12px 0 0 -3px var(--ink);
    --top-pages: 0 -4px 0 -1px #efe6cf, 0 -6px 0 -1px var(--ink), 0 -10px 0 -3px #efe6cf, 0 -12px 0 -3px var(--ink);
    --bottom-pages: 0 4px 0 -1px #efe6cf, 0 6px 0 -1px var(--ink), 0 10px 0 -3px #efe6cf, 0 12px 0 -3px var(--ink);
  }
  /* phones: the book opens top to bottom, like a flip notebook, so its sheets stack above and below */
  .cat.a {
    border-radius: 20px 20px 0 0;
    border-bottom: 0;
    background: linear-gradient(0deg, #e9dfc4 0, var(--paper) 46px);
    box-shadow: var(--top-pages);
  }
  .cat.b {
    border-radius: 0 0 20px 20px;
    border-top: 0;
    background: linear-gradient(180deg, #e9dfc4 0, var(--paper) 46px);
    box-shadow: var(--bottom-pages);
  }
  .snap {
    position: relative;
    justify-self: center;
    width: min(78%, 300px);
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    font: inherit;
    color: inherit;
    transition: transform 0.4s var(--ease-out);
  }
  .snap:active {
    transform: scale(0.97) rotate(-1deg);
  }
  .meow {
    position: absolute;
    top: 18%;
    right: -10px;
    padding: 6px 12px;
    background: var(--ink);
    color: var(--paper);
    border-radius: 14px 14px 14px 2px;
    font-family: var(--f-marker);
    font-weight: 800;
    font-size: 1.25rem;
    font-variation-settings: 'INFM' 100, 'BNCE' 100;
    pointer-events: none;
    z-index: 5;
  }
  /* the ribbon bookmark lies on the open page, starting at its top edge */
  .ribbon {
    position: absolute;
    z-index: 3;
    /* tucked right under the page's top border, so it hangs from that line */
    top: 21px;
    right: 28px;
    width: 24px;
    height: 78px;
    overflow: visible;
    filter: drop-shadow(2px 3px 0 rgba(60, 35, 10, 0.18));
  }
  /* an even ink outline down both sides and round the notch; the top edge is the page's own border */
  .ribbon .fill {
    fill: var(--sun);
  }
  .ribbon .edge {
    fill: none;
    stroke: var(--ink);
    stroke-width: 3;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }
  /* the spine where the pages meet */
  .seam {
    position: relative;
    z-index: 1;
    height: 0;
    border-top: 3px solid var(--ink);
  }
  .seam::after {
    content: '';
    position: absolute;
    left: 10%;
    right: 10%;
    top: -9px;
    border-top: 2px dashed rgba(22, 19, 17, 0.25);
  }
  /* the cat's own words: a comic speech bubble, its tail curling up to the cat's name */
  .says {
    margin: 22px 0 10px;
    --card-pad: 22px 16px 18px;
  }
  .says blockquote {
    margin: 0;
  }
  .tail {
    position: absolute;
    top: -30px;
    left: 26px;
    width: 40px;
    height: 34px;
    overflow: visible;
  }
  .tail-fill {
    fill: var(--paper);
  }
  .tail-line {
    fill: none;
    stroke: var(--ink);
    stroke-width: 3;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  /* who's talking: a little tag pinned to the bubble's edge */
  .who {
    position: absolute;
    top: -16px;
    right: 18px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 12px 4px 6px;
    background: var(--ink);
    color: var(--paper);
    border: 3px solid var(--ink);
    border-radius: 999px;
    font-family: var(--f-marker);
    font-weight: 800;
    font-size: 0.95rem;
    rotate: 2deg;
  }
  .mini {
    width: 26px;
    height: 27px;
    margin: -6px 0 -3px;
    overflow: visible;
  }

  /* the shared wish: just the photo-booth strip on the page, with the words beside it */
  .together {
    display: grid;
    justify-items: center;
    gap: 26px;
    /* the same breathing room as between sections */
    margin-top: clamp(72px, 10vw, 128px);
    color: var(--ink);
    font-family: var(--f-marker);
    text-align: center;
  }
  /* the strip: white photo paper, three frames, a printed name at the bottom */
  .booth {
    position: relative;
    display: grid;
    grid-auto-flow: column;
    gap: 6px;
    padding: 7px 7px 14px;
    background: #fdfcf7;
    border: 3px solid var(--ink);
    border-radius: 4px;
    box-shadow: 0 14px 16px -10px rgba(40, 60, 15, 0.55);
    width: min(100%, 340px);
  }
  .shot {
    display: block;
    width: 100%;
    border: 3px solid var(--ink);
    border-radius: 2px;
    overflow: hidden;
  }
  .shot-heart {
    transform-box: fill-box;
    transform-origin: 50% 100%;
    animation: beat 2.4s var(--ease-out) infinite;
  }
  @keyframes beat {
    0%, 60%, 100% { scale: 1; }
    20% { scale: 1.2; }
    35% { scale: 0.95; }
  }
  /* the little scenes in the strip */
  .act {
    transform-box: fill-box;
    transform-origin: 50% 100%;
  }
  /* a quick head shake, then a rest */
  .shake {
    animation: shake 2.6s ease-in-out infinite;
  }
  @keyframes shake {
    0%, 30%, 100% { rotate: 0deg; }
    5% { rotate: -11deg; }
    10% { rotate: 10deg; }
    15% { rotate: -8deg; }
    20% { rotate: 6deg; }
    25% { rotate: -3deg; }
  }
  /* a hop: crouch, spring up, hang, land with a squash */
  .hop {
    animation: hop 2s var(--ease-out) infinite;
  }
  @keyframes hop {
    0%, 70%, 100% { translate: 0 0; scale: 1 1; }
    8% { translate: 0 2px; scale: 1.08 0.9; }
    24% { translate: 0 -24px; scale: 0.94 1.08; }
    34% { translate: 0 -27px; scale: 1 1; }
    48% { translate: 0 0; scale: 1.12 0.86; }
    58% { translate: 0 0; scale: 0.97 1.03; }
  }
  .hop-shadow {
    fill: rgba(0, 0, 0, 0.18);
    transform-box: fill-box;
    transform-origin: center;
    animation: hop-shadow 2s var(--ease-out) infinite;
  }
  @keyframes hop-shadow {
    0%, 8%, 48%, 100% { scale: 1; }
    24%, 34% { scale: 0.55; }
  }
  /* Polly goes a beat after her brother */
  .later {
    animation-delay: 0.35s;
  }
  .hop.later,
  .hop-shadow.later {
    animation-delay: 0.9s;
  }
  .words {
    display: grid;
    justify-items: center;
    gap: 10px;
    max-width: 46ch;
  }
  .words :global(.soft) {
    color: var(--ink-soft);
  }
  .tags {
    list-style: none;
    margin: 4px 0 0;
    padding: 0;
    display: flex;
    gap: 8px;
  }
  .tags .chip {
    color: var(--ink);
    font-size: 1rem;
    transform: rotate(-2deg);
  }
  .tags .chip + .chip {
    transform: rotate(2deg);
  }
  @media (prefers-reduced-motion: reduce) {
    .shot-heart, .act, .hop-shadow { animation: none; }
  }

  /* tablets and an unfolded Duo: the flip notebook stays, held at a width its pages read well at */
  @media (min-width: 760px) and (max-width: 1023px) {
    .book {
      max-width: 620px;
      margin-inline: auto;
    }
  }
  @media (min-width: 1024px) {
    .cats :global(.cats-title) {
      max-width: none;
      white-space: nowrap;
    }
    .book {
      padding: 12px 22px;
      border-radius: 26px;
    }
    .ribbon {
      top: 15px;
      right: auto;
      left: calc(50% + 22px);
      height: 96px;
    }
    .pair {
      grid-template-columns: 1fr auto 1fr;
    }
    .cat {
      padding: 32px 30px 38px;
      align-content: start;
    }
    .says {
      --card-pad: 24px 20px 20px;
    }
    /* desktop: two facing pages, each shaded toward the spine and rising at its outer corner */
    .cat.a {
      border-radius: 24px 0 0 24px;
      border: 3px solid var(--ink);
      border-right: 0;
      background: linear-gradient(270deg, #e3d8bb 0, #f3ecd8 34px, var(--paper) 90px);
      box-shadow: var(--left-pages);
    }
    .cat.b {
      border-radius: 0 24px 24px 0;
      border: 3px solid var(--ink);
      border-left: 0;
      background: linear-gradient(90deg, #e3d8bb 0, #f3ecd8 34px, var(--paper) 90px);
      box-shadow: var(--right-pages);
    }
    .seam {
      width: 0;
      height: auto;
      border-top: 0;
      border-left: 3px solid var(--ink);
    }
    .seam::after {
      display: none;
    }
    .together {
      /* both columns sized to their content, so the pair sits centred on the page */
      grid-template-columns: auto auto;
      justify-items: start;
      align-items: center;
      column-gap: 64px;
      justify-content: center;
      text-align: left;
    }
    /* desktop: the strip stands upright beside the words */
    .booth {
      grid-auto-flow: row;
      width: 270px;
    }
    .words {
      max-width: none;
      gap: 12px;
    }
    .words :global(.big) {
      white-space: nowrap;
    }
    .words :global(.together-p) {
      max-width: 36ch;
    }
    .words {
      justify-items: start;
    }
  }
</style>
