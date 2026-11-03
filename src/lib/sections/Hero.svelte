<script>
  // @ts-check
  import { onMount } from 'svelte';
  import Text from '../ui/Text.svelte';
  import Icon from '../ui/Icon.svelte';
  import Kittens from '../figures/Kittens.svelte';
  import Button from '../ui/Button.svelte';
  import ShareButton from '../chrome/ShareButton.svelte';
  import { cats, catNames } from '../../content.js';
  import { layer } from '../art/forest.js';

  // the hero's loops (stars, flicker, the kittens) stop while it's off screen. The parallax itself
  // is CSS (scroll-driven animations, see .layer): the browser moves the layers in step with the
  // scroll, which a script can't do on iPhone, where it only hears about the scroll a frame late
  let hero;
  let idle = $state(false);
  onMount(() => {
    const io = new IntersectionObserver(([e]) => (idle = !e.isIntersecting));
    io.observe(hero);
    return () => io.disconnect();
  });

  // the scene is drawn for 1440 wide; on screens wider than its proportions the forest carries on to
  // each side (those extra trees sit off screen everywhere else)
  const far = [
    ...layer({ seed: 3, count: 26, span: [-40, 1480], base: 760, height: [200, 330], clear: [[860, 960]] }),
    ...layer({ seed: 4, count: 14, span: [-800, -40], base: 760, height: [200, 330] }),
    ...layer({ seed: 5, count: 14, span: [1480, 2240], base: 760, height: [200, 330] }),
  ];
  const mid = [
    ...layer({ seed: 9, count: 14, span: [-60, 1500], base: 930, height: [420, 560], clear: [[600, 1000]] }),
    ...layer({ seed: 10, count: 7, span: [-800, -60], base: 930, height: [420, 560] }),
    ...layer({ seed: 11, count: 7, span: [1500, 2240], base: 930, height: [420, 560] }),
  ];
  // the big front trees are rooted well below the frame, so their trunks run down behind the hills
  const front = [
    ...layer({ seed: 21, count: 3, span: [-80, 260], base: 1010, height: [620, 740] }),
    ...layer({ seed: 33, count: 3, span: [1180, 1520], base: 1010, height: [640, 760] }),
    ...layer({ seed: 22, count: 3, span: [-780, -200], base: 1010, height: [620, 760] }),
    ...layer({ seed: 34, count: 3, span: [1640, 2220], base: 1010, height: [620, 760] }),
  ];
  const STARS = [[120, 80, 1.6], [260, 170, 1.2], [420, 60, 1.4], [560, 140, 1], [690, 50, 1.6], [820, 120, 1.2], [980, 70, 1.4], [1090, 180, 1], [1250, 260, 1.3], [1380, 120, 1.5], [340, 260, 1], [760, 230, 1.3], [620, 300, 1], [900, 300, 1.2],
    [-120, 110, 1.3], [-300, 220, 1], [-480, 70, 1.5], [-640, 190, 1.1], [1560, 90, 1.4], [1720, 230, 1], [1900, 60, 1.3], [2080, 170, 1.2]];
</script>

