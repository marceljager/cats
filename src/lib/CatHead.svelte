<svelte:options namespace="svg" />

<script>
  // A cat's big caricature head that bobbles on its neck, for use inside any <svg>.
  // Shows the cat's photo (cats[].head in content.js) or a drawn placeholder face until then.
  //   cat   'velik' | 'polly'
  //   cx/cy centre, r radius (the ears reach above it)
  //   mood  'cold' (wide eyes) | 'happy' (smiling, blushing) | 'calm'
  //   look  -1…1, where the eyes glance (placeholder only)
  //   tilt  resting lean in degrees; delay staggers the bobble
  import { cats } from '../content.js';
  import { swing } from './springs.js';
  import { pick } from './images.js';

  let { cat, cx = 0, cy = 0, r = 30, mood = 'calm', look = 0, tilt = 0, delay = 0, wobble = true } = $props();

  const id = $props.id();
  const data = $derived(cats.find((c) => c.id === cat));
  const photo = $derived(data?.head ?? null);
  // an SVG <image> has no srcset: one WebP big enough for the largest head on a sharp screen
  const file = $derived(photo && pick(photo, 480, 'webp'));
  // a transparent PNG cut-out of just the head sits as it is; any other photo is cropped to a circle
  const cutout = $derived(data?.headCutout ?? (photo ? /\.(png|webp)$/i.test(photo) : false));
  // a cut-out is sized so its face is as wide as the drawn face (2r) and centred where it sits;
  // without headFrame the whole image is fitted to the head's box
  const fit = $derived.by(() => {
    const f = data?.headFrame;
    if (!f) return { x: -1.4 * r, y: -1.55 * r, w: 2.8 * r, h: 2.8 * r };
    const w = (2 * r) / f.w;
    const h = w / f.ratio;
    return { x: -f.x * w, y: -f.y * h, w, h };
  });
  const fur = $derived(cat === 'polly' ? '#f3ead6' : '#fbfaf5');
  const ear = (side) =>
    `M ${side * 0.86 * r} ${-0.32 * r} L ${side * 0.64 * r} ${-1.28 * r} L ${side * 0.1 * r} ${-0.84 * r} Z`;
  const inner = (side) =>
    `M ${side * 0.72 * r} ${-0.46 * r} L ${side * 0.62 * r} ${-1.02 * r} L ${side * 0.3 * r} ${-0.8 * r} Z`;
</script>

<g class="head" transform="translate({cx} {cy}) rotate({tilt})">
  <g class="nudge" use:swing={{ rub: true, base: 160, max: 280, lean: 18, stiffness: 140, damping: 4.4 }}>
  <g class="bob" class:still={!wobble} style="--d:{delay}s">
    {#if photo}
      {#if cutout}
        <image href={file} x={fit.x} y={fit.y} width={fit.w} height={fit.h} preserveAspectRatio="xMidYMid meet" />
      {:else}
        <clipPath id="clip-{id}"><circle r={r} /></clipPath>
        <image href={file} x={-r} y={-r} width={2 * r} height={2 * r} preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-{id})" />
        <circle class="ring" r={r} />
      {/if}
    {:else}
      <!-- placeholder face, to be replaced by the cat's photo -->
      <path class="ear" style="fill:{fur}" d={ear(-1)} />
      <path class="ear" style="fill:{fur}" d={ear(1)} />
      <path class="inner" d={inner(-1)} />
      <path class="inner" d={inner(1)} />
      <ellipse class="face" style="fill:{fur}" rx={r} ry={r * 0.9} />
      {#if mood === 'happy'}
        <path class="lid" d="M {-0.46 * r} {-0.02 * r} q {0.13 * r} {-0.15 * r} {0.26 * r} 0 M {0.2 * r} {-0.02 * r} q {0.13 * r} {-0.15 * r} {0.26 * r} 0" />
        <circle class="blush" cx={-0.56 * r} cy={0.22 * r} r={0.13 * r} />
        <circle class="blush" cx={0.56 * r} cy={0.22 * r} r={0.13 * r} />
      {:else}
        {@const er = mood === 'cold' ? 0.17 : 0.14}
        {#each [-1, 1] as s}
          <ellipse class="eye" cx={s * 0.33 * r} cy={-0.06 * r} rx={er * r} ry={er * 1.2 * r} />
          <circle class="pupil" cx={s * 0.33 * r + look * 0.06 * r} cy={-0.04 * r} r={er * 0.55 * r} />
          <circle class="glint" cx={s * 0.33 * r + look * 0.06 * r + 0.04 * r} cy={-0.1 * r} r={0.035 * r} />
        {/each}
      {/if}
      <path class="nose" d="M {-0.07 * r} {0.18 * r} h {0.14 * r} l {-0.07 * r} {0.08 * r} Z" />
      <path class="mouth" d="M 0 {0.26 * r} q {-0.08 * r} {0.12 * r} {-0.17 * r} {0.04 * r} M 0 {0.26 * r} q {0.08 * r} {0.12 * r} {0.17 * r} {0.04 * r}" />
      <path class="whisk" d="M {-0.5 * r} {0.2 * r} l {-0.42 * r} {-0.06 * r} M {-0.5 * r} {0.3 * r} l {-0.4 * r} {0.08 * r} M {0.5 * r} {0.2 * r} l {0.42 * r} {-0.06 * r} M {0.5 * r} {0.3 * r} l {0.4 * r} {0.08 * r}" />
    {/if}
  </g>
  </g>
</g>

<style>
  .head :global(*) {
    vector-effect: non-scaling-stroke;
  }
  .ear,
  .face,
  .ring {
    stroke: var(--ink);
    stroke-width: 3;
    stroke-linejoin: round;
  }
  .ring {
    fill: none;
  }
  .inner {
    fill: #f2a9a0;
  }
  .eye {
    fill: #fff;
    stroke: var(--ink);
    stroke-width: 2;
  }
  .pupil {
    fill: var(--ink);
  }
  .glint {
    fill: #fff;
  }
  .lid,
  .mouth,
  .whisk {
    fill: none;
    stroke: var(--ink);
    stroke-width: 2;
    stroke-linecap: round;
  }
  .whisk {
    stroke-width: 1.5;
  }
  .nose {
    fill: #e58a7d;
    stroke: var(--ink);
    stroke-width: 1.5;
    stroke-linejoin: round;
  }
  .blush {
    fill: #f2a093;
    opacity: 0.75;
  }

  /* bobblehead: the head sways on its neck; pointing at it gives it a springy boing (see .nudge) */
  .bob {
    transform-box: fill-box;
    transform-origin: 50% 92%;
    animation: bob 2.8s ease-in-out var(--d) infinite alternate;
  }
  .bob.still {
    animation: none;
  }
  .nudge {
    transform-box: fill-box;
    transform-origin: 50% 92%;
  }
  @keyframes bob {
    from { rotate: -4deg; }
    to { rotate: 4deg; }
  }
  @media (prefers-reduced-motion: reduce) {
    .bob {
      animation: none;
    }
  }
</style>
