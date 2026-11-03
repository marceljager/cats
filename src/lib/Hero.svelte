<script>
  import { onMount } from 'svelte';
  import Text from './Text.svelte';
  import Icon from './Icon.svelte';
  import Kittens from './Kittens.svelte';
  import Button from './Button.svelte';
  import ShareButton from './ShareButton.svelte';
  import Drawn from './Drawn.svelte';
  import { drawn } from './drawn.js';
  import { cats } from '../content.js';
  import { layer } from './forest.js';

  // parallax: each layer of the forest is its own element, moved by a transform per scroll frame, so
  // the phone's GPU slides finished layers instead of repainting the scene. Off screen, the loops stop.
  let hero;
  let idle = $state(false);
  onMount(() => {
    const io = new IntersectionObserver(([e]) => (idle = !e.isIntersecting));
    io.observe(hero);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => io.disconnect();
    const layers = [...hero.querySelectorAll('[data-speed]')].map((el) => [el, Number(el.dataset.speed)]);
    const copy = hero.querySelector('.copy');
    let raf = 0;
    let last = -1;
    const frame = () => {
      raf = 0;
      const y = Math.min(window.scrollY, hero.offsetHeight * 1.2);
      if (y === last) return;
      last = y;
      for (const [el, k] of layers) el.style.transform = `translate3d(0, ${(y * k).toFixed(1)}px, 0)`;
      copy.style.transform = `translate3d(0, ${(y * 0.3).toFixed(1)}px, 0)`;
      copy.style.opacity = String(Math.max(0, 1 - y / 700));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    frame();
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  });

  const far = layer(3, 26, -40, 1480, 760, 200, 330, [[860, 960]]);
  const mid = layer(9, 14, -60, 1500, 930, 420, 560, [[600, 1000]]);
  // the big front trees are rooted well below the frame, so their trunks run down behind the hills
  const front = [
    ...layer(21, 3, -80, 260, 1010, 620, 740),
    ...layer(33, 3, 1180, 1520, 1010, 640, 760),
  ];
</script>

<header class="hero" class:idle bind:this={hero}>
  <!-- the cold forest under Velebit at night; the two of them looking at the one warm window.
       Every layer is its own SVG (same viewBox, stacked), so it can move and blur as one finished
       picture; the flicker of the window has a layer of its own -->
  <div class="scene" aria-hidden="true">
    <svg class="layer sky" data-speed="0.5" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
      <defs>
        <radialGradient id="moonglow">
          <stop offset="0" stop-color="#f4f1d8" stop-opacity="0.35" />
          <stop offset="1" stop-color="#f4f1d8" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle cx="1190" cy="150" r="150" fill="url(#moonglow)" />
      <Drawn id="F1">
        <g class="stars">
          {#each [[120, 80, 1.6], [260, 170, 1.2], [420, 60, 1.4], [560, 140, 1], [690, 50, 1.6], [820, 120, 1.2], [980, 70, 1.4], [1090, 180, 1], [1250, 260, 1.3], [1380, 120, 1.5], [340, 260, 1], [760, 230, 1.3], [620, 300, 1], [900, 300, 1.2]] as [sx, sy, sr], i}
            <circle cx={sx} cy={sy} r={sr * 1.6} style="--d:{(i % 5) * 0.7}s" />
          {/each}
        </g>
        <circle class="moon" cx="1190" cy="150" r="54" />
        <circle class="crater" cx="1172" cy="138" r="10" />
        <circle class="crater" cx="1206" cy="170" r="7" />
        <circle class="crater" cx="1210" cy="128" r="5" />
      </Drawn>
    </svg>

    <!-- the window's glow and the fire in it, flickering together: the flicker is this one small
         layer's opacity, so nothing else repaints for it -->
    {#snippet lights()}
      <svg class="layer lights" data-speed="0.38" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
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
    <!-- with a hand-drawn forest the glow shows around the house, behind the drawing -->
    {#if drawn('F2')}{@render lights()}{/if}
    <svg class="layer back soft" data-speed="0.38" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
      <Drawn id="F2">
        <!-- the distant forest floor: one dark mass the far trees grow out of, no hard edge -->
        <path class="far" d="M-40 1100 V772 C120 762 260 780 420 770 S760 764 900 774 S1240 762 1480 772 V1100 Z" />
        {#each far as t}<path class="far-trunk" d={t.trunk} /><g class="far-crown">{#each t.tiers as d}<path {d} />{/each}</g>{/each}
        <!-- the apartment in the distance -->
        <path class="house" d="M872 760 V706 L912 676 L952 706 V760 Z" />
        <rect class="lit" x="900" y="716" width="24" height="20" rx="2" />
        <path class="pane" d="M912 716 V736 M900 726 H924" />
      </Drawn>
      <ellipse class="fog f1" cx="500" cy="760" rx="520" ry="34" />
    </svg>
    {#if !drawn('F2')}{@render lights()}{/if}

    <svg class="layer middle softer" data-speed="0.28" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
      <Drawn id="F3">
        {#each mid as t}<path class="mid-trunk" d={t.trunk} /><g class="mid">{#each t.tiers as d}<path class="outline" {d} />{/each}{#each t.tiers as d}<path {d} />{/each}</g>{/each}
      </Drawn>
    </svg>

    <svg class="layer near" data-speed="0.2" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
      <!-- the flat forest floor the kittens sit on, running on down behind the hills -->
      <Drawn id="F4">
        <path class="ground" d="M-20 1100 V832 C200 812 420 824 640 818 C860 812 1100 826 1460 812 V1100 Z" />
        <path class="tufts" d="M220 846 l4 -12 l4 12 M236 850 l3 -10 l3 10 M1010 842 l4 -12 l4 12 M1028 846 l3 -9 l3 9 M560 840 l3 -10 l3 10 M1180 846 l4 -11 l4 11" />
      </Drawn>
      <!-- the kittens, huddled, looking toward the window -->
      <Kittens cold />
      <ellipse class="fog f2" cx="1000" cy="850" rx="560" ry="30" />
    </svg>

    <svg class="layer fore" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
      <Drawn id="F5">
        {#each front as t}<path class="front-trunk" d={t.trunk} /><g class="front">{#each t.tiers as d}<path class="outline" {d} />{/each}{#each t.tiers as d}<path {d} />{/each}</g>{/each}
      </Drawn>
    </svg>
  </div>

  <ShareButton />

  <div class="wrap copy">
    <Text variant="display" class="hero-title">Ahoj, jsme {cats[0].name} a&nbsp;{cats[1].name}.</Text>
    <Text variant="lede" class="hero-sub">
      Náš příběh začal v&nbsp;chorvatském pohoří Velebit, kde nás někdo vyhodil a&nbsp;nechal, ať zamrzneme. Lidi i&nbsp;tak milujeme a&nbsp;nejradši jsme pořád s&nbsp;nimi. Teď už jsme v&nbsp;teple, ale pořád čekáme na to hlavní – na rodinu, která si nás nechá napořád.
    </Text>
    <ul class="facts" aria-label="Kdo jsme">
      <li class="chip">sourozenci, {cats[0].sex} + {cats[1].sex}</li>
      <li class="chip">{cats[0].age}</li>
      <li class="chip">mazliví, učenliví a&nbsp;stateční</li>
      <li class="chip">k&nbsp;adopci v&nbsp;Praze a&nbsp;okolí</li>
    </ul>
    <div class="actions">
      <Button href="#domov">Chci je poznat <Icon name="right" size={24} /></Button>
      <span class="story"><Button href="#cesta" variant="link">Jak jsme se sem dostali <Icon name="down" size={22} /></Button></span>
    </div>
  </div>

  <!-- morning comes: green hills rising into the map below -->
  <svg class="hills" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
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
    mask:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 90' preserveAspectRatio='none'%3E%3Cpath d='M-10 52 C120 18 240 14 360 40 C480 66 560 70 700 38 C840 8 960 10 1080 40 C1200 70 1320 64 1450 30 V-10 H-10 Z'/%3E%3C/svg%3E") 0 calc(100% + 1.5px) / 100% var(--hh) no-repeat,
      linear-gradient(#000, #000) 0 0 / 100% calc(100% - var(--hh) + 2px) no-repeat;
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
  /* parallax: every layer sinks a little more than the one in front of it (the script sets each
     one's transform from its data-speed), so things only ever slip behind what is nearer; the big
     front trees stay put. A layer is moved and blurred as one finished picture, never redrawn */
  .layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    will-change: transform;
  }
  .fore {
    will-change: auto;
  }
  /* depth: the farther a layer, the softer it is */
  .soft {
    filter: blur(1.2px);
  }
  .softer {
    filter: blur(0.6px);
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
  .idle :global(*) {
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
  @media (prefers-reduced-motion: reduce) {
    .stars circle, .lights, .story :global(.icon) { animation: none; }
  }
</style>
