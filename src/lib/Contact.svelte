<script>
  import Icon from './Icon.svelte';
  import Text from './Text.svelte';
  import Button from './Button.svelte';
  import Card from './Card.svelte';
  import Kittens from './Kittens.svelte';
  import Flyer from './Flyer.svelte';
  import CatHead from './CatHead.svelte';
  import { parallax } from './parallax.js';
  import Drawn from './Drawn.svelte';
  import { drawn } from './drawn.js';
  import { contact, cats } from '../content.js';
  import { layer } from './forest.js';
  import { onMount } from 'svelte';

  // the fire is the only light in the room: track where it is so the darkness can fall away from it
  let room;
  let fireEl;
  let light = $state('');
  function place() {
    if (!room || !fireEl) return;
    const r = room.getBoundingClientRect();
    const f = fireEl.getBoundingClientRect();
    const fx = f.left + f.width / 2 - r.left;
    const fy = f.top + f.height * 0.55 - r.top;
    // reach: the distance to the farthest corner, so the far corners end up darkest
    const reach = Math.max(Math.hypot(fx, fy), Math.hypot(r.width - fx, fy), Math.hypot(fx, r.height - fy), Math.hypot(r.width - fx, r.height - fy));
    light = `--fx:${fx.toFixed(0)}px; --fy:${fy.toFixed(0)}px; --reach:${reach.toFixed(0)}px`;
  }
  onMount(() => {
    place();
    const ro = new ResizeObserver(place);
    ro.observe(room);
    return () => ro.disconnect();
  });

  const names = `${cats[0].name} a ${cats[1].name}`;
  const subject = encodeURIComponent(`Domov pro ${cats[0].name}a a ${cats[1].name}`);

  // a postage stamp's perforated edge: little half-round bites along all four sides
  function perforated(w, h, r, step) {
    const nx = Math.round(w / step);
    const ny = Math.round(h / step);
    const sx = w / nx;
    const sy = h / ny;
    let d = `M 0 0`;
    for (let i = 0; i < nx; i++) d += ` L ${i * sx + sx / 2 - r} 0 A ${r} ${r} 0 0 0 ${i * sx + sx / 2 + r} 0`;
    d += ` L ${w} 0`;
    for (let i = 0; i < ny; i++) d += ` L ${w} ${i * sy + sy / 2 - r} A ${r} ${r} 0 0 0 ${w} ${i * sy + sy / 2 + r}`;
    d += ` L ${w} ${h}`;
    for (let i = nx - 1; i >= 0; i--) d += ` L ${i * sx + sx / 2 + r} ${h} A ${r} ${r} 0 0 0 ${i * sx + sx / 2 - r} ${h}`;
    d += ` L 0 ${h}`;
    for (let i = ny - 1; i >= 0; i--) d += ` L 0 ${i * sy + sy / 2 + r} A ${r} ${r} 0 0 0 0 ${i * sy + sy / 2 - r}`;
    return d + ' Z';
  }
  const stampEdge = perforated(78, 94, 3.4, 11);
  const body = encodeURIComponent(
    `Ahoj Velíku a Polly,\n\nrádi bychom vám dali domov (oběma / jednomu z vás).\n\nKde bydlíme:\nKdo u nás žije (lidi i zvířata):\nNěco o nás:\n\n`,
  );

  // the night forest from the opening, seen through the living-room window: a far row and a near one
  const far = layer(5, 9, 330, 600, 300, 60, 95);
  const near = layer(11, 6, 330, 600, 330, 95, 140);
</script>

