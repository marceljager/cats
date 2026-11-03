<script module>
  // The night forest (Hero.svelte) and the living room (Contact.svelte) in the parts they can be
  // hand-drawn in: one per parallax layer, and the room around its moving bits. Same shapes and
  // colours as the scenes; if a scene changes, change the matching part here too.
  import { layer } from '../lib/forest.js';

  const far = layer({ seed: 3, count: 26, span: [-40, 1480], base: 760, height: [200, 330], clear: [[860, 960]] });
  const mid = layer({ seed: 9, count: 14, span: [-60, 1500], base: 930, height: [420, 560], clear: [[600, 1000]] });
  const front = [...layer({ seed: 21, count: 3, span: [-80, 260], base: 1010, height: [620, 740] }), ...layer({ seed: 33, count: 3, span: [1180, 1520], base: 1010, height: [640, 760] })];
  const outside = layer({ seed: 5, count: 9, span: [150, 440], base: 330, height: [70, 120] });
  const STARS = [[120, 80, 1.6], [260, 170, 1.2], [420, 60, 1.4], [560, 140, 1], [690, 50, 1.6], [820, 120, 1.2], [980, 70, 1.4], [1090, 180, 1], [1250, 260, 1.3], [1380, 120, 1.5], [340, 260, 1], [760, 230, 1.3], [620, 300, 1], [900, 300, 1.2]];

  export const FOREST = [
    ['Obloha: hvězdy a měsíc', 'nejvzdálenější vrstva; barevný přechod oblohy a záře měsíce zůstávají v kódu', 'sky'],
    ['Vzdálený les s domkem', 'zadní řada stromů a apartmán se světlem v okně; záře a plápolání okna zůstávají v kódu', 'back'],
    ['Střední stromy', 'prostřední vrstva', 'mid'],
    ['Lesní zem s trávou', 'na ní sedí koťata', 'ground'],
    ['Přední stromy', 'velké, rostou zpoza okraje obrazovky; nejbližší vrstva', 'front'],
  ];
  export const ROOM = [
    ['Okno', 'noc venku, rám, záclony a květina; trochu se posouvá při skrolování', 'window'],
    ['Obývák', 'krb s polenem, obrázek, svíčka, podlaha, koberec, gauč a lampa', 'room'],
    ['Oheň', 'plápolá a svítí do pokoje', 'fire'],
    ['Plovoucí srdíčko', 'nad koťaty', 'heart'],
  ];
</script>

<script>
  import Fit from './Fit.svelte';
  let { piece } = $props();
</script>


