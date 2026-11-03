<script>
  // @ts-check
  // the closing scene under the contact postcard; Contact.svelte darkens the room away from its fire
  // (bind:fire is the flames' group)
  import Icon from '../../ui/Icon.svelte';
  import Kittens from '../../figures/Kittens.svelte';
  import { parallax } from '../../motion/parallax.js';
  import { layer } from '../../art/forest.js';

  /** @type {{ fire?: SVGGElement }} */
  let { fire = $bindable() } = $props();

  // the bookshelf's books: [x, top, width, colour], each standing on the shelf below its top
  /** @type {[number, number, number, string][]} */
  const BOOKS = [[166, 252, 12, '#c94a3c'], [180, 258, 10, '#3a78b0'], [192, 248, 14, '#e7c45a'], [208, 262, 11, '#5cbf5f'], [244, 256, 12, '#d6407a'], [166, 304, 14, '#e7c45a'], [182, 300, 10, '#c94a3c'], [194, 308, 12, '#3a78b0'], [232, 302, 13, '#5cbf5f'], [247, 306, 10, '#f3ead6']];

  // the night forest from the opening, seen through the living-room window: a far row and a near one
  const far = layer({ seed: 5, count: 9, span: [330, 600], base: 300, height: [60, 95] });
  const near = layer({ seed: 11, count: 6, span: [330, 600], base: 330, height: [95, 140] });
</script>

<!-- the ending: a simple, cozy living room seen from the side like the map: the two of them curled
     up in their bed between the window and the fire. Everything is outlined in ink, with a warm
     shade (.sh) down its right side -->
