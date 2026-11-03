<script>
  // the trip as a map: the route winds from story to story, the car drives along it as the page
  // scrolls and each story comes up as the car reaches its pin. The geometry is in route.js; this
  // measures where the stories sit on the page, draws the result and moves the car.
  import { onMount, tick } from 'svelte';
  import Text from '../ui/Text.svelte';
  import { ICONS } from '../ui/Icon.svelte';
  import Stop from './Stop.svelte';
  import CarCard from './CarCard.svelte';
  import Doodle from '../art/Doodle.svelte';
  import { parallax } from '../motion/parallax.js';
  import { planRoute, sideOf } from '../art/route.js';
  import { curve, smooth } from '../art/spline.js';
  import { driftClouds, scatterGrass } from '../art/meadow.js';
  import { kmAt, lengthAt } from '../art/odometer.js';
  import { springTo } from '../motion/springs.js';
  import { stops } from '../../content.js';
  import { isWide, onScreen, onScrollFrame, reducedMotion } from '../motion/viewport.js';

  let root;
  let routePath = $state();
  let measurePath;
  // the pin icon's shape (Icon.svelte): the drop, tip at (16, 29) in its 32-unit box, its shine and
  // its centre. The map draws them in its own pin styling: dashed and cream while waiting
  const [[, PIN], [, PIN_SHINE], [, PIN_EYE]] = ICONS.pin;
  let els = $state([]);
  let w = $state(0);
  let h = $state(0);
  let routeD = $state(''); // the route's path data
  let len = $state(0);
  let travelled = $state(0);
  let car = $state({ x: 0, y: 0, tilt: 0, bump: 0 });
  let pins = $state([]);
  let places = $state([]);
  let borders = $state([]);
  let paths = $state({ rivers: [], grass: { light: '', dark: '', flowers: '', hearts: '', pebbles: '' } });
  let clouds = $state([]);
  let anchorY = $state(-1);
  let keypoints = []; // [{ y, len }]: where the route reaches each y, which the car is mapped between
  let pinLens = []; // route length at each stop's pin, for the odometer
  let km = $state(0);
  let moving = $state(false);
  let still = 0;
  let geo = $state.raw([]); // per stop: { x, top, bottom, pinY, exitY }

  const total = $derived(stops[stops.length - 1].km);

  // a story comes up once the car has reached its pin
  const reached = $derived(stops.map((_, i) => anchorY >= 0 && geo.length > 0 && anchorY >= geo[i].pinY));

  function lengthOf(path) {
    measurePath.setAttribute('d', path);
    return measurePath.getTotalLength();
  }
  // points along a river's drawn line, every 8 units
  function sampleRiver(river) {
    measurePath.setAttribute('d', smooth(river));
    const total = measurePath.getTotalLength();
    const out = [];
    for (let l = 0; l < total; l += 8) {
      const q = measurePath.getPointAtLength(l);
      out.push([q.x, q.y]);
    }
    return out;
  }

  // where the route meets each story, from where the stories sit on the page
  function measureStops(wide) {
    const base = root.getBoundingClientRect();
    return stops.map((_, i) => {
      const box = els[i].getBoundingClientRect();
      const top = box.top - base.top;
      const bottom = top + box.height;
      const left = box.left - base.left;
      if (wide) {
        const free = sideOf(i) === 'right' ? left : w - (left + box.width);
        const x = sideOf(i) === 'right' ? free / 2 : w - free / 2;
        return { x, top, bottom, pinY: top + 50, exitY: bottom };
      }
      // phones: the car parks above the story, then drives on behind it
      return { x: left + box.width * (i % 2 ? 0.3 : 0.7), top, bottom, pinY: top - 40, exitY: bottom + 30 };
    });
  }

  // lays the whole map out again for the stories where they now sit (on mount and on every resize)
  function drawMap() {
    if (!root) return;
    const wide = isWide();
    w = root.clientWidth;
    h = root.offsetHeight;
    geo = measureStops(wide);
    const plan = planRoute({ geo, stops, w, wide, sample: sampleRiver });

    // the route is a list of waypoints joined by one smooth spline, so it bends in round curves
    // everywhere and still runs exactly through every pin
    const { pts, marks } = plan;
    const start = `M ${pts[0][0]} ${pts[0][1]}`;
    const pieces = curve(pts);
    const lenAt = (i) => lengthOf(start + pieces.slice(0, i).join(''));
    keypoints = [{ y: geo[0].pinY, len: 0 }, ...marks.map((m) => ({ y: m.y, len: lenAt(m.i) }))];
    pinLens = [0, ...marks.filter((m) => m.pin).map((m) => lenAt(m.i))];
    routeD = start + pieces.join('');
    pins = geo.map((g) => ({ x: g.x, y: g.pinY }));
    places = plan.places;
    borders = plan.borders;
    paths = { rivers: plan.streams.map(smooth), grass: scatterGrass(w, h) };
    clouds = driftClouds(w, h, wide);
    tick().then(() => {
      len = routePath.getTotalLength();
      moveCar();
    });
  }

  // the car sits where the route crosses the middle of the screen
  function moveCar() {
    if (!routePath || !len) return;
    // off screen (e.g. still up in the hero): nothing to move
    if (!onScreen(root)) return;
    const rect = root.getBoundingClientRect();
    const target = Math.min(Math.max(window.innerHeight * 0.5 - rect.top, 0), h - 1);
    const along = Math.min(lengthAt(target, keypoints, len), len);
    if (along === travelled && target === anchorY) return;
    const pt = routePath.getPointAtLength(along);
    const ahead = routePath.getPointAtLength(Math.min(along + 6, len));
    const lean = Math.atan2(ahead.x - pt.x, Math.max(ahead.y - pt.y, 0.01)) * (180 / Math.PI);
    car = {
      x: pt.x,
      y: pt.y,
      tilt: Math.max(-34, Math.min(34, -lean * 0.5)),
      bump: reducedMotion() ? 0 : Math.sin(along / 9) * 1.8,
    };
    travelled = along;
    anchorY = target;
    km = kmAt(along, pinLens, stops);
  }

  onMount(() => {
    let lastY = scrollY;
    const follow = () => {
      if (!onScreen(root)) return;
      // the odometer shows while the car is moving (not on a mere resize) and fades once scrolling stops
      if (scrollY !== lastY) {
        lastY = scrollY;
        moving = true;
        clearTimeout(still);
        still = setTimeout(() => (moving = false), 900);
      }
      moveCar();
    };
    const ro = new ResizeObserver(() => drawMap());
    ro.observe(root);
    const stop = onScrollFrame(follow);
    drawMap();
    return () => {
      ro.disconnect();
      stop();
      clearTimeout(still);
    };
  });