<header class="hero" class:idle bind:this={hero} data-writebar-yields>
  <!-- the cold forest under Velebit at night; the two of them looking at the one warm window.
       Every layer is its own SVG (same viewBox, stacked), so it can move and blur as one finished
       picture; the flicker of the window has a layer of its own -->
  <div class="scene" aria-hidden="true">
    <svg class="layer sky" style="--k:0.5" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
      <defs>
        <radialGradient id="moonglow">
          <stop offset="0" stop-color="#f4f1d8" stop-opacity="0.35" />
          <stop offset="1" stop-color="#f4f1d8" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle cx="1190" cy="150" r="150" fill="url(#moonglow)" />
        <g class="stars">
          {#each STARS as [sx, sy, sr], i}
            <circle cx={sx} cy={sy} r={sr * 1.6} style="--d:{(i % 5) * 0.7}s" />
          {/each}
        </g>
        <circle class="moon" cx="1190" cy="150" r="54" />
        <circle class="crater" cx="1172" cy="138" r="10" />
        <circle class="crater" cx="1206" cy="170" r="7" />
        <circle class="crater" cx="1210" cy="128" r="5" />
    </svg>

    <!-- the window's glow and the fire in it, flickering together: the flicker is this one small
         layer's opacity, so nothing else repaints for it -->
    {#snippet lights()}
      <svg class="layer lights" style="--k:0.38" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
        <defs>
          <radialGradient id="warm">
            <stop offset="0" stop-color="#ffcf5c" stop-opacity="0.8" />
            <stop offset="1" stop-color="#ffcf5c" stop-opacity="0" />
          </radialGradient>
        </defs>
        <circle cx="912" cy="700" r="90" fill="url(#warm)" />
        <rect class="flame" x="902" y="718" width="20" height="16" rx="1.5" />
      </svg>
    {/snippet}
    <svg class="layer back" style="--k:0.38" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
      <defs>
        <filter id="hero-far-blur" filterUnits="userSpaceOnUse" x="-900" y="0" width="3240" height="1200"><feGaussianBlur stdDeviation="1.2" /></filter>
      </defs>
      <g class="soft">
        <!-- the distant forest floor: one dark mass the far trees grow out of, no hard edge -->
        <path class="far" d="M-820 1100 V770 C-600 760 -300 778 -40 772 C120 762 260 780 420 770 S760 764 900 774 S1240 762 1480 772 C1760 778 2000 764 2260 772 V1100 Z" />
        {#each far as t}<path class="far-trunk" d={t.trunk} /><g class="far-crown">{#each t.tiers as d}<path {d} />{/each}</g>{/each}
        <!-- the apartment in the distance -->
        <path class="house" d="M872 760 V706 L912 676 L952 706 V760 Z" />
        <rect class="lit" x="900" y="716" width="24" height="20" rx="2" />
        <path class="pane" d="M912 716 V736 M900 726 H924" />
      <ellipse class="fog f1" cx="500" cy="760" rx="520" ry="34" />
      </g>
    </svg>
    {@render lights()}

    <svg class="layer middle" style="--k:0.28" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
      <defs>
        <filter id="hero-mid-blur" filterUnits="userSpaceOnUse" x="-900" y="0" width="3240" height="1200"><feGaussianBlur stdDeviation="0.6" /></filter>
      </defs>
      <g class="softer">
        {#each mid as t}<path class="mid-trunk" d={t.trunk} /><g class="mid">{#each t.tiers as d}<path class="outline" {d} />{/each}{#each t.tiers as d}<path {d} />{/each}</g>{/each}
      </g>
    </svg>

    <svg class="layer near" style="--k:0.2" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
      <!-- the flat forest floor the kittens sit on, running on down behind the hills -->
        <path class="ground" d="M-820 1100 V826 C-500 816 -240 830 -20 832 C200 812 420 824 640 818 C860 812 1100 826 1460 812 C1760 804 2000 822 2260 816 V1100 Z" />
        <path class="tufts" d="M220 846 l4 -12 l4 12 M236 850 l3 -10 l3 10 M1010 842 l4 -12 l4 12 M1028 846 l3 -9 l3 9 M560 840 l3 -10 l3 10 M1180 846 l4 -11 l4 11" />
      <!-- the kittens, huddled, looking toward the window -->
      <Kittens cold />
      <ellipse class="fog f2" cx="1000" cy="850" rx="560" ry="30" />
    </svg>

    <svg class="layer fore" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
        {#each front as t}<path class="front-trunk" d={t.trunk} /><g class="front">{#each t.tiers as d}<path class="outline" {d} />{/each}{#each t.tiers as d}<path {d} />{/each}</g>{/each}
    </svg>
  </div>

  <ShareButton />

  <div class="wrap copy">
    <Text variant="display" class="hero-title">Ahoj, jsme {catNames}.</Text>
    <Text variant="lede" class="hero-sub">
      Náš příběh začal v&nbsp;chorvatském pohoří Velebit, kde nás někdo vyhodil a&nbsp;nechal, ať zamrzneme. Lidi i&nbsp;tak milujeme a&nbsp;nejradši jsme pořád s&nbsp;nimi. Teď už jsme v&nbsp;teple, ale pořád čekáme na to hlavní – na rodinu, která si nás nechá napořád.
    </Text>
    <ul class="facts" aria-label="Kdo jsme">
      <li class="chip">sourozenci, {cats.map((c) => c.sex).join(' + ')}</li>
      <li class="chip">{[...new Set(cats.map((c) => c.age))].join(' / ')}</li>
      <li class="chip">mazliví, učenliví a&nbsp;stateční</li>
      <li class="chip">k&nbsp;adopci v&nbsp;Praze a&nbsp;okolí</li>
    </ul>
    <div class="actions">
      <Button href="#domov">Chci je poznat <Icon name="right" size={24} /></Button>
      <span class="story"><Button href="#cesta" variant="link">Jak jsme se sem dostali <Icon name="down" size={22} /></Button></span>
    </div>
  </div>

  <!-- morning comes: green hills rising into the map below. The land is a strip of the page's own
       ground cut to the hills' curve and laid over the forest (cheaper on phones than masking the
       whole moving scene) -->
  <div class="land" aria-hidden="true"></div>
  <svg class="hills" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
    <defs><clipPath id="hero-land" clipPathUnits="objectBoundingBox"><path d="M-0.0069 0.5778 C0.0833 0.2000 0.1667 0.1556 0.2500 0.4444 C0.3333 0.7333 0.3889 0.7778 0.4861 0.4222 C0.5833 0.0889 0.6667 0.1111 0.7500 0.4444 C0.8333 0.7778 0.9167 0.7111 1.0069 0.3333 L1.0069 1.1111 L-0.0069 1.1111 Z" /></clipPath></defs>
    <path class="edge" d="M-10 52 C120 18 240 14 360 40 C480 66 560 70 700 38 C840 8 960 10 1080 40 C1200 70 1320 64 1450 30" />
  </svg>
</header>

<style>
  .hero {
    position: relative;
    min-height: max(100svh, 680px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: var(--paper);
    background: #10233a;
    --hh: clamp(48px, 7vw, 90px);
  }
  /* the scene ends where the hills begin, so nothing hides behind them; its layers are stacked
     SVGs of the same size. The night sky is the box's own background */
  .scene {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: calc(100% - clamp(30px, 4.5vw, 58px));
    background: linear-gradient(#0b1626, #18304d 70%, #1f3b5c);
  }
  /* parallax: every layer sinks a little more than the one in front of it (--k of the scroll), so
     things only ever slip behind what is nearer; the big front trees stay put. Scroll-driven: the
     browser runs it with the scroll itself, and where it can't, the forest simply stays still.
     A layer is moved as one finished picture, never redrawn */
  /* every layer is scaled to the scene's height and centred, so a wide screen shows more forest to
     each side instead of a blown-up middle (on narrower screens the sides are simply off screen) */
  .layer {
    position: absolute;
    top: 0;
    left: 50%;
    height: 100%;
    width: auto;
    aspect-ratio: 1440 / 900;
    translate: -50% 0;
    overflow: visible;
    will-change: transform;
  }
  .fore {
    will-change: auto;
  }
  @supports (animation-timeline: scroll()) {
    @media (prefers-reduced-motion: no-preference) {
      .layer:not(.fore) {
        animation: sink linear both;
        animation-timeline: scroll(root);
        animation-range: 0 1000px;
      }
      /* the window's light both sinks with its layer and keeps flickering */
      .layer.lights {
        animation: sink linear both, flicker 7s ease-in-out infinite;
        animation-timeline: scroll(root), auto;
        animation-range: 0 1000px, normal;
      }
      /* the words sink a little and fade out over the first 700px */
      .copy {
        animation: rise-away linear both;
        animation-timeline: scroll(root);
        animation-range: 0 700px;
      }
    }
  }
  @keyframes sink {
    to { transform: translate3d(0, calc(var(--k) * 1000px), 0); }
  }
  @keyframes rise-away {
    to { transform: translate3d(0, 210px, 0); opacity: 0; }
  }
  /* depth: the farther a layer, the softer it is. Only with a mouse on a wide screen: Safari blurs
     on the CPU, and at phone size the softening barely shows. The blur is an SVG filter inside the
     layer, so it's painted into the layer once; a CSS filter on the moving layer itself would make
     the GPU blur the whole screen-sized layer again on every scroll frame */
  @media (min-width: 760px) and (hover: hover) {
    .soft {
      filter: url(#hero-far-blur);
    }
    .softer {
      filter: url(#hero-mid-blur);
    }
  }
  .stars circle {
    fill: #fff;
    animation: twinkle 3.2s ease-in-out var(--d) infinite alternate;
  }
  @keyframes twinkle {
    from { opacity: 0.35; }
    to { opacity: 1; }
  }
  .moon {
    fill: #f4f1d8;
    stroke: var(--ink);
    stroke-width: 3;
    vector-effect: non-scaling-stroke;
  }
  .crater {
    fill: #dcd6b4;
  }
  .far {
    fill: #1c3453;
  }
  /* the spruces: the whole crown one flat color, the trunk its own; the outline is drawn first
     and the skirts filled over it, so it only shows around the tree's silhouette */
  .far-crown {
    fill: #1d3c55;
  }
  .far-trunk {
    fill: #2c3346;
  }
  .mid {
    fill: #163449;
  }
  .mid-trunk {
    fill: #33293a;
    stroke: #0a1220;
    stroke-width: 3;
  }
  .mid .outline {
    stroke: #0a1220;
    stroke-width: 6;
    stroke-linejoin: round;
  }
  .front {
    fill: #0e2536;
  }
  .front-trunk {
    fill: #2a1d24;
    stroke: #05090f;
    stroke-width: 4;
  }
  .front .outline {
    stroke: #05090f;
    stroke-width: 8;
    stroke-linejoin: round;
  }
  .house {
    fill: #10223a;
    stroke: #05090f;
    stroke-width: 3;
    stroke-linejoin: round;
  }
  .lit {
    fill: #ffcf5c;
    stroke: #05090f;
    stroke-width: 2.5;
  }
  /* firelight: the glow and the fire flicker unevenly as one, on the lights layer's opacity */
  .flame {
    fill: #ff8a2a;
    opacity: 0.45;
  }
  .lights {
    animation: flicker 7s ease-in-out infinite;
  }
  @keyframes flicker {
    0% { opacity: 0.7; }
    12% { opacity: 0.95; }
    22% { opacity: 0.78; }
    35% { opacity: 1; }
    48% { opacity: 0.82; }
    60% { opacity: 0.96; }
    74% { opacity: 0.74; }
    88% { opacity: 0.9; }
    100% { opacity: 0.7; }
  }
  .pane {
    stroke: #8a5a1c;
    stroke-width: 2;
  }
  .fog {
    fill: #cfe0f5;
    opacity: 0.12;
  }
  .f2 {
    opacity: 0.1;
  }
  /* scrolled past: every loop in the hero (stars, flicker, the kittens) stops until it's back */
  .idle :global(:not(.layer, .copy)) {
    animation-play-state: paused !important;
  }
  .ground {
    fill: #10233a;
    stroke: #05090f;
    stroke-width: 3;
  }
  .tufts {
    fill: none;
    stroke: #2c4a6b;
    stroke-width: 2.5;
    stroke-linecap: round;
  }

  .copy {
    position: relative;
    z-index: 2;
    will-change: transform, opacity;
    width: 100%;
    padding: clamp(48px, 9vh, 110px) var(--pad) 0;
  }
  .copy :global(.hero-title) {
    max-width: 11ch;
    color: var(--paper);
    text-shadow: 0 4px 0 rgba(5, 9, 15, 0.6);
  }
  .copy :global(.hero-sub) {
    margin-top: 18px;
    max-width: 34ch;
    color: #dce8f5;
  }
  .facts {
    list-style: none;
    margin: 20px 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .facts .chip {
    color: var(--ink);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px 24px;
    margin-top: 26px;
  }
  .story {
    color: #dce8f5;
  }
  .story :global(.icon) {
    animation: nudge 2.2s var(--ease-out) infinite;
  }
  @keyframes nudge {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(6px); }
  }

  .land {
    position: absolute;
    z-index: 3;
    left: 0;
    bottom: -1px;
    width: 100%;
    height: calc(var(--hh) + 1px);
    background: var(--land) var(--grain);
    clip-path: url(#hero-land);
  }
  .hills {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: clamp(48px, 7vw, 90px);
    z-index: 3;
  }
  .hills {
    overflow: visible;
  }
  .hills .edge {
    fill: none;
    stroke: var(--ink);
    stroke-width: 3;
    vector-effect: non-scaling-stroke;
  }

  @media (min-width: 760px) {
    .copy {
      max-width: calc(1120px + 2 * var(--pad));
      margin: 0 auto;
      padding-top: clamp(80px, 14vh, 150px);
      /* the cats' row under the chips stays free, however long the text gets */
      padding-bottom: 22svh;
    }
  }
  /* phones: room for the cats under the words, so a longer text grows the hero instead of
     running into them (the cats sit in the scene's bottom fifth) */
  @media (max-width: 759px) {
    .copy {
      padding-bottom: 30svh;
    }
  }
  /* short phones (a folded Duo, an iPhone SE): tighter spacing lifts the links clear of the cats */
  @media (max-width: 759px) and (max-height: 740px) {
    .copy {
      padding-top: 30px;
    }
    .copy :global(.hero-sub) {
      margin-top: 12px;
      max-width: 40ch;
      font-size: 1.15rem;
    }
    .facts {
      margin-top: 14px;
    }
    .actions {
      margin-top: 18px;
    }
  }
  /* tablets and an unfolded Duo: the cats sit mid-scene, so the second link goes under the button,
     out of their way */
  @media (min-width: 760px) and (max-width: 1099px) {
    .actions {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
  /* wide but short (an unfolded Duo, a tablet on its side): the headline sizes to the height, so the
     words clear the cats at the bottom of the scene */
  @media (min-width: 760px) and (max-height: 760px) {
    /* the hills at the bottom stay in view, so the first screen shows there is more below */
    .hero {
      min-height: max(100svh, 600px);
    }
    .copy {
      padding-top: clamp(36px, 8vh, 64px);
      /* the cats' row stays free under the chips */
      padding-bottom: 26svh;
    }
    .copy :global(.hero-title) {
      font-size: clamp(2.8rem, 10.5vh, 5.8rem);
    }
    .copy :global(.hero-sub) {
      margin-top: 12px;
    }
    .facts {
      margin-top: 14px;
    }
    .actions {
      margin-top: 18px;
    }
  }
  /* very wide screens: the words grow with the screen, so they don't sit small in a big forest */
  @media (min-width: 1800px) {
    .copy {
      zoom: 1.2;
    }
  }
  @media (min-width: 2300px) {
    .copy {
      zoom: 1.4;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .stars circle, .lights, .story :global(.icon) { animation: none; }
  }
</style>
