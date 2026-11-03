<script module>
  const ring = (cx, cy, r, ri) =>
    `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z M${cx - ri} ${cy} a${ri} ${ri} 0 1 0 ${2 * ri} 0 a${ri} ${ri} 0 1 0 ${-2 * ri} 0 Z`;
  const rounded = (x, y, w, h, r) =>
    `M${x + r} ${y} H${x + w - r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + h - r} A${r} ${r} 0 0 1 ${x + w - r} ${y + h} H${x + r} A${r} ${r} 0 0 1 ${x} ${y + h - r} V${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} Z`;

  // the hand-drawn arrow, drawn out for each direction so its shade always falls bottom-right
  const ARROW = {
    right: 'M2.4 13.6 C8.3 12.4 13 13 17.8 12.4 L16.6 7.1 C21.3 10.1 26.1 13 30.2 16 C26.1 19 21.3 21.9 16.6 24.9 L17.8 19.6 C13 19 8.3 19.6 2.4 18.4 C1.2 16.6 1.2 15.4 2.4 13.6 Z',
    left: 'M29.6 13.6 C23.7 12.4 19 13 14.2 12.4 L15.4 7.1 C10.7 10.1 5.9 13 1.8 16 C5.9 19 10.7 21.9 15.4 24.9 L14.2 19.6 C19 19 23.7 19.6 29.6 18.4 C30.8 16.6 30.8 15.4 29.6 13.6 Z',
    down: 'M18.4 2.4 C19.6 8.3 19 13 19.6 17.8 L24.9 16.6 C21.9 21.3 19 26.1 16 30.2 C13 26.1 10.1 21.3 7.1 16.6 L12.4 17.8 C13 13 12.4 8.3 13.6 2.4 C15.4 1.2 16.6 1.2 18.4 2.4 Z',
  };

  // every icon as a list of blocks: ['part', d, tone, evenodd?] | ['line', d] | ['shine', d] | ['dot', d].
  // Exported, so a drawing that needs an icon's shape in its own styling (the map's pin) uses the same paths.
  /** @typedef {['part', string, string, boolean?] | ['line' | 'shine' | 'dot', string]} Block */
  /** @satisfies {Record<string, Block[]>} */
  export const ICONS = {
    mail: [
      ['part', rounded(3, 7, 26, 19, 3.5), 'paper'],
      ['line', 'M4.6 9 L16 17.4 L27.4 9'],
    ],
    instagram: [
      ['part', rounded(3.5, 3.5, 25, 25, 8), 'pink'],
      ['shine', 'M8 10.5 c1 -1.6 2.4 -2.3 4 -2.5'],
      ['part', ring(16, 16, 6, 2.6), 'paper', true],
      ['part', 'M21.2 9 a1.8 1.8 0 1 0 3.6 0 a1.8 1.8 0 1 0 -3.6 0 Z', 'paper'],
    ],
    pin: [
      ['part', 'M16 29s-9-8-9-15a9 9 0 0 1 18 0c0 7-9 15-9 15Z', 'red'],
      ['shine', 'M10.3 12 a6.2 6.2 0 0 1 3 -3.8'],
      ['part', 'M12.4 14 a3.6 3.6 0 1 0 7.2 0 a3.6 3.6 0 1 0 -7.2 0 Z', 'paper'],
    ],
    check: [['part', 'M3.5 16.5 L8.5 12.2 L13 17 L24.5 4.5 L29 8.6 L13.2 26 Z', 'green']],
    heart: [
      ['part', 'M16 28S3.5 21 3.5 11.6A6.6 6.6 0 0 1 16 8.2a6.6 6.6 0 0 1 12.5 3.4C28.5 21 16 28 16 28Z', 'red'],
      ['shine', 'M6.8 11.6 a4 4 0 0 1 3 -3.4'],
    ],
    camera: [
      ['part', 'M4 11.5 Q4 9.5 6 9.5 H10 L12 6.5 H20 L22 9.5 H26 Q28 9.5 28 11.5 V24 Q28 26 26 26 H6 Q4 26 4 24 Z', 'blue'],
      ['shine', 'M7.2 16.5 v-2.8'],
      ['part', ring(16, 17.6, 5.6, 2.4), 'paper', true],
      ['dot', 'M13.6 17.6 a2.4 2.4 0 1 0 4.8 0 a2.4 2.4 0 1 0 -4.8 0 Z'],
    ],
    right: [['part', ARROW.right, 'paper']],
    left: [['part', ARROW.left, 'paper']],
    down: [['part', ARROW.down, 'paper']],
    close: [['part', 'M8 4.5 L16 12.5 L24 4.5 L27.5 8 L19.5 16 L27.5 24 L24 27.5 L16 19.5 L8 27.5 L4.5 24 L12.5 16 L4.5 8 Z', 'red']],
    home: [
      ['part', 'M7 15.5 L16 7.5 L25 15.5 V27.5 H7 Z', 'paper'],
      ['part', 'M14 19.5 h4 a1 1 0 0 1 1 1 V27.5 H13 V20.5 a1 1 0 0 1 1 -1 Z', 'brown'],
      ['part', 'M3 16 L16 4.5 L29 16 L26.6 18.4 L16 9.2 L5.4 18.4 Z', 'red'],
    ],
    cats: [
      ['part', 'M3 27 C2 21 4 17 6 15 L6 7 C9 9 11 11 12 13 Q14 12 16 13 C17 11 19 9 21 7 L21 15 C23 17 24 21 23 27 Z', 'paper'],
      ['part', 'M15 27 C15 23 16 21 18 20 L18 15 C20 16 21 17 22 18 Q24 17.5 25 18 C26 17 27 16 29 15 L29 20 C31 21 31 24 31 27 Z', 'cream'],
    ],
    copy: [
      ['part', rounded(10, 3.5, 17, 20, 3), 'cream'],
      ['part', rounded(5, 8.5, 17, 20, 3), 'paper'],
      ['line', 'M9 15 h9 M9 19 h9 M9 23 h5.5'],
    ],
    // a paper plane: sending us on, with a little swoosh behind it
    share: [
      ['line', 'M3.2 28.2 C6.2 27.6 8.4 26.2 10 23.8'],
      ['part', 'M2.5 15.6 L29.5 3 L13.4 19.4 Z', 'blue'],
      ['part', 'M13.4 19.4 L29.5 3 L21.8 28.6 Z', 'paper'],
      ['part', 'M13.4 19.4 L17.9 24 L13.2 28 Z', 'slate'],
      ['shine', 'M7.4 14.6 L14.2 11.4'],
    ],
    whatsapp: [
      ['part', 'M16 3.2 A12.6 12.6 0 1 1 9.5 26.6 L3.2 28.8 L5.4 22.8 A12.6 12.6 0 0 1 16 3.2 Z', 'green'],
      ['shine', 'M21.2 7.2 a9.8 9.8 0 0 1 3.9 4'],
      ['part', 'M11.2 8.6 C8.9 9.1 8 11.5 8.8 14 C10.3 18.4 13.6 21.7 18 23.2 C20.5 24 22.9 23.1 23.4 20.8 L19.9 18.3 L17.8 19.9 C15.6 19 14 17.4 13.1 15.2 L14.7 13.1 Z', 'paper'],
    ],
    facebook: [
      ['part', rounded(3.5, 3.5, 25, 25, 7), 'fb'],
      ['shine', 'M8 10.5 c1 -1.6 2.4 -2.3 4 -2.5'],
      ['part', 'M16.3 28.5 V18.8 H13.2 V14.3 H16.3 V12 C16.3 8.5 18.5 6.6 21.8 6.6 C23.2 6.6 24.4 6.7 25.1 6.8 V10.9 H23 C21.7 10.9 21.2 11.5 21.2 12.7 V14.3 H25 L24.4 18.8 H21.2 V28.5 Z', 'paper'],
    ],
    // two chain links: the page's address to paste anywhere
    link: [
      ['part', 'M18.44 21.48 A5.6 5.6 0 0 0 10.52 13.56 L6.56 17.52 A5.6 5.6 0 0 0 14.48 25.44 Z M15.96 19.01 A2.1 2.1 0 0 0 12.99 16.04 L9.04 19.99 A2.1 2.1 0 0 0 12.01 22.96 Z', 'gold', true],
      ['part', 'M25.44 14.48 A5.6 5.6 0 0 0 17.52 6.56 L13.56 10.52 A5.6 5.6 0 0 0 21.48 18.44 Z M22.96 12.01 A2.1 2.1 0 0 0 19.99 9.04 L16.04 12.99 A2.1 2.1 0 0 0 19.01 15.96 Z', 'gold', true],
      ['shine', 'M18.4 7.6 l2.2 -2.2'],
    ],
    boy: [
      ['part', 'M15.4 14 L22.2 7.1 L20.4 5.3 L28.5 3.5 L26.7 11.6 L24.9 9.8 L18 16.6 Z', 'blue'],
      ['part', ring(12.5, 19.5, 8, 4.3), 'blue', true],
      ['shine', 'M7.4 17.2 a5.9 5.9 0 0 1 3 -3'],
    ],
    girl: [
      ['part', 'M14.1 18 H17.9 V22.6 H21.8 V26.4 H17.9 V30.2 H14.1 V26.4 H10.2 V22.6 H14.1 Z', 'pink'],
      ['part', ring(16, 11.5, 8, 4.3), 'pink', true],
      ['shine', 'M10.9 9.2 a5.9 5.9 0 0 1 3 -3'],
    ],
    mountains: [
      ['part', 'M2 26.5 L13 7 L24 26.5 Z', 'rock'],
      ['part', 'M13 7 L9.3 13.6 L11.4 12.4 L13 14.2 L15 12.4 L16.7 13.6 Z', 'paper'],
      ['part', 'M14 26.5 L22 13 L30 26.5 Z', 'slate'],
    ],
  };
