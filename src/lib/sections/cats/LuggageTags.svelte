<script>
  import { swing } from '../../motion/springs.js';
  import Icon from '../../ui/Icon.svelte';
  // a cat's facts as separate luggage tags: sex, age, who it's named after, and neutering when done
  let { cat } = $props();

  const boy = $derived(cat.sex === 'kluk');
  const ageNum = $derived(cat.age.match(/[\d–-]+/)?.[0] ?? cat.age);
  const ageUnit = $derived(cat.age.replace(/.*[\d–-]+\s*/, ''));
  // w = tag length, sized to its content
  const tags = $derived([
    { kind: 'sex', cap: 'POHLAVÍ', val: cat.sex, w: 150, fill: boy ? '#8fbbe0' : '#f4a6bd', shade: boy ? '#6f9fcb' : '#e08aa4', tilt: -6 },
    { kind: 'age', cap: 'VĚK', val: cat.age, w: 176, fill: '#f2c94c', shade: '#d9ab2a', tilt: 4 },
    { kind: 'name', cap: 'JMÉNO PO', val: cat.namedAfter, w: 176, fill: '#a6d58a', shade: '#86bb69', tilt: -3 },
    ...(cat.neutered ? [{ kind: 'neutered', cap: 'KASTRACE', val: cat.neutered, w: 214, fill: '#cdb8ea', shade: '#ae96d4', tilt: 5 }] : []),
  ]);
</script>

<ul class="tags">
  {#each tags as t}
    <li style="--w:{t.w}; rotate:{t.tilt}deg" use:swing={{ target: '.swing', base: 110, stiffness: 190, scroll: true, scrollScale: 0.7 }}>
      <svg class="tag" viewBox="-4 -6 {t.w + 8} 80" role="img" aria-label="{t.cap.toLowerCase()}: {t.val}">
        <g class="swing">
          <!-- tag: chamfered end, inked edge, printed dashed border -->
          <path class="body" style="fill:{t.fill}" d="M16 0 H{t.w - 6} Q{t.w} 0 {t.w} 6 V60 Q{t.w} 66 {t.w - 6} 66 H16 L0 50 V16 Z" />
          <path class="border" d="M19 6 H{t.w - 10} Q{t.w - 6} 6 {t.w - 6} 10 V52 Q{t.w - 6} 56 {t.w - 10} 56 H19 L7 45 V17 Z" />
          <!-- reinforced eyelet -->
          <circle class="grommet" cx="18" cy="33" r="9" />
          <circle class="hole" cx="18" cy="33" r="4.5" />
          <text class="cap" x="38" y="24">{t.cap}</text>

          {#if t.kind === 'sex'}
            <g transform="translate(34 27)"><Icon name={boy ? 'boy' : 'girl'} size={30} tone="paper" /></g>
            <text class="val" x="68" y="50">{cat.sex}</text>
          {:else if t.kind === 'age'}
            <text class="val" x="38" y="51"><tspan class="big">{ageNum}</tspan> {ageUnit}</text>
          {:else if t.kind === 'neutered'}
            <g transform="translate(36 28)"><Icon name="check" size={28} /></g>
            <text class="val" x="72" y="50">{t.val}</text>
          {:else}
            {#if cat.namedIcon === 'mountains'}
              <g transform="translate(36 26)"><Icon name="mountains" size={32} /></g>
            {:else}
              <g transform="translate(38 28)"><Icon name="pin" size={28} /></g>
            {/if}
            <text class="val" x="76" y="50">{cat.namedAfter}</text>
          {/if}
        </g>
      </svg>
    </li>
  {/each}
</ul>

<style>
  .tags {
    list-style: none;
    margin: 14px 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px 14px;
  }
  .tags li {
    /* every tag at the same height, length from its content */
    width: calc(var(--w) * 0.78px + 6px);
  }
  .tag {
    display: block;
    width: 100%;
    overflow: visible;
  }
  /* every outline at a true 3px, whatever size the tag is drawn at, like the page's other cards
     (the icons on the tags keep their own outline) */
  .body,
  .border,
  .grommet,
  .hole {
    vector-effect: non-scaling-stroke;
  }
  .body {
    stroke: var(--ink);
    stroke-width: 3;
    stroke-linejoin: round;
    filter: drop-shadow(0 7px 5px rgba(40, 60, 15, 0.3));
  }
  .border {
    fill: none;
    stroke: rgba(22, 19, 17, 0.35);
    stroke-width: 1.5;
    stroke-dasharray: 4 4;
  }
  .grommet {
    fill: #d9b45a;
    stroke: var(--ink);
    stroke-width: 3;
  }
  .hole {
    fill: var(--paper);
    stroke: var(--ink);
    stroke-width: 2;
  }
  .cap {
    font-family: var(--f-label);
    font-variation-settings: 'wdth' 70;
    font-weight: 800;
    font-size: 11.5px;
    letter-spacing: 0.12em;
    fill: var(--ink);
  }
  .val {
    font-family: var(--f-marker);
    font-weight: 800;
    font-size: 21px;
    fill: var(--ink);
  }
  .big {
    font-size: 25px;
    fill: var(--route);
  }
  /* still at rest; the tag you point at swings on its eyelet and settles, keeping its place in the pile */
  .tags li {
    position: relative;
  }
  .swing {
    transform-origin: 18px 33px;
  }
  /* desktop: all three in one row, each as long as its content needs (a tablet's page is too narrow) */
  @media (min-width: 1024px) {
    .tags {
      flex-wrap: nowrap;
      align-items: flex-start;
      gap: 0;
      padding-bottom: 14px;
    }
    /* a loose little pile: each tag lies over the one before it, a bit off level */
    .tags li + li {
      margin-left: -30px;
    }
    .tags li:nth-child(2) {
      margin-top: 14px;
    }
    .tags li:nth-child(3) {
      margin-top: 4px;
    }
    .tags li {
      width: auto;
      min-width: 0;
      flex: calc(var(--w) + 8) 1 0;
    }
  }
</style>
