<script>
  // cartoon map scenery: one place (a forest, Prague, the farm…) drawn from its pieces, which
  // scenery.js lays out; the kinds of place are listed there
  import { layoutPlace } from './scenery.js';
  let { kind, x = 0, y = 0, scale = 1, seed = 1, label = '', flip = false } = $props();
  const uid = $props.id(); // keeps clip-path ids apart between doodles

  const items = $derived(layoutPlace(kind, { seed, scale }));
</script>

<!-- a round leafy tree: a lumpy crown of three overlapping puffs on a short trunk that flares at
     the root. The outline is drawn first and the puffs filled over it, so it only shows around the
     crown's silhouette. The puffs are filled in shade, then again in light a little smaller and up to
     the left, so the shade only shows as a rim on the lower right, inside the crown -->
{#snippet roundTree(it)}
  {@const s = it.s}
  {@const puffs = [[-4.6, -13.4, 6.4], [4.4, -12.8, 6.8], [0, -19, 7.2]].map(([px, py, pr]) => [px * s, py * s, pr * s])}
  <g class="plant" class:sway={it.sway} style="--d:{it.delay}s" transform="translate({it.x} {it.y})">
    <ellipse class="shadow" cx={3 * s} cy="0" rx={10 * s} ry={3.2 * s} />
    <path class="trunk" d="M {-1.4 * s} {-9 * s} L {-1.6 * s} {-1.4 * s} Q {-1.8 * s} 0 {-3 * s} 0 H {3 * s} Q {1.8 * s} 0 {1.6 * s} {-1.4 * s} L {1.4 * s} {-9 * s} Z" />
    {#each puffs as [cx, cy, r]}<circle class="crown-line" {cx} {cy} {r} />{/each}
    {#each puffs as [cx, cy, r]}<circle class="crown-shade" {cx} {cy} {r} />{/each}
    {#each puffs as [cx, cy, r]}<circle class="crown" cx={cx - 1 * s} cy={cy - 1.2 * s} r={r - 1.6 * s} />{/each}
    <circle class="crown-hi" cx={-2.4 * s} cy={-22 * s} r={2.2 * s} />
  </g>
{/snippet}

<!-- a spruce: three tiers nested from the top, each with a softly drooping lower edge; outlined
     only around the whole silhouette, the right half of each tier in shade -->
{#snippet pine(it)}
  {@const s = it.s}
  {@const tiers = [[0, 9], [-6.5, 7.4], [-13, 5.8]].map(([dy, hw]) => {
    const y = (-4 + dy) * s;
    const top = -24 * s;
    const w = hw * s;
    return {
      d: `M 0 ${top} Q ${w * 0.45} ${y - (y - top) * 0.4} ${w} ${y} Q 0 ${y - 2.6 * s} ${-w} ${y} Q ${-w * 0.45} ${y - (y - top) * 0.4} 0 ${top} Z`,
      shade: `M 0 ${top} Q ${w * 0.45} ${y - (y - top) * 0.4} ${w} ${y} Q ${w * 0.5} ${y - 1.3 * s} 0 ${y - 1.3 * s} Z`, // the first half of the lower edge, exactly
    };
  })}
  <g class="plant" class:sway={it.sway} style="--d:{it.delay}s" transform="translate({it.x} {it.y})">
    <ellipse class="shadow" cx={3 * s} cy="0" rx={8 * s} ry={2.8 * s} />
    <rect class="trunk" x={-1.3 * s} y={-5.5 * s} width={2.6 * s} height={5.5 * s} />
    {#each tiers as t}<path class="needles-line" d={t.d} />{/each}
    {#each tiers as t}<path class="needles" d={t.d} /><path class="needles-shade" d={t.shade} />{/each}
  </g>
{/snippet}

<!-- chimney smoke, puffing -->
{#snippet smoke(it)}
  {@const s = it.s}
  {@const w = 16 * s}
  {@const top = -11 * s - 8 * s - 6 * s * 0.6}
  <g class="smoke" style="--d:{it.delay}s" transform="translate({it.x - w / 2} {it.y})">
    <circle cx={w / 2 + 7.2 * s + 1.5 * s} cy={top - 6 * s} r={2.6 * s} />
    <circle cx={w / 2 + 7.2 * s + 4 * s} cy={top - 11 * s} r={3.4 * s} />
  </g>
{/snippet}

<!-- a peak leaning a little, maybe with a shoulder (a small step halfway down one flank), a
     snowcap that ends in soft rounded drips, and light from the left; every peak's flanks run on
     down to the range's one baseline, where the range stands on its shadow -->
{#snippet peak(it)}
  {@const hw = it.w}
  {@const top = -it.h}
  {@const ax = it.lean * hw}
  {@const f = (n) => n.toFixed(1)}
  {@const at = (side, k) => [ax + (side * hw - ax) * k, top * (1 - k)]}
  {@const sh = it.shoulder ? [at(it.shoulder, 0.42), [at(it.shoulder, 0.52)[0] + it.shoulder * 3, at(it.shoulder, 0.48)[1]]] : []}
  {@const left = it.shoulder === -1 ? sh.slice().reverse() : []}
  {@const right = it.shoulder === 1 ? sh : []}
  {@const k = 1 + (12.5 - it.y) / it.h}
  {@const [bl, by] = at(-1, k)}
  {@const [br] = at(1, k)}
  {@const pts = (ends) => [ends[0], ...left, [ax, top], ...right, ends[1]].map(([px, py]) => `${f(px)} ${f(py)}`).join(' L ')}
  {@const outline = pts([[bl, by], [br, by]])}
  {@const kl = 1 + (10.5 - it.y) / it.h}
  {@const [lx, ly] = at(-1, 0.34)}
  {@const [rx, ry] = at(1, 0.3)}
  {@const drips = [0.25, 0.5, 0.75].map((u) => [lx + (rx - lx) * u, ly + (ry - ly) * u])}
  {@const snow = `M ${f(ax)} ${f(top)} L ${f(rx)} ${f(ry)}` + [...drips.slice().reverse(), [lx, ly]].map(([px, py], i, a) => {
    const [qx, qy] = i === 0 ? [rx, ry] : a[i - 1];
    return ` Q ${f((qx + px) / 2)} ${f(Math.max(qy, py) + (i % 2 ? -2 : 6))} ${f(px)} ${f(py)}`;
  }).join('') + ' Z'}
  <g transform="translate({it.x} {it.y})">
    <path class="rock" d="M {outline} Z" />
    <path class="snow" d={snow} />
    <!-- light from the left: the right face in shadow, snow included; its ridge zigzags down -->
    <path class="rock-shade" d="M {f(ax)} {f(top)} {right.map(([px, py]) => `L ${f(px)} ${f(py)}`).join(' ')} L {f(br)} {f(by)} L {f(ax * 0.4 + hw * 0.12)} {f(by)} L {f(ax + hw * 0.16)} {f(top * 0.45)} L {f(ax + hw * 0.04)} {f(top * 0.62)} Z" />
    <!-- the line stops just above the baseline, so no stroke ends peek out under the peaks in front -->
    <path class="rock-line" d="M {pts([at(-1, kl), at(1, kl)])}" />
  </g>
{/snippet}

<g class="doodle {kind}" transform="translate({x} {y}) scale({flip ? -scale : scale} {scale})">
  {#each items as it}
    {#if it.t === 'tree'}
      {@render roundTree(it)}
    {:else if it.t === 'pine'}
      {@render pine(it)}
    {:else if it.t === 'peak'}
      {@render peak(it)}
    {:else if it.t === 'foot'}
      <ellipse class="shadow" cx={it.x} cy={it.y} rx={it.rx} ry={it.ry} />
    {:else if it.t === 'barn'}
      <!-- a red barn from the front: gambrel roof, a white-trimmed X door, hay showing in the loft;
           its right side and roof in shade -->
      <g transform="translate({it.x} {it.y})">
        <path class="barn-wall" d="M -14 0 V -15 H 14 V 0 Z" />
        <path class="farm-shade" d="M 9 -15 H 14 V 0 H 9 Z" />
        <rect class="barn-door" x="-6" y="-11" width="12" height="11" />
        <path class="barn-x" d="M -6 -11 L 6 0 M 6 -11 L -6 0" />
        <rect class="barn-x-frame" x="-6" y="-11" width="12" height="11" />
        <path class="barn-roof" d="M -17 -14 L -12 -24 L 0 -30 L 12 -24 L 17 -14 Z" />
        <path class="farm-shade" d="M 0 -30 L 12 -24 L 17 -14 H 0 Z" />
        <path class="roof-line" d="M -17 -14 L -12 -24 L 0 -30 L 12 -24 L 17 -14 Z" />
        <rect class="loft" x="-3.5" y="-22" width="7" height="5" />
      </g>
    {:else if it.t === 'silo'}
      <g transform="translate({it.x} {it.y})">
        <rect class="silo" x="-5" y="-28" width="10" height="28" />
        <path class="farm-shade" d="M 2 -28 H 5 V 0 H 2 Z" />
        <path class="silo-band" d="M -5 -19 H 5 M -5 -10 H 5" />
        <path class="silo-top" d="M -5.5 -28 Q 0 -37 5.5 -28 Z" />
      </g>
    {:else if it.t === 'farmhouse'}
      <!-- a small whitewashed farmhouse from the front, its chimney smoking -->
      <g transform="translate({it.x} {it.y})">
        <rect class="chimney" x="6.5" y="-24" width="3.5" height="12" />
        <path class="wall" d="M -9 0 V -11 H 9 V 0 Z" />
        <path class="farm-shade" d="M 6 -11 H 9 V 0 H 6 Z" />
        <rect class="door" x="-6" y="-7" width="4" height="7" />
        <rect class="window" x="1" y="-8" width="4" height="4" />
        <path class="roof r0" d="M -11.5 -10.5 L 0 -21 L 11.5 -10.5 Z" />
        <path class="farm-shade" d="M 0 -21 L 11.5 -10.5 H 0 Z" />
      </g>
      {@render smoke(it)}
    {:else if it.t === 'fence'}
      <!-- a split-rail fence: posts with two rails -->
      {@const posts = Array.from({ length: Math.round((it.to - it.from) / 9) + 1 }, (_, k) => it.from + ((it.to - it.from) * k) / Math.round((it.to - it.from) / 9))}
      <path class="fence" d="M {it.from} {it.y - 3} H {it.to} M {it.from} {it.y - 6.5} H {it.to}" />
      {#each posts as px}<rect class="post" x={px - 1.1} y={it.y - 9} width="2.2" height="9" rx="0.6" />{/each}
    {:else if it.t === 'goat'}
      <!-- a goat from the side: thin legs, a perky tail, curved horns, a little beard; a grazing
           one has its head down -->
      <g transform="translate({it.x} {it.y}) scale({it.flip ? -0.8 : 0.8} 0.8)">
        <path class="leg" d="M -5 0 V -6 M -2.5 0 V -6 M 3.5 0 V -6 M 6 0 V -6" />
        <path class="goat-line" d="M -7 -10.5 q -2.6 -1.6 -1.8 -4.4" />
        <rect class="goat g{it.c}" x="-7.5" y="-12" width="15" height="7" rx="3.5" />
        <g transform={it.graze ? 'rotate(95 6 -10)' : undefined}>
          <path class="goat g{it.c}" d="M 4.5 -9.5 L 8.5 -15.5 L 10.6 -14.5 L 7.5 -8.6 Z" />
          <path class="goat-line" d="M 10 -17.4 Q 9 -21 6 -21" />
          <path class="goat g{it.c}" d="M 8.4 -16.4 Q 10.4 -18.2 12.4 -16.8 L 14.6 -13.6 Q 15 -12.2 13.6 -12 L 11.4 -12.4 Q 9 -12.6 8.4 -16.4 Z" />
          <path class="goat g{it.c}" d="M 9 -15.6 Q 6.6 -15.2 5.8 -13.6 Q 7.6 -13.6 9.4 -14.4 Z" />
          <path class="goat-line" d="M 13.4 -12.1 l -0.4 2.4" />
          <circle class="eye" cx="11.6" cy="-15.4" r="0.65" />
        </g>
      </g>
    {:else if it.t === 'hay'}
      <!-- a round hay bale from the side, rolled up -->
      <g transform="translate({it.x} {it.y})">
        <circle class="hay" cx="0" cy="-6.5" r="6.5" />
        <path class="hay-line" d="M 0 -6.5 m -1.6 0 a 1.6 1.6 0 1 1 3.2 0 a 3.2 3.2 0 1 1 -6.2 -1 a 4.6 4.6 0 1 1 1.4 5" />
      </g>
    {:else if it.t === 'petrin'}
      <!-- Petřín hill with its lattice lookout tower, its feet planted on the slopes either side of
           the top -->
      {@const hill = (x, w, h) => `M ${x - w / 2} 22 C ${x - w * 0.32} 22 ${x - w * 0.26} ${22 - h} ${x} ${22 - h} C ${x + w * 0.26} ${22 - h} ${x + w * 0.32} 22 ${x + w / 2} 22`}
      <path class="mound-shade" d="{hill(-126, 50, 60)} Z" />
      <path class="mound" d="{hill(-129, 43, 57)} Z" />
      <path class="mound-line" d={hill(-126, 50, 60)} />
      <path class="lattice" d="M -131.6 -33 L -127.6 -69 M -120.4 -33 L -124.4 -69 M -130 -47 H -122 M -129 -56 H -123 M -128.2 -63 H -123.8 M -131 -38 L -123 -47 M -121 -38 L -129 -47 M -130 -47 L -123.3 -56 M -122 -47 L -128.7 -56 M -129 -56 L -124 -63 M -123 -56 L -128 -63" />
      <rect class="stone" x="-128.6" y="-73" width="5.2" height="4" />
      <path class="slate" d="M -129.2 -73 L -126 -77.5 L -122.8 -73 Z" />
    {:else if it.t === 'hrad'}
      <!-- Prague Castle on its ridge: St. Vitus rising behind the long palace front (twin west spires,
           the nave with its pinnacles, the slim green crossing spire, the great south tower with its
           golden clock and green copper domes), a round tower at the east end -->
      <path class="mound-shade" d="M -116 22 C -113 -16 -106 -30 -98 -30 H -20 C -13 -30 -9 -10 -5 22 Z" />
      <path class="mound" d="M -116 22 C -113 -16 -106 -30 -98 -30 H -26 C -19 -30 -16 -10 -13 22 Z" />
      <path class="mound-line" d="M -116 22 C -113 -16 -106 -30 -98 -30 H -20 C -13 -30 -9 -10 -5 22" />
      <g transform="translate(14 18)">
        {#each [-105, -96] as sx}
          <rect class="nave" x={sx} y="-84" width="5" height="26" />
          <path class="spire dark" d="M {sx - 0.6} -84 L {sx + 2.5} -107 L {sx + 5.6} -84 Z" />
          <path class="pinnacles" d="M {sx - 0.6} -84 l 0.6 -3.4 l 0.6 3.4 M {sx + 4.4} -84 l 0.6 -3.4 l 0.6 3.4" />
        {/each}
        <path class="nave" d="M -100 -58 V -76 L -98 -80 L -96 -76 V -58 Z" />
        <circle class="pane" cx="-98" cy="-71" r="1.3" />
        <path class="nave" d="M -91 -58 V -74 H -59 V -58 Z" />
        <path class="lancets" d={Array.from({ length: 6 }, (_, k) => `M ${-88 + k * 5} -61 v -9`).join(' ')} />
        <path class="slate" d="M -92 -74 L -86 -84 H -63 L -58 -74 Z" />
        <path class="pinnacles" d={Array.from({ length: 7 }, (_, k) => `M ${-91.6 + k * 5.4} -74 l 0.8 -4.6 l 0.8 4.6`).join(' ')} />
        <path class="copper" d="M -77.4 -84 L -76 -99 L -74.6 -84 Z" />
        <rect class="nave" x="-75" y="-90" width="10" height="32" />
        <path class="lancets" d="M -71.5 -63 v -8 M -68.5 -63 v -8" />
        <circle class="clock" cx="-70" cy="-80" r="2.2" />
        <rect class="nave" x="-76" y="-92" width="12" height="2.4" />
        <path class="copper" d="M -75 -92 C -75 -98 -72.6 -100 -70 -103 C -67.4 -100 -65 -98 -65 -92 Z" />
        <rect class="copper" x="-71.6" y="-106" width="3.2" height="3.4" />
        <path class="copper" d="M -72.6 -106 C -72.6 -108.6 -71 -109.6 -70 -112 C -69 -109.6 -67.4 -108.6 -67.4 -106 Z" />
        <path class="gold" d="M -70 -112 V -116" />
        <circle class="gold-dot" cx="-70" cy="-116.6" r="1" />
        <rect class="castle" x="-112" y="-59" width="68" height="11" />
        <path class="palace-roof" d="M -114 -59 L -110 -63.5 H -46 L -42 -59 Z" />
        <path class="pane" d={Array.from({ length: 16 }, (_, k) => [-56.4, -52.4].map((wy) => `M ${-109.4 + k * 4} ${wy} h 1.6 v 2.2 h -1.6 Z`).join(' ')).join(' ')} />
        <path class="portal" d="M -80.6 -48 V -52.6 Q -78.6 -55.4 -76.6 -52.6 V -48 Z" />
        <path class="farm-shade" d="M -49 -59 H -44 V -48 H -49 Z" />
        <rect class="castle" x="-43" y="-62" width="7" height="14" />
        <path class="slate" d="M -44 -62 L -39.5 -71 L -35 -62 Z" />
        <path class="farm-shade" d="M -38.5 -62 H -36 V -48 H -38.5 Z" />
      </g>
    {:else if it.t === 'townhouse'}
      <!-- a narrow townhouse from the front: a pastel facade, two windows a floor, the right edge in
           shade, and a red gable, a hipped roof or a curvy Baroque gable -->
      {@const L = it.x - it.w / 2}
      {@const R = it.x + it.w / 2}
      {@const T = it.y - it.h}
      <rect class="facade f{it.c}" x={L} y={T} width={it.w} height={it.h} />
      <path class="pane" d={Array.from({ length: Math.floor((it.h - 3) / 4) }, (_, k) => [L + it.w * 0.2, it.x + it.w * 0.1].map((wx) => `M ${wx} ${T + 2 + k * 4} h 1.6 v 2 h -1.6 Z`).join(' ')).join(' ')} />
      <path class="farm-shade" d="M {R - 1.8} {T} H {R} V {it.y} H {R - 1.8} Z" />
      {#if it.roof === 0}
        <path class="roof" d="M {L - 0.5} {T} L {it.x} {T - it.rh} L {R + 0.5} {T} Z" />
        <path class="farm-shade" d="M {it.x} {T - it.rh} L {R + 0.5} {T} H {it.x} Z" />
      {:else if it.roof === 1}
        <path class="roof" d="M {L - 0.5} {T} L {L + 2} {T - it.rh * 0.8} H {R - 2} L {R + 0.5} {T} Z" />
        <path class="farm-shade" d="M {R - 2} {T - it.rh * 0.8} L {R + 0.5} {T} H {R - 2} Z" />
      {:else}
        {@const a = L + it.w * 0.26}
        {@const b = R - it.w * 0.26}
        <path class="facade f{it.c}" d="M {L} {T} C {L} {T - 2.6} {a} {T - 2.2} {a} {T - 5.4} Q {it.x} {T - 8.6} {b} {T - 5.4} C {b} {T - 2.2} {R} {T - 2.6} {R} {T} Z" />
        <circle class="pane" cx={it.x} cy={T - 4} r="0.9" />
      {/if}
    {:else if it.t === 'nicholas'}
      <!-- St. Nicholas in Malá Strana: a big green dome with its lantern, a bell tower beside it -->
      <g transform="translate({it.x} {it.y})">
        <rect class="castle" x="7" y="-24" width="5" height="24" />
        <path class="copper" d="M 6.6 -24 C 6.6 -28 9.5 -29 9.5 -32 C 9.5 -29 12.4 -28 12.4 -24 Z" />
        <rect class="castle" x="-8" y="-11" width="15" height="11" />
        <path class="copper" d="M -6.5 -11 C -6.5 -19 -3 -21.6 -0.5 -21.6 C 2 -21.6 5.5 -19 5.5 -11 Z" />
        <rect class="copper" x="-1.7" y="-25" width="2.4" height="3.6" />
        <path class="gold" d="M -0.5 -25 V -28" />
        <path class="farm-shade" d="M 3 -11 H 7 V 0 H 3 Z" />
      </g>
    {:else if it.t === 'tyn'}
      <!-- Týn Church: twin dark towers, each crowned with a cluster of spires tipped in gold -->
      <g transform="translate({it.x} {it.y})">
        <path class="nave" d="M -4 0 V -24 L 0 -30 L 4 -24 V 0 Z" />
        {#each [-10, 4] as tx}
          <rect class="nave" x={tx} y="-34" width="6" height="34" />
          <path class="spire dark" d="M {tx - 0.6} -34 L {tx + 3} -52 L {tx + 6.6} -34 Z" />
          <path class="spire dark" d="M {tx - 1.6} -34 l 1.4 -7 l 1.4 7 Z M {tx + 4.8} -34 l 1.4 -7 l 1.4 7 Z" />
          <path class="gold" d="M {tx + 3} -52 v -2.4" />
          <circle class="gold-dot" cx={tx - 0.2} cy="-41.6" r="0.8" />
          <circle class="gold-dot" cx={tx + 6.2} cy="-41.6" r="0.8" />
        {/each}
        <path class="farm-shade" d="M 8 -34 H 10 V 0 H 8 Z" />
      </g>
    {:else if it.t === 'oldhall'}
      <!-- the Old Town Hall tower: the astronomical clock on its face, a gallery, a steep roof with
           its four corner turrets -->
      <g transform="translate({it.x} {it.y})">
        <rect class="nave" x="-4.5" y="-40" width="9" height="40" />
        <path class="lancets" d="M -1.6 -36 v -6 M 1.6 -36 v -6" transform="translate(0 6)" />
        <circle class="clock" cx="0" cy="-17" r="3.4" />
        <circle class="pane" cx="0" cy="-17" r="2.2" />
        <path class="clock-hand" d="M 0 -17 L 1.4 -18.4" />
        <path class="farm-shade" d="M 2.4 -40 H 4.5 V 0 H 2.4 Z" />
        <rect class="nave" x="-5.8" y="-42" width="11.6" height="2.2" />
        <path class="slate" d="M -5 -42 L 0 -55 L 5 -42 Z" />
        <path class="slate" d="M -6.4 -42 l 1.3 -6 l 1.3 6 Z M 3.8 -42 l 1.3 -6 l 1.3 6 Z" />
        <path class="gold" d="M 0 -55 v -3" />
      </g>
    {:else if it.t === 'powder'}
      <!-- the Powder Tower: a dark Gothic gate tower with a steep spiky roof -->
      <g transform="translate({it.x} {it.y})">
        <rect class="stone dark" x="-4.5" y="-30" width="9" height="30" />
        <path class="portal" d="M -2.2 0 V -5 Q 0 -8 2.2 -5 V 0 Z" />
        <path class="farm-shade" d="M 2.4 -30 H 4.5 V 0 H 2.4 Z" />
        <path class="slate" d="M -5 -30 L 0 -44 L 5 -30 Z" />
        <path class="slate" d="M -5.8 -30 l 1.1 -5 l 1.1 5 Z M 3.6 -30 l 1.1 -5 l 1.1 5 Z" />
      </g>
    {:else if it.t === 'charles'}
      <!-- Charles Bridge from the side: stone arches across the river, its statues along the parapet,
           the Old Town Bridge Tower on the east bank, the two Malá Strana towers on the west -->
      {@const P = [-24, -14.4, -4.8, 4.8, 14.4, 24]}
      {@const by = it.y}
      <path class="statues" d={Array.from({ length: 7 }, (_, k) => `M ${-20 + k * 6.6} ${by - 4} v -3.4`).join(' ')} />
      <path class="stone" d="M {P[0]} {by - 4} H {P[5]} V {by + 4} {P.slice(0, 5).map((_, k) => { const i = 4 - k; const r0 = i === 4 ? P[5] : P[i + 1] - 1.4; const l0 = i === 0 ? P[0] : P[i] + 1.4; return `L ${r0} ${by + 4} Q ${(r0 + l0) / 2} ${by - 3.4} ${l0} ${by + 4}`; }).join(' ')} Z" />
      <path class="farm-shade" d="M {P[0]} {by - 1.6} H {P[5]} V {by - 0.6} H {P[0]} Z" />
      <!-- Old Town Bridge Tower -->
      <rect class="stone" x="23" y={by - 22} width="10" height="26" />
      <path class="portal" d="M 25.6 {by + 4} V {by - 1} Q 28 {by - 4.4} 30.4 {by - 1} V {by + 4} Z" />
      <path class="slate" d="M 22.4 {by - 22} L 28 {by - 35} L 33.6 {by - 22} Z" />
      <path class="pinnacles" d="M 22.4 {by - 22} l 0.9 -4 l 0.9 4 M 31.8 {by - 22} l 0.9 -4 l 0.9 4" />
      <path class="farm-shade" d="M 30.6 {by - 22} H 33 V {by + 4} H 30.6 Z" />
      <!-- Malá Strana bridge towers: the low Judith tower and the tall one -->
      <rect class="stone" x="-36" y={by - 14} width="7" height="18" />
      <path class="slate" d="M -36.6 {by - 14} L -32.5 {by - 21} L -28.4 {by - 14} Z" />
      <rect class="stone" x="-31" y={by - 26} width="8" height="30" />
      <path class="portal" d="M -29.2 {by + 4} V {by - 1} Q -27 {by - 4.4} -24.8 {by - 1} V {by + 4} Z" />
      <path class="slate" d="M -31.6 {by - 26} L -27 {by - 38} L -22.4 {by - 26} Z" />
      <path class="farm-shade" d="M -25 {by - 26} H -23 V {by + 4} H -25 Z" />
    {:else if it.t === 'mound'}
      {@const hill = (x, w, h) => `M ${x - w / 2} ${it.y} C ${x - w * 0.32} ${it.y} ${x - w * 0.26} ${it.y - h} ${x} ${it.y - h} C ${x + w * 0.26} ${it.y - h} ${x + w * 0.32} ${it.y} ${x + w / 2} ${it.y}`}
      <!-- the hill in shade, then again in light, a little smaller and to the left, so the shade
           only shows down the right flank; the outline runs over the top and leaves the foot open -->
      <path class="mound-shade" d="{hill(it.x, it.w, it.h)} Z" />
      <path class="mound" d="{hill(it.x - it.w * 0.07, it.w * 0.86, it.h * 0.94)} Z" />
      <path class="mound-grass" d="M {it.x - it.w * 0.22} {it.y - it.h * 0.55} q 3 -2.5 6 -1 M {it.x - it.w * 0.05} {it.y - it.h * 0.3} q 3 -2.5 6 -1" />
      <path class="mound-line" d={hill(it.x, it.w, it.h)} />
    {:else if it.t === 'lake'}
      <!-- shallow at the shore, deeper in the middle; ripples catching the light and a lily pad -->
      <path class="lake-fill" d="M -60 4 C -62 -20 -22 -28 10 -24 S 64 -10 58 10 S 10 28 -20 25 S -58 22 -60 4 Z" />
      <path class="lake-deep" d="M -60 4 C -62 -20 -22 -28 10 -24 S 64 -10 58 10 S 10 28 -20 25 S -58 22 -60 4 Z" transform="translate(4 3) scale(0.6)" />
      <path class="shine" d="M -40 -8 q 6 -4 12 0 M -14 -15 q 4 -2.5 8 0 M 6 6 q 7 -4.5 14 0" />
      <path class="lily" d="M 24 -8 L 29.5 -11.4 A 6.5 4.6 0 1 1 23 -12.6 Z" />
    {:else if it.t === 'reed'}
      <path class="reed" d="M {it.x} {it.y} q -2 -9 -5 -13 M {it.x + 3} {it.y} q 0 -10 1 -17 M {it.x + 6} {it.y} q 3 -8 6 -11" />
      <!-- a cattail on the middle stalk -->
      <rect class="cattail" x={it.x + 2.4} y={it.y - 16} width="3.2" height="7" rx="1.6" />
    {:else if it.t === 'farmhill'}
      {@const L = it.x - it.w / 2}
      {@const tp = it.y - it.h}
      {@const top = `M ${L} ${it.y} C ${L + it.w * 0.25} ${it.y} ${it.x - it.w * 0.3} ${tp} ${it.x} ${tp} C ${it.x + it.w * 0.3} ${tp} ${it.x + it.w / 2 - it.w * 0.25} ${it.y} ${it.x + it.w / 2} ${it.y}`}
      {@const cid = `${uid}-farm${it.i}`}
      <!-- a rolling hill of fields: crop bands with slanted edges, furrows following the hill's
           curve, the right flank in shade; one outline over the top, the foot left open -->
      <defs><clipPath id={cid}><path d="{top} Z" /></clipPath></defs>
      <g clip-path="url(#{cid})">
        {#each it.bands as [f0, c], k}
          {@const x0 = L + f0 * it.w}
          {@const x1 = L + (it.bands[k + 1]?.[0] ?? 1.1) * it.w}
          <path class="c{c}" d="M {x0 - 4} {tp - 2} H {x1 - 4} L {x1 + 4} {it.y + 2} H {x0 + 4} Z" />
          {#if k}<path class="field-edge" d="M {x0 - 4} {tp - 2} L {x0 + 4} {it.y + 2}" />{/if}
        {/each}
        {#each [5, 10, 15, 20] as dy}<path class="furrow" d={top} transform="translate(0 {dy})" />{/each}
        <path class="farm-shade" d="M {it.x + it.w * 0.16} {tp - 2} H {it.x + it.w} V {it.y + 2} H {it.x + it.w * 0.3} Z" />
      </g>
      <path class="mound-line" d={top} />
    {:else if it.t === 'tower'}
      <!-- the lookout: two tapered posts (the right one in shade) braced crosswise, a plank deck
           with a railing, corner posts holding a pitched roof, a flag on top -->
      <g transform="translate(0 {it.y})">
        <path class="brace" d="M -8.4 -3 L 6.6 -17 M 8.4 -3 L -6.6 -17 M -6.6 -17 L 5.2 -30 M 6.6 -17 L -5.2 -30 M -7 -17 H 7" />
        <path class="post" d="M -10.6 0 H -7.4 L -3.8 -32 H -6.6 Z" />
        <path class="post shade" d="M 7.4 0 H 10.6 L 6.6 -32 H 3.8 Z" />
        <path class="rail" d="M -9.4 -36 V -46 M 9.4 -36 V -46 M -11 -41 H 11 M -4.5 -36 V -41 M 0 -36 V -41 M 4.5 -36 V -41" />
        <rect class="deck" x="-12.5" y="-36" width="25" height="4.5" rx="0.8" />
        <path class="roof r1" d="M -15.5 -45 L 0 -55 L 15.5 -45 Z" />
        <path class="roof-shade" d="M 0 -55 L 15.5 -45 H 2 Z" />
        <path class="roof-line" d="M -15.5 -45 L 0 -55 L 15.5 -45 Z" />
        <path class="flagpole" d="M 0 -55 V -64" />
        <path class="flag" d="M 0.6 -64 Q 5 -64.5 9 -62 Q 5 -60 0.6 -59.6 Z" />
      </g>
    {:else if it.t === 'picnic'}
      <!-- seen from the side: a table on two A-frame legs with its bench in front, a parasol through
           its middle (red and white panels, scalloped hem, the right half in shade), and a blue
           P sign on a post -->
      <path class="brace" d="M -15 0 L -10 -12 M -5 0 L -10 -12 M 5 0 L 10 -12 M 15 0 L 10 -12" />
      <path class="flagpole" d="M 0 -12 V -40" />
      <rect class="plank" x="-17" y="-14" width="34" height="3.2" rx="0.8" />
      <rect class="plank" x="-19" y="-7" width="38" height="2.8" rx="0.8" />
      <path class="parasol" d="M -17 -30 Q 0 -50 17 -30 Q 12.75 -27.5 8.5 -30 Q 4.25 -27.5 0 -30 Q -4.25 -27.5 -8.5 -30 Q -12.75 -27.5 -17 -30 Z" />
      <path class="parasol-stripe" d="M 0 -40 L -8.5 -30 Q -4.25 -27.5 0 -30 Z M 0 -40 L 8.5 -30 Q 12.75 -27.5 17 -30 Z" />
      <path class="parasol-shade" d="M 0 -40 Q 8.5 -40 17 -30 Q 12.75 -27.5 8.5 -30 Q 4.25 -27.5 0 -30 Z" />
      <path class="roof-line" d="M -17 -30 Q 0 -50 17 -30 Q 12.75 -27.5 8.5 -30 Q 4.25 -27.5 0 -30 Q -4.25 -27.5 -8.5 -30 Q -12.75 -27.5 -17 -30 Z" />
      <path class="post" d="M 25.2 0 H 26.8 V -18 H 25.2 Z" />
      <rect class="sign" x="20" y="-27" width="12" height="10" rx="2" />
      <path class="sign-p" d="M 24.4 -19.6 V -24.6 H 26.6 Q 28.6 -24.6 28.6 -22.9 Q 28.6 -21.2 26.6 -21.2 H 24.4" />
    {/if}
  {/each}
  {#if label}
    <text class="name" x="0" y={kind === 'mountains' ? 28 : 22} text-anchor="middle" transform={flip ? 'scale(-1 1)' : undefined}>{label}</text>
  {/if}
</g>

<style>
  .doodle :global(*) {
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  /* lines keep their width on screen however big or small a place is drawn on the map */
  .doodle :where(path, circle, ellipse, rect) {
    vector-effect: non-scaling-stroke;
  }
  .shadow {
    fill: rgba(40, 60, 15, 0.22);
  }
  .trunk {
    fill: #7a4f2a;
    stroke: var(--ink);
    stroke-width: 1;
  }
  .crown {
    fill: #62ad4c;
  }
  /* drawn under the fills at twice the width, so only its outer half shows around the silhouette */
  .crown-line,
  .needles-line {
    fill: none;
    stroke: var(--ink);
    stroke-width: 2.8;
    stroke-linejoin: round;
  }
  .crown-shade {
    fill: #3f8a3b;
  }
  .crown-hi {
    fill: #9bd879;
  }
  .needles {
    fill: #2f8048;
  }
  .needles-shade {
    fill: #215f37;
  }
  .plant {
    transform-box: fill-box;
    transform-origin: 50% 100%;
  }
  .sway {
    animation: sway 3.6s ease-in-out var(--d) infinite alternate;
  }
  @keyframes sway {
    from { rotate: -2.5deg; }
    to { rotate: 2.5deg; }
  }
  .wall {
    fill: #f7e9cd;
    stroke: var(--ink);
    stroke-width: 1.2;
  }
  .wall-side {
    fill: #d9bf96;
    stroke: var(--ink);
    stroke-width: 1.2;
  }
  .roof {
    fill: #d4573c;
    stroke: var(--ink);
    stroke-width: 1.2;
  }
  .roof.r1 { fill: #8a5a3b; }
  .roof.r2 { fill: #5f8f8a; }
  .roof-edge {
    fill: none;
    stroke: #a63c27;
    stroke-width: 2.4;
  }
  .roof-edge.r1 { stroke: #6a412a; }
  .door {
    fill: #7a4f2a;
  }
  .window {
    fill: #5c86b3;
    stroke: var(--ink);
    stroke-width: 0.8;
  }
  .chimney {
    fill: #a63c27;
    stroke: var(--ink);
    stroke-width: 1;
  }
  .smoke circle {
    fill: rgba(255, 255, 255, 0.85);
    stroke: rgba(22, 19, 17, 0.35);
    stroke-width: 0.8;
  }
  .smoke {
    transform-box: fill-box;
    transform-origin: 0 100%;
    animation: puff 3.2s ease-out var(--d) infinite;
  }
  @keyframes puff {
    0% { opacity: 0; translate: 0 4px; scale: 0.6; }
    30% { opacity: 1; }
    100% { opacity: 0; translate: 4px -10px; scale: 1.3; }
  }
  .spire {
    fill: #4b6f6b;
    stroke: var(--ink);
    stroke-width: 1.2;
  }
  .spire-shade {
    fill: #36524f;
  }
  .dome {
    fill: #5f8f8a;
    stroke: var(--ink);
    stroke-width: 1.2;
  }
  .clock {
    fill: var(--paper);
    stroke: var(--ink);
    stroke-width: 0.8;
  }
  .castle-side {
    fill: #d6c398;
    stroke: var(--ink);
    stroke-width: 1.1;
  }
  .facade {
    stroke: var(--ink);
    stroke-width: 1;
  }
  .f0 { fill: #f7e9cd; }
  .f1 { fill: #f0c987; }
  .f2 { fill: #f2b7a2; }
  .f3 { fill: #cfe0c8; }
  .f4 { fill: #fff6e8; }
  .pane {
    fill: #5c86b3;
  }
  .portal {
    fill: #3a3f45;
  }
  .stone {
    fill: #d3bf98;
    stroke: var(--ink);
    stroke-width: 1.1;
    stroke-linejoin: round;
  }
  .stone.dark {
    fill: #a8987a;
  }
  .lattice {
    fill: none;
    stroke: #8a4f2e;
    stroke-width: 1.2;
    stroke-linecap: round;
  }
  .clock-hand {
    stroke: #e2b23c;
    stroke-width: 0.8;
  }
  .statues {
    fill: none;
    stroke: #3a3f45;
    stroke-width: 1.6;
    stroke-linecap: round;
  }
  .slate {
    fill: #474e58;
    stroke: var(--ink);
    stroke-width: 1.1;
    stroke-linejoin: round;
  }
  .pinnacles {
    fill: #e9dcc0;
    stroke: var(--ink);
    stroke-width: 0.9;
    stroke-linejoin: round;
  }
  .lancets {
    fill: none;
    stroke: #3a3f45;
    stroke-width: 1.3;
    stroke-linecap: round;
  }
  .clock {
    fill: #e2b23c;
    stroke: var(--ink);
    stroke-width: 0.9;
  }
  .palace-roof {
    fill: #c75a3f;
    stroke: var(--ink);
    stroke-width: 1.1;
  }
  .nave {
    fill: #e9dcc0;
    stroke: var(--ink);
    stroke-width: 1.1;
  }
  .nave-roof {
    fill: #4f8a7e;
    stroke: var(--ink);
    stroke-width: 1.1;
  }
  .buttress {
    stroke: rgba(22, 19, 17, 0.45);
    stroke-width: 1;
  }
  .copper {
    fill: #5fa592;
    stroke: var(--ink);
    stroke-width: 1.1;
  }
  .gold {
    stroke: #c99a2e;
    stroke-width: 1.4;
  }
  .gold-dot {
    fill: #e2b23c;
  }
  .rose {
    fill: #5c86b3;
    stroke: var(--ink);
    stroke-width: 0.8;
  }
  .spire.dark {
    fill: #3a3f45;
  }
  .bridge-deck {
    stroke: #9c7a55;
    stroke-width: 7;
  }
  .bridge-arches {
    fill: none;
    stroke: #6b5238;
    stroke-width: 1.3;
  }
  .bridge-tower {
    fill: #b39470;
    stroke: var(--ink);
    stroke-width: 1.1;
  }
  .castle {
    fill: #efe0bf;
    stroke: var(--ink);
    stroke-width: 1.2;
  }
  .lake-fill {
    fill: #8cc2ea;
    stroke-width: 2.4;
    stroke: var(--ink);
  }
  .lake-deep {
    fill: #5f9fd5;
  }
  .shine {
    fill: none;
    stroke: #e4f2fc;
    stroke-width: 2.4;
    stroke-linecap: round;
  }
  .lily {
    fill: #6fae4f;
    stroke: var(--ink);
    stroke-width: 1.2;
    stroke-linejoin: round;
  }
  .reed {
    fill: none;
    stroke: #3f6b34;
    stroke-width: 2;
    stroke-linecap: round;
  }
  .cattail {
    fill: #8a5a3b;
    stroke: var(--ink);
    stroke-width: 1;
  }
  .barn-wall {
    fill: #c2442f;
    stroke: var(--ink);
    stroke-width: 1.2;
  }
  .barn-roof {
    fill: #6f625a;
  }
  .barn-door {
    fill: #8a2c1d;
  }
  .barn-x,
  .barn-x-frame {
    fill: none;
    stroke: var(--paper);
    stroke-width: 1.4;
  }
  .loft {
    fill: #e7c45a;
    stroke: var(--ink);
    stroke-width: 1;
  }
  .silo {
    fill: #c9d3dc;
    stroke: var(--ink);
    stroke-width: 1.2;
  }
  .silo-band {
    fill: none;
    stroke: rgba(22, 19, 17, 0.3);
    stroke-width: 1.2;
  }
  .silo-top {
    fill: #8e9aa6;
    stroke: var(--ink);
    stroke-width: 1.2;
  }
  .fence {
    fill: none;
    stroke: #6a412a;
    stroke-width: 1.6;
  }
  .goat {
    stroke: var(--ink);
    stroke-width: 1.1;
    stroke-linejoin: round;
  }
  .g0 { fill: #f8f5ec; }
  .g1 { fill: #d9b98a; }
  .g2 { fill: #b3aea4; }
  .goat-line {
    fill: none;
    stroke: var(--ink);
    stroke-width: 1.3;
    stroke-linecap: round;
  }
  .eye {
    fill: var(--ink);
  }
  .leg {
    stroke: var(--ink);
    stroke-width: 1.3;
    stroke-linecap: round;
  }
  .hay {
    fill: #e7c45a;
    stroke: var(--ink);
    stroke-width: 1.1;
  }
  .hay-line {
    fill: none;
    stroke: #b08a2a;
    stroke-width: 1;
  }
  .rock {
    fill: #c3c9d1;
  }
  /* one translucent shadow over the right face, so the snow under it turns cool blue too */
  .rock-shade {
    fill: #2c3e57;
    opacity: 0.3;
  }
  .snow {
    fill: #fbfbf8;
  }
  .rock-line {
    fill: none;
    stroke: var(--ink);
    stroke-width: 1.6;
    stroke-linejoin: round;
  }
  .mound {
    fill: #8cc46a;
  }
  .mound-shade {
    fill: #6aa34f;
  }
  .mound-line {
    fill: none;
    stroke: var(--ink);
    stroke-width: 1.5;
  }
  .mound-grass {
    fill: none;
    stroke: #b4dc8e;
    stroke-width: 1.6;
    stroke-linecap: round;
  }
  .c0 { fill: #ead27a; }
  .c1 { fill: #a9d06f; }
  .c2 { fill: #c99a62; }
  .field-edge {
    fill: none;
    stroke: rgba(22, 19, 17, 0.3);
    stroke-width: 1.2;
  }
  /* furrows following the hill's curve, darkening whatever crop they cross */
  .furrow {
    fill: none;
    stroke: rgba(22, 19, 17, 0.14);
    stroke-width: 1.4;
  }
  .farm-shade {
    fill: #2c3e57;
    opacity: 0.16;
  }
  .wood {
    fill: none;
    stroke: #6a412a;
    stroke-width: 2.6;
  }
  .post {
    fill: #a8754a;
    stroke: var(--ink);
    stroke-width: 1.1;
    stroke-linejoin: round;
  }
  .post.shade {
    fill: #7f5434;
  }
  .brace {
    fill: none;
    stroke: #6a412a;
    stroke-width: 1.8;
    stroke-linecap: round;
  }
  .rail {
    fill: none;
    stroke: var(--ink);
    stroke-width: 1.2;
    stroke-linecap: round;
  }
  .roof-shade {
    fill: #6a412a;
  }
  .roof-line {
    fill: none;
    stroke: var(--ink);
    stroke-width: 1.2;
    stroke-linejoin: round;
  }
  .deck,
  .plank {
    fill: #a8754a;
    stroke: var(--ink);
    stroke-width: 1.1;
  }
  .flagpole {
    stroke: var(--ink);
    stroke-width: 1.4;
  }
  .flag {
    fill: var(--route);
  }
  .parasol {
    fill: var(--route);
    stroke: var(--ink);
    stroke-width: 1.2;
  }
  .parasol-stripe {
    fill: var(--paper);
  }
  .parasol-shade {
    fill: #2c3e57;
    opacity: 0.2;
  }
  .sign {
    fill: #3b6f9e;
    stroke: var(--ink);
    stroke-width: 1.2;
  }
  .sign-p {
    fill: none;
    stroke: #fff;
    stroke-width: 1.6;
    stroke-linejoin: round;
  }
  .name {
    font-family: var(--f-marker);
    font-style: italic;
    font-weight: 700;
    font-size: 15px;
    fill: var(--ink-soft);
    paint-order: stroke;
    stroke: var(--land);
    stroke-width: 4px;
  }
  .mountains .name {
    font-size: 22px;
    font-style: normal;
    font-weight: 800;
    letter-spacing: 0.04em;
  }
  @media (prefers-reduced-motion: reduce) {
    .sway, .smoke { animation: none; }
  }
</style>