<Fit height={['sky', 'back', 'mid', 'ground', 'front', 'room'].includes(piece) ? 200 : 150}>
  {#if piece === 'sky'}
    {#each STARS as [sx, sy, sr]}<circle class="h-star" cx={sx} cy={sy} r={sr * 1.6} />{/each}
    <circle class="h-moon" cx="1190" cy="150" r="54" />
    <circle class="h-crater" cx="1172" cy="138" r="10" />
    <circle class="h-crater" cx="1206" cy="170" r="7" />
    <circle class="h-crater" cx="1210" cy="128" r="5" />
  {:else if piece === 'back'}
    <path class="h-far" d="M-40 900 V772 C120 762 260 780 420 770 S760 764 900 774 S1240 762 1480 772 V900 Z" />
    {#each far as t}<path class="h-far-trunk" d={t.trunk} /><g class="h-far-crown">{#each t.tiers as d}<path {d} />{/each}</g>{/each}
    <path class="h-house" d="M872 760 V706 L912 676 L952 706 V760 Z" />
    <rect class="h-lit" x="900" y="716" width="24" height="20" rx="2" />
    <path class="h-pane" d="M912 716 V736 M900 726 H924" />
  {:else if piece === 'mid'}
    {#each mid as t}<path class="h-mid-trunk" d={t.trunk} /><g class="h-mid">{#each t.tiers as d}<path class="outline" {d} />{/each}{#each t.tiers as d}<path {d} />{/each}</g>{/each}
  {:else if piece === 'ground'}
    <path class="h-ground" d="M-20 900 V832 C200 812 420 824 640 818 C860 812 1100 826 1460 812 V900 Z" />
    <path class="h-tufts" d="M220 846 l4 -12 l4 12 M236 850 l3 -10 l3 10 M1010 842 l4 -12 l4 12 M1028 846 l3 -9 l3 9 M560 840 l3 -10 l3 10 M1180 846 l4 -11 l4 11" />
  {:else if piece === 'front'}
    {#each front as t}<path class="h-front-trunk" d={t.trunk} /><g class="h-front">{#each t.tiers as d}<path class="outline" {d} />{/each}{#each t.tiers as d}<path {d} />{/each}</g>{/each}
  {:else if piece === 'window'}
    <defs><clipPath id="kit-pane"><rect x="150" y="150" width="290" height="190" rx="6" /></clipPath></defs>
    <g clip-path="url(#kit-pane)">
      <rect x="140" y="110" width="310" height="270" fill="#14294a" />
      <circle class="r-moon" cx="388" cy="196" r="20" />
      {#each [[190, 180, 2], [250, 168, 1.6], [320, 200, 1.8], [230, 140, 1.4], [420, 150, 1.6]] as [cx, cy, r]}<circle class="r-star" {cx} {cy} {r} />{/each}
      {#each outside as t}{#each t.tiers as d}<path class="r-pine" {d} />{/each}<path class="r-pine" d={t.trunk} />{/each}
      <rect x="150" y="318" width="290" height="40" fill="#10233a" />
    </g>
    <rect class="r-frame" x="150" y="150" width="290" height="190" rx="6" />
    <path class="r-bars" d="M295 150 V340 M150 245 H440" />
    <path class="r-curtain" d="M138 138 H196 C184 210 196 290 172 372 C156 330 146 250 138 212 Z" />
    <path class="r-curtain" d="M452 138 H394 C406 210 394 290 418 372 C434 330 444 250 452 212 Z" />
    <rect class="r-rod" x="124" y="130" width="342" height="10" rx="5" />
    <rect class="r-sill" x="140" y="338" width="310" height="14" rx="3" />
    <path class="r-pot" d="M352 338 L358 316 H392 L398 338 Z" />
    <path class="r-leaf" d="M375 316 C362 296 352 292 346 282 C362 284 372 296 375 316 Z M375 316 C386 294 398 290 406 280 C392 284 380 296 375 316 Z" />
  {:else if piece === 'room'}
    <rect class="r-stone" x="500" y="200" width="220" height="200" />
    <path class="r-stones" d="M500 240 H720 M500 280 H720 M500 320 H720 M500 360 H720 M560 200 V240 M660 200 V240 M530 240 V280 M610 240 V280 M690 240 V280 M560 280 V320 M660 280 V320" />
    <rect class="r-mantel" x="482" y="186" width="256" height="20" rx="4" />
    <path class="r-hearth" d="M540 400 V320 Q610 268 680 320 V400 Z" />
    <!-- the log: the site cuts it from the drawing again and lays it over the flames -->
    <rect class="r-log" x="560" y="388" width="100" height="12" rx="5" data-part="0" />
    <rect class="r-frame-pic" x="510" y="140" width="56" height="46" rx="3" />
    <path class="r-pic-heart" d="M538 176 C538 176 522 167 522 158 A7 7 0 0 1 538 154 A7 7 0 0 1 554 158 C554 167 538 176 538 176 Z" />
    <rect class="r-candle" x="690" y="150" width="16" height="36" rx="2" />
    <path class="r-candle-flame" d="M698 148 C692 140 698 132 698 128 C704 134 706 142 698 148 Z" />
    <rect class="r-floor" x="-20" y="400" width="1480" height="80" />
    <path class="r-boards" d="M-20 426 H1460 M-20 452 H1460 M120 400 V426 M420 426 V452 M760 400 V426 M1100 426 V452 M300 452 V480 M980 452 V480" />
    <rect class="r-skirting" x="-20" y="392" width="1480" height="12" />
    <ellipse class="r-rug" cx="850" cy="420" rx="150" ry="30" />
    <ellipse class="r-rug-in" cx="850" cy="420" rx="112" ry="19" />
    <rect class="r-sofa" x="1010" y="300" width="300" height="110" rx="24" />
    <rect class="r-sofa-back" x="1030" y="230" width="260" height="96" rx="22" />
    <rect class="r-sofa" x="992" y="290" width="54" height="120" rx="22" />
    <rect class="r-sofa" x="1274" y="290" width="54" height="120" rx="22" />
    <rect class="r-cushion" x="1060" y="268" width="70" height="56" rx="14" transform="rotate(-8 1095 296)" />
    <path class="r-cushion-heart" d="M1096 306 C1096 306 1084 299 1084 292 A5.5 5.5 0 0 1 1096 289 A5.5 5.5 0 0 1 1108 292 C1108 299 1096 306 1096 306 Z" />
    <path class="r-leg" d="M1030 410 V420 M1290 410 V420" />
    <path class="r-lamp-pole" d="M1384 400 V226" />
    <ellipse class="r-lamp-foot" cx="1384" cy="400" rx="26" ry="7" />
    <path class="r-shade" d="M1350 226 L1360 170 H1408 L1418 226 Z" />
  {:else if piece === 'fire'}
    <path class="r-flame-o" d="M572 396 C564 368 586 356 582 330 C600 348 598 318 616 300 C620 330 642 336 638 358 C654 350 654 374 646 396 Z" />
    <path class="r-flame-i" d="M590 396 C586 374 600 368 600 352 C612 364 616 344 622 338 C626 360 636 372 630 396 Z" />
  {:else if piece === 'heart'}
    <path class="r-heart" d="M880 296 C880 296 868 289 868 282 A5.5 5.5 0 0 1 880 279 A5.5 5.5 0 0 1 892 282 C892 289 880 296 880 296 Z" />
  {/if}
</Fit>

<style>
  /* every outline at a true width, as on the site, however small the piece is drawn here */
  path, rect, ellipse, circle {
    vector-effect: non-scaling-stroke;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  /* night forest (Hero.svelte) */
  .h-star { fill: #fff; }
  .h-moon { fill: #f4f1d8; stroke: var(--ink); stroke-width: 3; }
  .h-crater { fill: #dcd6b4; }
  .h-house { fill: #10223a; stroke: #05090f; stroke-width: 3; }
  .h-lit { fill: #ffcf5c; stroke: #05090f; stroke-width: 2.5; }
  .h-pane { stroke: #8a5a1c; stroke-width: 2; }
  .h-far { fill: #1c3453; }
  .h-far-crown { fill: #1d3c55; }
  .h-far-trunk { fill: #2c3346; }
  .h-mid { fill: #163449; }
  .h-mid .outline { stroke: #0a1220; stroke-width: 6; stroke-linejoin: round; }
  .h-mid-trunk { fill: #33293a; stroke: #0a1220; stroke-width: 3; }
  .h-front { fill: #0e2536; }
  .h-front .outline { stroke: #05090f; stroke-width: 8; stroke-linejoin: round; }
  .h-front-trunk { fill: #2a1d24; stroke: #05090f; stroke-width: 4; }
  .h-ground { fill: #10233a; stroke: #05090f; stroke-width: 3; }
  .h-tufts { fill: none; stroke: #2c4a6b; stroke-width: 2.5; }

  /* living room (Contact.svelte) */
  .r-frame { fill: none; stroke-width: 7; stroke: #7a4f2a; }
  .r-bars { fill: none; stroke: #7a4f2a; stroke-width: 6; }
  .r-sill { fill: #e9cfa0; stroke: var(--ink); stroke-width: 3; }
  .r-curtain { fill: #d6407a; stroke: var(--ink); stroke-width: 2.5; }
  .r-rod { fill: #7a4f2a; stroke: var(--ink); stroke-width: 3; }
  .r-pot { fill: #c46a3b; stroke: var(--ink); stroke-width: 2.4; }
  .r-leaf { fill: #5cbf5f; stroke: var(--ink); stroke-width: 2; }
  .r-moon { fill: #f4f1d8; stroke: var(--ink); stroke-width: 3; }
  .r-star { fill: #fff; }
  .r-pine { fill: #1c3453; }
  .r-stone { fill: #b7bdc4; stroke: var(--ink); stroke-width: 3; }
  .r-stones { fill: none; stroke: #8f959d; stroke-width: 2.5; }
  .r-mantel { fill: #8a5a3b; stroke: var(--ink); stroke-width: 3; }
  .r-hearth { fill: #2a1a0c; stroke: var(--ink); stroke-width: 3; }
  .r-log { fill: #6a412a; stroke: var(--ink); stroke-width: 3; }
  .r-flame-o { fill: #ff8a2a; stroke: var(--ink); stroke-width: 2.5; }
  .r-flame-i { fill: #ffd76b; }
  .r-frame-pic { fill: var(--paper); stroke: var(--ink); stroke-width: 2.5; }
  .r-pic-heart { fill: var(--route); stroke: var(--ink); stroke-width: 1.6; }
  .r-candle { fill: var(--paper); stroke: var(--ink); stroke-width: 2.4; }
  .r-candle-flame { fill: #ffb347; stroke: var(--ink); stroke-width: 1.6; }
  .r-floor { fill: #b9763f; }
  .r-boards { fill: none; stroke: #94592b; stroke-width: 2.5; }
  .r-skirting { fill: #f3ead6; stroke: var(--ink); stroke-width: 3; }
  .r-rug { fill: #c94a3c; stroke: var(--ink); stroke-width: 3; }
  .r-rug-in { fill: none; stroke: #f6d79c; stroke-width: 2.5; stroke-dasharray: 7 7; }
  .r-sofa { fill: #3a78b0; stroke: var(--ink); stroke-width: 3; }
  .r-sofa-back { fill: #2f6496; stroke: var(--ink); stroke-width: 3; }
  .r-cushion { fill: #ffd76b; stroke: var(--ink); stroke-width: 3; }
  .r-cushion-heart { fill: var(--route); stroke: var(--ink); stroke-width: 1.6; }
  .r-leg { fill: none; stroke: var(--ink); stroke-width: 6; }
  .r-lamp-pole { fill: none; stroke: var(--ink); stroke-width: 5; }
  .r-lamp-foot { fill: #7a4f2a; stroke: var(--ink); stroke-width: 3; }
  .r-shade { fill: #ffd76b; stroke: var(--ink); stroke-width: 3; }
  .r-heart { fill: var(--route); stroke: var(--ink); stroke-width: 2; }
</style>