</script>

<script>
  // @ts-check
  // cartoon icons, all built from the same three blocks so they always match:
  //   part(d, tone)  a filled shape: flat colour, a cel shade along its lower-right edge
  //                  (clipped inside the shape, so it never spills over the outline), ink outline on top
  //   line(d)        an open ink stroke, same width as every outline
  //   shine(d)       one white highlight stroke, same everywhere
  // Parts are drawn in order, so a later part sits on top of the earlier ones.
  //   tone  recolours every part, e.g. 'paper' on a background of the icon's own colour
  /** @type {{ name: keyof typeof ICONS, size?: number, label?: string, tone?: string }} */
  let { name, size = 24, label = '', tone: recolour = undefined } = $props();
  const uid = $props.id();

  const blocks = $derived(ICONS[name] ?? []);
</script>

<svg
  class="icon {name}"
  width={size}
  height={size}
  viewBox="0 0 32 32"
  role={label ? 'img' : undefined}
  aria-label={label || undefined}
  aria-hidden={label ? undefined : 'true'}
>
  {#each blocks as [kind, d, tone, even], k}
    {#if kind === 'part'}
      <!-- part: shade colour underneath, the fill nudged up-left on top of it (clipped to the shape), outline last -->
      <clipPath id="{uid}-{k}"><path {d} clip-rule={even ? 'evenodd' : undefined} /></clipPath>
      <path {d} class="shade {recolour ?? tone}" fill-rule={even ? 'evenodd' : undefined} />
      <g clip-path="url(#{uid}-{k})">
        <path {d} class="fill {recolour ?? tone}" fill-rule={even ? 'evenodd' : undefined} transform="translate(-2.2 -2.2)" />
      </g>
      <path {d} class="line" />
    {:else if kind === 'line'}
      <path {d} class="line" />
    {:else if kind === 'shine'}
      <path {d} class="shine" />
    {:else if kind === 'dot'}
      <path {d} class="dot" />
    {/if}
  {/each}
</svg>

<style>
  .icon {
    flex: none;
    display: block;
    overflow: visible;
  }
  /* one outline width for every icon */
  .line {
    fill: none;
    stroke: var(--ink);
    stroke-width: 1.8;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  /* one highlight for every icon */
  .shine {
    fill: none;
    stroke: #fff;
    stroke-width: 1.8;
    stroke-linecap: round;
    opacity: 0.8;
  }
  .dot {
    fill: var(--ink);
  }

  /* tones: flat fill + the darker cel shade */
  .fill.paper { fill: var(--paper); }
  .shade.paper { fill: #e3d9bf; }
  .fill.red { fill: #e2483d; }
  .shade.red { fill: #b3281f; }
  .fill.pink { fill: #e0457f; }
  .shade.pink { fill: #b52c63; }
  .fill.blue { fill: #8fbbe0; }
  .shade.blue { fill: #5f93c2; }
  .fill.green { fill: #5cbf5f; }
  .shade.green { fill: #3a9440; }
  .fill.gold { fill: #f0c94e; }
  .shade.gold { fill: #c99a1e; }
  .fill.fb { fill: #3d74d6; }
  .shade.fb { fill: #2a55a6; }
  .fill.cream { fill: #f3ead6; }
  .shade.cream { fill: #dccdab; }
  .fill.brown { fill: #8a5a3b; }
  .shade.brown { fill: #6b4329; }
  .fill.rock { fill: #c9ccd0; }
  .shade.rock { fill: #a2a7ae; }
  .fill.slate { fill: #8f959d; }
  .shade.slate { fill: #6e747c; }
</style>