<section class="contact" id="domov" aria-labelledby="domov-h" bind:this={room} style={light}>
  <!-- the green map rolls down into the night -->
  <svg class="hills" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
    <path class="edge" d="M-10 38 C120 72 240 76 360 50 C480 24 560 20 700 52 C840 82 960 80 1080 50 C1200 20 1320 26 1450 60" />
  </svg>

  <div class="wrap top">
    <div class="copy">
      <Text variant="title" id="domov-h" class="lit-title">Hledáme rodinu</Text>
      <Text variant="lede" class="contact-lede">
        Z&nbsp;Chorvatska jsme dojeli až sem. Teď hledáme lidi, ke kterým budeme patřit. Budeme u&nbsp;vás pořád a&nbsp;moc toho nepotřebujeme. Když máte gauč na spaní a&nbsp;okno, ze kterého se dá koukat ven, úplně nám to stačí. Zbytek dodají lidi, co nás zachránili. Jsme k&nbsp;darování zadarmo, ideálně oba společně do jednoho domova.
      </Text>
      <Text variant="subheading" as="p" class="free">Naši lidi za nás nic nechtějí, ani korunu. Jen <span class="mark">dobrý domov</span> pro nás dva.</Text>
    </div>

    <!-- the back of a postcard: the message on the left, the ways to write on the right, the stamp in its corner -->
    <div class="sheet">
      <Card>
        <svg class="stamp" viewBox="-20 -6 106 112" aria-hidden="true">
          <g class="stamp-piece">
          <g transform="rotate(4 39 47)">
              <path class="stamp-edge" d={stampEdge} />
              <rect class="stamp-art" x="7" y="7" width="64" height="66" rx="2" />
              <path class="stamp-hill" d="M7 58 C24 52 42 54 71 48 V73 H7 Z" />
              <circle class="stamp-moon" cx="58" cy="20" r="6" />
              <CatHead cat="velik" cx={29} cy={54} r={14} mood="happy" wobble={false} tilt={6} />
              <CatHead cat="polly" cx={52} cy={60} r={12} mood="happy" wobble={false} tilt={-6} />
              <text class="stamp-text" x="39" y="86" text-anchor="middle">DOMOV</text>
            </g>
          </g>
          <!-- round postmark, just catching the stamp's corner -->
          <g class="postmark">
            <circle cx="0" cy="82" r="17" />
            <circle cx="0" cy="82" r="12.5" stroke-dasharray="2 2.4" />
            <text x="0" y="81" text-anchor="middle">PRAHA</text>
            <text x="0" y="89" text-anchor="middle" class="pm-small">2026</text>
          </g>
        </svg>

        <div class="pc">
        <div class="pc-msg">
        <Text variant="heading" class="card-title">Napište našim lidem</Text>
        <Text variant="subheading" as="p" class="ask">Stačí pár řádků o&nbsp;vás:</Text>
        <ul class="prompts">
          <li>
            <Icon name="home" size={28} />
            <Text as="span">Kde a&nbsp;jak bydlíte,</Text>
          </li>
          <li>
            <Icon name="heart" size={28} />
            <Text as="span">Kdo u&nbsp;vás žije, lidi i&nbsp;zvířata (psů se nebojíme),</Text>
          </li>
          <li>
            <Icon name="cats" size={28} />
            <Text as="span">Jestli byste si vzali nás oba, nebo jednoho.</Text>
          </li>
        </ul>
        <Text class="after">Pošleme vám další fotky a&nbsp;domluvíme se, jak se poznáme.</Text>
        </div>

        <div class="pc-addr">
        <div class="actions">
          <Button href="mailto:{contact.email}?subject={subject}&body={body}">
            <Icon name="mail" size={28} />
            <span class="btn-text">
              <Text variant="small" as="span" class="btn-cap">Pošlete e-mail</Text>
              <span class="handle">{contact.email}</span>
            </span>
          </Button>
          <Button
            theme="paper"
            href={contact.placeholder ? '#domov' : `https://instagram.com/${contact.instagram}`}
            target={contact.placeholder ? undefined : '_blank'}
            rel="noopener"
          >
            <Icon name="instagram" size={28} />
            <span class="btn-text">
              <Text variant="small" as="span" class="btn-cap">Ozvěte se na Instagramu</Text>
              <span class="handle">@{contact.instagram}</span>
            </span>
          </Button>
        </div>
        </div>
        </div>
      </Card>
    </div>

    <Flyer />
  </div>

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

    {#snippet fire()}
      <g class="fire" bind:this={fireEl}>
        <Drawn id="O3">
          <g transform="translate(392 0)">
            <path class="flame-o" d="M572 396 C564 368 586 356 582 330 C600 348 598 318 616 300 C620 330 642 336 638 358 C654 350 654 374 646 396 Z" />
            <path class="flame-i" d="M590 396 C586 374 600 368 600 352 C612 364 616 344 622 338 C626 360 636 372 630 396 Z" />
          </g>
        </Drawn>
      </g>
    {/snippet}

    {#snippet sleepers()}
      <Kittens x={-47} y={-454} />
      <g transform="translate(744 191)">
        <g class="hearts"><Icon name="heart" size={30} /></g>
      </g>
    {/snippet}

    <!-- the window to the night forest; it hangs on the wall and drifts a touch behind the
         furniture as you scroll, and the night inside it drifts in layers behind the glass.
         Hand-drawn (see drawn.js): the window is one picture (O1), the rest of the room another
         (O2); the fire, the kittens, the heart and the glows stay separate, as they move -->
    <g use:parallax={0.05}>
    <Drawn id="O1">
    <g clip-path="url(#pane)">
      <rect class="sky" x="330" y="110" width="260" height="230" />
      <!-- depth through the glass: the sky lags the window the most, the far trees less, the
           near ones least, so the forest slides past the frame in layers -->
      <g use:parallax={0.045}>
        <circle class="moon" cx="530" cy="164" r="17" />
        <circle class="crater" cx="524" cy="160" r="3.4" /><circle class="crater" cx="536" cy="170" r="2.4" />
        {#each [[372, 150, 1.8], [410, 136, 1.4], [452, 170, 1.6], [486, 140, 1.3], [392, 190, 1.2], [560, 206, 1.4]] as [cx, cy, r]}<circle class="star" {cx} {cy} {r} />{/each}
      </g>
      <!-- the forest, one flat colour a row: the far one paler, the near one darker -->
      <g use:parallax={0.032}>
        {#each far as t}<path class="pine far" d={t.trunk} />{#each t.tiers as d}<path class="pine far" {d} />{/each}{/each}
        <path class="snow" d="M330 306 C380 298 430 304 470 300 S550 296 590 304 V370 H330 Z" />
      </g>
      <g use:parallax={0.02}>
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
    </Drawn>
    </g>

    {#if drawn('O2')}
      <circle class="warm" cx="1005" cy="330" r="230" fill="url(#firelight)" />
      <circle class="warm" cx="1378" cy="190" r="110" fill="url(#firelight)" />
      <Drawn id="O2" />
      {@render fire()}
      <!-- the log, cut from the room drawing, back in front of the flames -->
      <Drawn id="O2" part={0} />
      {@render sleepers()}
    {:else}
    <!-- the floor and the skirting board -->
    <rect class="floor" x="-1100" y="400" width="3640" height="80" />
    <path class="boards" d="M-1100 426 H2540 M-1100 452 H2540 M-560 400 V426 M-220 426 V452 M120 400 V426 M420 426 V452 M760 400 V426 M1100 426 V452 M1460 400 V426 M1800 426 V452 M2140 400 V426 M-380 452 V480 M300 452 V480 M980 452 V480 M1640 452 V480" />
    <rect class="skirting" x="-1100" y="392" width="3640" height="12" />

    <!-- a bookshelf: two shelves of books, a little plant on top -->
    <rect class="wood" x="150" y="226" width="136" height="174" rx="4" />
    <rect class="shelf-back" x="162" y="238" width="112" height="152" />
    <path class="shelf" d="M162 290 H274 M162 342 H274" />
    {#each [[166, 252, 12, '#c94a3c'], [180, 258, 10, '#3a78b0'], [192, 248, 14, '#e7c45a'], [208, 262, 11, '#5cbf5f'], [244, 256, 12, '#d6407a'], [166, 304, 14, '#e7c45a'], [182, 300, 10, '#c94a3c'], [194, 308, 12, '#3a78b0'], [232, 302, 13, '#5cbf5f'], [247, 306, 10, '#f3ead6']] as [bx, by, bw, c]}
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
    {@render fire()}
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
    {/if}
  </svg>

  <!-- the room is dark except for the firelight: darker the farther from the flame -->
  <div class="dark" aria-hidden="true"></div>
  <div class="flicker" aria-hidden="true"></div>
</section>

<style>
  /* a warm living-room wall with striped wallpaper */
  .contact {
    --hh: clamp(48px, 7vw, 90px);
    position: relative;
    overflow: hidden;
    color: var(--ink);
  }
  /* the wall, cut along the wave so the map's own ground shows above it */
  .contact::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(90deg, transparent 0 46px, rgba(214, 140, 60, 0.16) 46px 58px),
      linear-gradient(180deg, #fbe7bd 0%, #f6d79c 100%);
    mask:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 90' preserveAspectRatio='none'%3E%3Cpath d='M-10 38 C120 72 240 76 360 50 C480 24 560 20 700 52 C840 82 960 80 1080 50 C1200 20 1320 26 1450 60 V100 H-10 Z'/%3E%3C/svg%3E") 0 -1.5px / 100% var(--hh) no-repeat,
      linear-gradient(#000, #000) 0 calc(var(--hh) - 2px) / 100% 100% no-repeat;
  }
  .contact > * {
    position: relative;
  }
  /* darkness falling away from the fire; it covers the wall and the furniture, but not the text and card */
  .dark,
  .flicker {
    position: absolute !important;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    mask:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 90' preserveAspectRatio='none'%3E%3Cpath d='M-10 38 C120 72 240 76 360 50 C480 24 560 20 700 52 C840 82 960 80 1080 50 C1200 20 1320 26 1450 60 V100 H-10 Z'/%3E%3C/svg%3E") 0 -1.5px / 100% var(--hh) no-repeat,
      linear-gradient(#000, #000) 0 calc(var(--hh) - 2px) / 100% 100% no-repeat;
  }
  .dark {
    background: radial-gradient(
      circle var(--reach, 1400px) at var(--fx, 42%) var(--fy, 85%),
      rgba(26, 13, 5, 0) 0,
      rgba(26, 13, 5, 0) 22%,
      rgba(26, 13, 5, 0.1) 46%,
      rgba(22, 11, 4, 0.26) 74%,
      rgba(18, 9, 3, 0.4) 100%
    );
  }
  /* warm firelight right around the flame, breathing with it */
  .flicker {
    background: radial-gradient(
      circle calc(var(--reach, 1400px) * 0.48) at var(--fx, 42%) var(--fy, 85%),
      rgba(255, 150, 50, 0.32) 0,
      rgba(255, 130, 40, 0.14) 45%,
      rgba(255, 120, 40, 0) 100%
    );
    mix-blend-mode: screen;
    animation: firelight 3.2s ease-in-out infinite;
  }
  @keyframes firelight {
    0%, 100% { opacity: 0.75; }
    18% { opacity: 1; }
    34% { opacity: 0.82; }
    52% { opacity: 0.96; }
    71% { opacity: 0.7; }
    86% { opacity: 0.92; }
  }
  .top {
    z-index: 2;
  }
  .hills {
    z-index: 3;
  }
  .hills {
    display: block;
    width: 100%;
    height: clamp(48px, 7vw, 90px);
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
  .top {
    position: relative;
    z-index: 2;
    display: grid;
    gap: 32px;
    padding: clamp(40px, 7vw, 88px) var(--pad) 0;
    max-width: calc(1120px + 2 * var(--pad));
  }
  /* the wall around the text is only lightly shaded, so the words stay in dark ink */
  .top :global(.lit-title) {
    color: var(--ink);
  }
  .top :global(.contact-lede) {
    margin-top: 16px;
    color: #2a1a0c;
    max-width: 38ch;
  }
  .top :global(.free) {
    margin-top: 14px;
    max-width: 30ch;
    color: var(--ink);
  }
  /* hand-drawn red marker underline under the one thing they ask for */
  .mark {
    padding-bottom: 2px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 8' preserveAspectRatio='none'%3E%3Cpath d='M2 5 C30 2 60 7 118 3' fill='none' stroke='%23d6332a' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E") bottom / 100% 0.4em no-repeat;
  }

  /* the room */
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
  @keyframes breathe {
    0%, 100% { scale: 1 1; }
    50% { scale: 1.015 1.04; }
  }
  @keyframes float {
    0%, 100% { opacity: 0; translate: 0 8px; }
    40%, 70% { opacity: 1; translate: 3px -6px; }
  }

  /* the contact card: the back of a postcard on cream card stock */
  .sheet {
    --card-pad: 26px 20px 22px;
    max-width: 980px;
    width: 100%;
    text-align: left;
    font-family: var(--f-marker);
    transform: rotate(-0.8deg);
    --card-bg:
      radial-gradient(circle at 20% 15%, rgba(255, 255, 255, 0.6), transparent 55%),
      #fbf6e8;
  }
  .pc {
    display: grid;
    gap: 16px;
  }
  /* the right side: just the two ways to write, under the stamp */
  .pc-addr {
    display: grid;
    align-content: end;
    gap: 0;
    padding-top: 12px;
    border-top: 2px solid var(--ink);
  }
  /* the old forest address, scratched out with two quick red marker strokes */
  .pc-addr .actions {
    gap: 10px;
  }
  .pc-msg :global(.after) {
    margin-bottom: 0;
  }
  .pc-msg .prompts {
    gap: 14px;
    margin: 22px 0 24px;
  }
  .sheet :global(.ask) {
    margin-top: 14px;
  }
  .sheet :global(.card-title),
  .sheet :global(.ask) {
    padding-right: clamp(96px, 26vw, 124px);
  }
  /* stamp and postmark in the corner, as on a real postcard */
  .stamp {
    position: absolute;
    top: 12px;
    right: 12px;
    width: clamp(88px, 22vw, 112px);
    overflow: visible;
    transition: rotate 0.5s var(--ease-back), translate 0.5s var(--ease-back);
  }
  .sheet:hover .stamp {
    rotate: -6deg;
    translate: 0 -3px;
  }
  .stamp-edge {
    fill: var(--paper);
    stroke: var(--ink);
    stroke-width: 3;
    vector-effect: non-scaling-stroke;
    filter: drop-shadow(0 3px 2px rgba(60, 35, 10, 0.25));
  }
  .stamp-art {
    fill: #8fbbe0;
    stroke: var(--ink);
    stroke-width: 1.6;
  }
  .stamp-hill {
    fill: #a6d58a;
  }
  .stamp-moon {
    fill: #f4f1d8;
    stroke: var(--ink);
    stroke-width: 1.4;
  }
  .stamp-text {
    font-family: var(--f-label);
    font-variation-settings: 'wdth' 70;
    font-weight: 800;
    font-size: 10px;
    letter-spacing: 0.16em;
    fill: var(--route);
  }
  .stamp-piece,
  .postmark {
    transform-box: fill-box;
    transform-origin: center;
  }
  .postmark {
    fill: none;
    stroke: rgba(22, 19, 17, 0.55);
    stroke-width: 1.6;
    stroke-linecap: round;
  }
  .postmark text {
    stroke: none;
    fill: rgba(22, 19, 17, 0.6);
    font-family: var(--f-label);
    font-variation-settings: 'wdth' 70;
    font-weight: 800;
    font-size: 6.5px;
    letter-spacing: 0.06em;
  }
  .postmark .pm-small {
    font-size: 5.5px;
  }

  /* the three things to write about, each with a little cartoon icon */
  .prompts {
    list-style: none;
    margin: 14px 0 18px;
    padding: 0;
    display: grid;
    gap: 10px;
  }
  .prompts li {
    display: flex;
    align-items: center;
    gap: 12px;
    line-height: 1.3;
  }
  .sheet :global(.after) {
    padding-top: 18px;
    margin-bottom: 20px;
    border-top: 2px dashed var(--ink);
  }
  .actions {
    display: grid;
    gap: 12px;
  }
  /* each button: what it does in a small line, the address under it */
  .btn-text {
    display: grid;
    gap: 1px;
    min-width: 0;
    padding-block: 8px;
  }
  .btn-text :global(.btn-cap) {
    opacity: 0.85;
  }
  .handle {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 8px;
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: 1.15rem;
  }
  @media (min-width: 640px) {
    .actions {
      grid-template-columns: 1.2fr 1fr;
    }
  }
  @media (min-width: 760px) {
    /* title and text above, the big postcard below them */
    .top {
      gap: 40px;
      justify-items: center;
      text-align: center;
    }
    /* the heading is a Text component, so it's reached by its class (an #id rule here never matched) */
    .top :global(.lit-title) {
      max-width: none;
    }
    .top :global(.contact-lede) {
      max-width: 52ch;
      margin-inline: auto;
    }
    .top :global(.free) {
      max-width: none;
    }
    .sheet {
      --card-pad: 30px 40px 26px;
    }

    .scene {
      margin-top: 72px;
    }

  }
  /* the postcard splits only when each half has room for an address; a tablet keeps it stacked */
  @media (min-width: 1024px) {
    /* desktop: message and address side by side, split by the postcard's centre line */
    .pc {
      grid-template-columns: 1.05fr 1fr;
      gap: 0;
    }
    /* the message fills its half: list in the middle, the closing line level with the buttons */
    .pc-msg {
      display: flex;
      flex-direction: column;
      padding: 6px 48px 4px 0;
    }
    .pc-msg .prompts {
      gap: 18px;
      margin: 28px 0 30px;
    }
    .pc-msg :global(.after) {
      margin-top: auto;
    }
    .pc-addr {
      padding: 92px 0 0 40px;
      border-top: 0;
      border-left: 2px solid var(--ink);
    }
    .pc-addr .actions {
      grid-template-columns: 1fr;
    }
    .sheet :global(.card-title),
    .sheet :global(.ask) {
      padding-right: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .warm, .fire, .hearts, .flicker { animation: none; }
  }
</style>