<svg class="scene" viewBox="0 0 1440 460" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <defs>
    <radialGradient id="firelight">
      <stop offset="0" stop-color="#ffb347" stop-opacity="0.55" />
      <stop offset="1" stop-color="#ffb347" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="night-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0f2038" />
      <stop offset="1" stop-color="#22406a" />
    </linearGradient>
    <clipPath id="pane">
      <rect x="342" y="122" width="236" height="198" rx="6" />
    </clipPath>
  </defs>

  {#snippet flames()}
    <g class="fire" bind:this={fire}>
        <g transform="translate(392 0)">
          <path class="flame-o" d="M572 396 C564 368 586 356 582 330 C600 348 598 318 616 300 C620 330 642 336 638 358 C654 350 654 374 646 396 Z" />
          <path class="flame-i" d="M590 396 C586 374 600 368 600 352 C612 364 616 344 622 338 C626 360 636 372 630 396 Z" />
        </g>
    </g>
  {/snippet}

  {#snippet sleepers()}
    <Kittens x={-47} y={-454} />
    <g transform="translate(744 191)">
      <g class="hearts"><Icon name="heart" size={30} /></g>
    </g>
  {/snippet}

  <!-- the window to the night forest; it hangs on the wall and drifts a touch behind the
       furniture as you scroll, and the night inside it drifts in layers behind the glass -->
  <g use:parallax={0.053}>
  <g clip-path="url(#pane)">
    <rect class="sky" x="330" y="110" width="260" height="230" />
    <!-- depth through the glass: the sky lags the window the most, the far trees less, the
         near ones least, so the forest slides past the frame in layers -->
    <g use:parallax={0.047}>
      <circle class="moon" cx="530" cy="164" r="17" />
      <circle class="crater" cx="524" cy="160" r="3.4" /><circle class="crater" cx="536" cy="170" r="2.4" />
      {#each [[372, 150, 1.8], [410, 136, 1.4], [452, 170, 1.6], [486, 140, 1.3], [392, 190, 1.2], [560, 206, 1.4]] as [cx, cy, r]}<circle class="star" {cx} {cy} {r} />{/each}
    </g>
    <!-- the forest, one flat colour a row: the far one paler, the near one darker -->
    <g use:parallax={0.033}>
      {#each far as t}<path class="pine far" d={t.trunk} />{#each t.tiers as d}<path class="pine far" {d} />{/each}{/each}
      <path class="snow" d="M330 306 C380 298 430 304 470 300 S550 296 590 304 V370 H330 Z" />
    </g>
    <g use:parallax={0.0204}>
      {#each near as t}<path class="pine near" d={t.trunk} />{#each t.tiers as d}<path class="pine near" {d} />{/each}{/each}
    </g>
  </g>
  <!-- the frame, its cross bars, the sill with a little plant -->
  <rect class="frame" x="342" y="122" width="236" height="198" rx="6" />
  <path class="bars" d="M460 122 V320 M342 221 H578" />
  <rect class="sill" x="326" y="318" width="268" height="14" rx="3" />
  <path class="sh" d="M576 320 H594 V332 H576 Z" />
  <path class="pot" d="M524 318 L529 300 H557 L562 318 Z" />
  <path class="leaf" d="M543 300 C530 284 522 280 516 270 C532 272 540 284 543 300 Z M543 300 C552 280 562 276 570 266 C558 272 548 284 543 300 Z M543 300 C543 284 546 274 550 262 C552 278 548 290 543 300 Z" />
  <!-- curtains, tied back, and the rod they hang from -->
  <path class="curtain" d="M318 104 H356 C352 150 346 196 360 238 C348 276 332 318 330 366 H306 C312 318 322 276 314 238 C326 196 316 150 318 104 Z" />
  <path class="curtain" d="M602 104 H564 C568 150 574 196 560 238 C572 276 588 318 590 366 H614 C608 318 598 276 606 238 C594 196 604 150 602 104 Z" />
  <path class="sh" d="M342 110 C338 156 334 200 346 238 C336 270 324 310 322 360 H330 C332 318 348 276 360 238 C346 196 352 150 356 110 Z" />
  <path class="sh" d="M590 110 C590 156 586 200 576 238 C588 274 602 314 606 360 H614 C608 318 598 276 606 238 C594 196 604 150 602 110 Z" />
  <path class="tie" d="M310 236 Q336 246 362 236 M558 236 Q584 246 610 236" />
  <rect class="rod" x="296" y="96" width="328" height="10" rx="5" />
  </g>

  <!-- the floor and the skirting board -->
  <rect class="floor" x="-1100" y="400" width="3640" height="80" />
  <path class="boards" d="M-1100 426 H2540 M-1100 452 H2540 M-560 400 V426 M-220 426 V452 M120 400 V426 M420 426 V452 M760 400 V426 M1100 426 V452 M1460 400 V426 M1800 426 V452 M2140 400 V426 M-380 452 V480 M300 452 V480 M980 452 V480 M1640 452 V480" />
  <rect class="skirting" x="-1100" y="392" width="3640" height="12" />

  <!-- a bookshelf: two shelves of books, a little plant on top -->
  <rect class="wood" x="150" y="226" width="136" height="174" rx="4" />
  <rect class="shelf-back" x="162" y="238" width="112" height="152" />
  <path class="shelf" d="M162 290 H274 M162 342 H274" />
  {#each BOOKS as [bx, by, bw, c]}
    <rect class="book" x={bx} y={by} width={bw} height={(by < 290 ? 290 : 342) - by} fill={c} />
  {/each}
  <path class="book" d="M222 284 L250 276 L252 282 L224 290 Z" fill="#8a5a3b" />
  <path class="pot" d="M202 226 L206 210 H230 L234 226 Z" />
  <path class="leaf" d="M218 210 C206 196 200 192 194 184 C208 186 214 196 218 210 Z M218 210 C226 194 234 190 242 182 C230 188 222 198 218 210 Z" />
  <path class="sh" d="M272 230 H284 V398 H272 Z" />

  <!-- the fireplace: stone, a dark firebox, the mantel with a framed heart and two candles -->
  <circle class="warm" cx="1005" cy="330" r="230" fill="url(#firelight)" />
  <rect class="stone" x="900" y="208" width="210" height="192" />
  <path class="stones" d="M900 248 H1110 M900 288 H1110 M900 328 H1110 M900 368 H1110 M952 208 V248 M1058 208 V248 M926 248 V288 M1084 248 V288 M940 288 V328 M1070 288 V328" />
  <path class="sh" d="M1092 208 H1110 V400 H1092 Z" />
  <path class="hearth" d="M948 400 V322 Q1005 270 1062 322 V400 Z" />
  {@render flames()}
  <rect class="log" x="958" y="388" width="94" height="12" rx="5" />
  <rect class="mantel" x="884" y="194" width="242" height="18" rx="4" />
  <rect class="frame-pic" x="912" y="148" width="52" height="46" rx="3" />
  <path class="pic-heart" d="M938 184 C938 184 922 175 922 166 A7 7 0 0 1 938 162 A7 7 0 0 1 954 166 C954 175 938 184 938 184 Z" />
  {#each [[1060, 158], [1082, 168]] as [cx, top]}
    <rect class="candle" x={cx - 7} y={top} width="14" height={194 - top} rx="2" />
    <path class="candle-flame" d="M{cx} {top - 2} C{cx - 6} {top - 10} {cx} {top - 18} {cx} {top - 22} C{cx + 6} {top - 16} {cx + 8} {top - 8} {cx} {top - 2} Z" />
  {/each}

  <!-- their bed: a round plush bed with a raised rim, on a striped rug; the back of the rim
       behind them, the front of it in front, so they're curled up inside -->
  <ellipse class="rug" cx="740" cy="428" rx="178" ry="20" />
  <ellipse class="rug-in" cx="740" cy="428" rx="140" ry="12" />
  <ellipse class="bed" cx="740" cy="384" rx="130" ry="30" />
  <ellipse class="bed-in" cx="740" cy="392" rx="106" ry="18" />
  {@render sleepers()}
  <path class="bed" d="M610 384 C610 444 870 444 870 384 C852 404 628 404 610 384 Z" />
  <path class="sh" d="M818 404 C842 400 862 394 870 384 C870 408 856 424 826 430 Z" />
  <path class="bed-seam" d="M636 414 C700 428 780 428 844 414" />

  <!-- an armchair with a knitted blanket over its arm and a cushion; a floor lamp beside it -->
  <rect class="chair" x="1170" y="246" width="144" height="104" rx="26" />
  <rect class="chair" x="1160" y="318" width="164" height="70" rx="18" />
  <rect class="chair-arm" x="1144" y="296" width="44" height="96" rx="20" />
  <rect class="chair-arm" x="1296" y="296" width="44" height="96" rx="20" />
  <path class="sh" d="M1324 300 C1336 300 1340 310 1340 320 V372 C1340 384 1332 392 1320 392 Z" />
  <rect class="cushion" x="1200" y="276" width="64" height="50" rx="14" transform="rotate(-8 1232 301)" />
  <path class="cushion-heart" d="M1232 312 C1232 312 1221 305 1221 299 A5 5 0 0 1 1232 296 A5 5 0 0 1 1243 299 C1243 305 1232 312 1232 312 Z" />
  <path class="blanket" d="M1140 300 C1160 290 1184 292 1192 300 L1188 364 C1172 372 1154 370 1142 362 Z" />
  <path class="knit" d="M1144 318 C1160 312 1176 312 1190 318 M1143 338 C1160 332 1176 332 1189 338" />
  <path class="leg" d="M1166 392 V402 M1318 392 V402" />
  <circle class="warm" cx="1378" cy="190" r="110" fill="url(#firelight)" />
  <path class="lamp-pole" d="M1378 398 V206" />
  <ellipse class="lamp-foot" cx="1378" cy="398" rx="24" ry="6" />
  <path class="shade" d="M1346 206 L1356 156 H1400 L1410 206 Z" />
  <path class="sh" d="M1394 156 H1400 L1410 206 H1400 Z" />
</svg>

<style>
  /* the room is scaled to its height and centred: a wide screen shows more wall and floor to each
     side instead of a stretched, top-cropped room; a narrow one crops its sides as before */
  .scene {
    position: relative;
    left: 50%;
    display: block;
    height: clamp(300px, 34vw, 540px);
    width: auto;
    aspect-ratio: 1440 / 460;
    translate: -50% 0;
    overflow: visible;
    margin-top: 56px;
  }
  .scene path,
  .scene rect,
  .scene ellipse,
  .scene circle:not(.warm):not(.star) {
    stroke: var(--ink);
    stroke-width: 3;
    /* outlines at a true 3px, like the rest of the page, however the room is scaled */
    vector-effect: non-scaling-stroke;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  /* a warm shade down the right side of each piece */
  .sh { fill: rgba(70, 35, 10, 0.2); stroke: none !important; }
  /* the window and the night forest behind it */
  .sky { fill: url(#night-sky); stroke: none !important; }
  .moon { fill: #f4f1d8; stroke-width: 2.4 !important; }
  .crater { fill: #dcd6b4; stroke: none !important; }
  .star { fill: #fff; }
  .pine { stroke: none !important; }
  .pine.far { fill: #3b5f8a; }
  .pine.near { fill: #1d3b60; }
  .snow { fill: #c9d8ea; stroke: none !important; }
  .frame { fill: none; stroke-width: 8 !important; stroke: #7a4f2a !important; }
  .bars { fill: none; stroke: #7a4f2a !important; stroke-width: 6 !important; }
  .curtain { fill: #d6407a; stroke-width: 2.5 !important; }
  .tie { fill: none; stroke: #e7c45a !important; stroke-width: 4 !important; }
  .rod { fill: #7a4f2a; }
  .sill { fill: #e9cfa0; }
  .pot { fill: #c46a3b; stroke-width: 2.4 !important; }
  .leaf { fill: #5cbf5f; stroke-width: 2 !important; }
  /* the bookshelf */
  .wood { fill: #9a6a42; }
  .shelf-back { fill: #6e4a30; stroke-width: 2 !important; }
  .shelf { fill: none; stroke: #9a6a42 !important; stroke-width: 6 !important; }
  .book { stroke-width: 2 !important; }
  /* the fireplace */
  .warm { stroke: none; animation: hearth 7s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  .stone { fill: #c3c9d1; }
  .stones { fill: none; stroke: #969ea8 !important; stroke-width: 2.5 !important; }
  .mantel { fill: #8a5a3b; }
  .hearth { fill: #2a1a0c; }
  .flame-o { fill: #ff8a2a; stroke-width: 2.5 !important; }
  .flame-i { fill: #ffd76b; stroke: none !important; }
  .fire { transform-box: fill-box; transform-origin: 50% 100%; animation: fire 1.8s ease-in-out infinite alternate; }
  .log { fill: #6a412a; }
  .frame-pic { fill: var(--paper); stroke-width: 2.5 !important; }
  .pic-heart { fill: var(--route); stroke-width: 1.6 !important; }
  .candle { fill: var(--paper); stroke-width: 2.4 !important; }
  .candle-flame { fill: #ffb347; stroke-width: 1.6 !important; }
  /* the floor */
  .floor { fill: #b9763f; stroke: none !important; }
  .boards { fill: none; stroke: #94592b !important; stroke-width: 2.5 !important; }
  .skirting { fill: #f3ead6; }
  /* their bed on the rug */
  .rug { fill: #3a78b0; }
  .rug-in { fill: none; stroke: #f3ead6 !important; stroke-width: 2.5 !important; stroke-dasharray: 9 7; }
  .bed { fill: #c9584a; }
  .bed-in { fill: #f3e3c3; stroke-width: 2.4 !important; }
  .bed-seam { fill: none; stroke: #9a3a30 !important; stroke-width: 2 !important; stroke-dasharray: 6 6; }
  .hearts { animation: float 3.6s ease-in-out infinite; }
  /* the armchair and the lamp */
  .chair { fill: #e3a33c; }
  .chair-arm { fill: #d79430; }
  .cushion { fill: #f3ead6; }
  .cushion-heart { fill: var(--route); stroke-width: 1.6 !important; }
  .blanket { fill: #5f8f8a; }
  .knit { fill: none; stroke: #f3ead6 !important; stroke-width: 2.4 !important; stroke-dasharray: 4 4; }
  .leg { fill: none; stroke-width: 6 !important; }
  .lamp-pole { fill: none; stroke-width: 5 !important; }
  .lamp-foot { fill: #7a4f2a; }
  .shade { fill: #ffd76b; }

  @keyframes hearth {
    0%, 100% { opacity: 0.75; scale: 0.97; }
    50% { opacity: 1; scale: 1.03; }
  }
  @keyframes fire {
    from { scale: 0.92 1; }
    to { scale: 1.06 1.12; }
  }
  @keyframes float {
    0%, 100% { opacity: 0; translate: 0 8px; }
    40%, 70% { opacity: 1; translate: 3px -6px; }
  }
  @media (min-width: 760px) {
    .scene {
      margin-top: 72px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .warm, .fire, .hearts { animation: none; }
  }
</style>