</script>

<!-- one of the pin's shapes drawn like Icon.svelte draws a part: the shade underneath, the fill
     nudged up-left over it (clipped to the shape), the outline on top -->
{#snippet part(d, cls, i)}
  <clipPath id="{cls}-clip-{i}"><path {d} /></clipPath>
  <path class="{cls}-shade" {d} />
  <g clip-path="url(#{cls}-clip-{i})"><path class="{cls}-fill" {d} transform="translate(-2.2 -2.2)" /></g>
  <path class="{cls}-line" {d} />
{/snippet}

<section class="journey section" id="cesta" aria-labelledby="cesta-h">
  <div class="wrap">
    <Text variant="title" id="cesta-h">Jak jsme dojeli z&nbsp;chorvatských hor až do Prahy</Text>
    <Text variant="lede" class="journey-lede">Celkem cca {total} kilometrů. Řídili lidi, my jsme dělali navigaci.</Text>

    <div class="route" bind:this={root}>
      <svg class="map" width={w} height={h} viewBox="0 0 {w} {h}" aria-hidden="true">
        <defs>
          <mask id="driven" maskUnits="userSpaceOnUse">
            <path
              d={routeD}
              fill="none"
              stroke="#fff"
              stroke-width="16"
              stroke-linecap="round"
              style="stroke-dasharray: {len} {len}; stroke-dashoffset: {len - travelled};"
            />
          </mask>
        </defs>
        <path d="" bind:this={measurePath} class="measure" />
        {#each paths.rivers as rv}
          <path class="river-bank" d={rv} />
          <path class="river" d={rv} />
          <path class="river-current" d={rv} />
        {/each}

        <path class="pebbles" d={paths.grass.pebbles} />
        <path class="grass" d={paths.grass.light} />
        <path class="grass dark" d={paths.grass.dark} />
        <path class="flowers" d={paths.grass.flowers} />
        <path class="hearts" d={paths.grass.hearts} />

        {#each places as place}
          <Doodle {...place} />
        {/each}

        {#each borders as b}
          <g class="border">
            <path d="M 0 {b.y} C {w * 0.3} {b.y - 14}, {w * 0.6} {b.y + 14}, {w} {b.y - 4}" />
            <text x={b.side === 'right' ? w - 8 : 8} y={b.y - 12} text-anchor={b.side === 'right' ? 'end' : 'start'}>{b.from}</text>
            <text x={b.side === 'right' ? w - 8 : 8} y={b.y + 26} text-anchor={b.side === 'right' ? 'end' : 'start'}>{b.to}</text>
          </g>
        {/each}

        <path class="ahead" d={routeD} />
        <path class="done" bind:this={routePath} d={routeD} mask="url(#driven)" />

        {#each pins as pin, i}
          <!-- the site's pin icon (Icon.svelte) at map size, tip on the route: a cream outline
               waiting, red with its cel shade and shine once the car arrives -->
          <g class="pin" class:reached={reached[i]} transform="translate({pin.x} {pin.y})">
            <ellipse class="pin-ground" cx="0" cy="1" rx="10" ry="3.5" />
            <g class="pin-body" use:springTo={{ to: { scale: reached[i] ? 1 : 0.85 }, bounce: 0.55, duration: 0.45 }}>
              <g transform="scale(1.75) translate(-16 -29)">
                {@render part(PIN, 'pin', i)}
                <path class="pin-shine" d={PIN_SHINE} />
                <!-- the cream centre, shaded like the icon's -->
                {@render part(PIN_EYE, 'pin-eye', i)}
              </g>
            </g>
          </g>
        {/each}
      </svg>

      <!-- clouds float above the map and lag behind the scroll, so it reads as seen from up high -->
      {#each clouds as c}
        <div class="cloud" style="left:{c.x}px; top:{c.y}px; width:{c.w}px; --dur:{c.dur}s" use:parallax={0.28}>
          <svg viewBox="0 0 200 92" aria-hidden="true" style={c.flip ? 'scale: -1 1' : ''}>
              <!-- the outline under everything, so it only shows around the silhouette; then the
                   puffs in shade, and again in light a little smaller and up to the left, so the
                   shade only rims the lower right of each puff and the base -->
              <rect class="puff-line" x="20" y="56" width="164" height="26" rx="13" />
              {#each c.puffs as [px, py, pr]}<circle class="puff-line" cx={px} cy={py} r={pr} />{/each}
              <rect class="puff-shade" x="20" y="56" width="164" height="26" rx="13" />
              {#each c.puffs as [px, py, pr]}<circle class="puff-shade" cx={px} cy={py} r={pr} />{/each}
              <rect class="puff" x="22" y="52" width="158" height="22" rx="11" />
              {#each c.puffs as [px, py, pr]}<circle class="puff" cx={px - 3} cy={py - 4} r={pr - 4.5} />{/each}
          </svg>
        </div>
      {/each}

      <CarCard {...car} {km} {moving} />

      <div class="stops">
        {#each stops as stop, i (stop.id)}
          <Stop {stop} side={sideOf(i)} reached={reached[i]} bind:el={els[i]} />
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  .journey :global(.journey-lede) {
    margin-top: 14px;
    color: var(--ink-soft);
    max-width: 34ch;
  }
  .route {
    position: relative;
    margin-top: clamp(32px, 6vw, 64px);
    /* room for the Velebit range around the first pin */
    padding-top: 260px;
    padding-bottom: 60px;
  }
  .map {
    position: absolute;
    inset: 0;
    overflow: visible;
    pointer-events: none;
  }
  .measure {
    fill: none;
    stroke: none;
  }
  .map path.ahead,
  .map path.done {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .ahead {
    stroke: var(--ink);
    stroke-width: 2.5;
    stroke-dasharray: 1 10;
    opacity: 0.45;
  }
  .done {
    stroke: var(--route);
    stroke-width: 6;
    stroke-dasharray: 16 11;
  }
  /* the rivers are outlined in ink like everything else on the map, with a light current drifting slowly downstream */
  .river-bank {
    fill: none;
    stroke: var(--ink);
    stroke-width: 15;
    stroke-linecap: round;
  }
  .river {
    fill: none;
    stroke: #7fb6e4;
    stroke-width: 11;
    stroke-linecap: round;
  }
  .river-current {
    fill: none;
    stroke: #d4ebfa;
    stroke-width: 2;
    stroke-linecap: round;
    /* uneven glints, so it never reads as road markings */
    stroke-dasharray: 4 22 14 36;
    opacity: 0.85;
    animation: flow 7s linear infinite;
  }
  @keyframes flow {
    to { stroke-dashoffset: -76; }
  }
  .grass {
    fill: #6c9c45;
  }
  .grass.dark {
    fill: #4f7f35;
  }
  .flowers {
    fill: #fdfcf6;
    stroke: rgba(22, 19, 17, 0.35);
    stroke-width: 0.8;
  }
  .hearts {
    fill: #e8b93a;
  }
  .pebbles {
    fill: #b8b79a;
    stroke: rgba(22, 19, 17, 0.35);
    stroke-width: 1;
  }
  .map text {
    font-family: var(--f-marker);
    font-weight: 700;
    font-size: 15px;
    fill: var(--ink-soft);
  }
  .border path {
    fill: none;
    stroke: var(--ink);
    stroke-width: 2;
    stroke-dasharray: 2 6 10 6;
    opacity: 0.55;
  }
  .border text {
    font-family: var(--f-label);
    font-variation-settings: 'wdth' 70;
    font-weight: 800;
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    opacity: 0.75;
  }
  .pin-ground {
    fill: rgba(22, 19, 17, 0.25);
  }
  /* drawn like the icon: the shade underneath, the fill nudged up-left over it, the outline on top */
  .pin-shade {
    fill: #e3d9bf;
    transition: fill 0.3s linear;
  }
  .pin-fill {
    fill: var(--paper);
    transition: fill 0.3s linear;
  }
  .pin-line {
    fill: none;
    stroke: var(--ink);
    stroke-width: 1.8;
    stroke-linejoin: round;
    stroke-dasharray: 3 2.4;
  }
  .pin-shine {
    fill: none;
    stroke: #fff;
    stroke-width: 1.8;
    stroke-linecap: round;
    opacity: 0;
    transition: opacity 0.3s linear;
  }
  .pin-eye-shade {
    fill: #e3d9bf;
  }
  .pin-eye-fill {
    fill: var(--paper);
  }
  .pin-eye-line {
    fill: none;
    stroke: var(--ink);
    stroke-width: 1.8;
  }
  .pin-body {
    transform-box: fill-box;
    transform-origin: 50% 100%;
  }
  /* arrived: the pin pops up, red and shiny */
  .pin.reached .pin-shade {
    fill: #b3281f;
  }
  .pin.reached .pin-fill {
    fill: #e2483d;
  }
  .pin.reached .pin-line {
    stroke-dasharray: none;
  }
  .pin.reached .pin-shine {
    opacity: 0.8;
  }
  .cloud {
    position: absolute;
    z-index: 2;
    pointer-events: none;
    animation: drift 22s ease-in-out infinite alternate;
    animation-duration: var(--dur);
  }
  .cloud svg {
    display: block;
    width: 100%;
    overflow: visible;
    filter: drop-shadow(0 22px 5px rgba(40, 60, 15, 0.13));
  }
  .puff {
    fill: #fdfcf6;
  }
  .puff-shade {
    fill: #dce4e6;
  }
  /* drawn under the fills at twice the width, so only its outer half shows */
  .puff-line {
    fill: none;
    stroke: var(--ink);
    stroke-width: 6;
    vector-effect: non-scaling-stroke;
  }
  @keyframes drift {
    from { transform: translateX(-18px); }
    to { transform: translateX(18px); }
  }
  @media (prefers-reduced-motion: reduce) {
    .cloud, .river-current { animation: none; }
  }
  .stops {
    --gap: clamp(280px, 48vh, 440px);
    display: grid;
    gap: var(--gap);
  }
  /* Gospić is just down the mountain: the first leg is shorter than the rest */
  .stops > :global(:nth-child(2)) {
    margin-top: calc(250px - var(--gap));
  }
  @media (min-width: 760px) {
    .route {
      padding-top: 150px;
    }
    /* tablets and an unfolded Duo: the story card takes the larger share, the map the rest */
    .journey {
      --gutter: 38%;
    }
  }
  @media (min-width: 1024px) {
    .journey {
      --gutter: 44%;
    }
  }
</style>
