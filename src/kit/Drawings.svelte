<script>
  // Templates for redrawing by hand, as large as the site allows: every whole place on the map, each
  // parallax layer of the night forest, and the living room in a few parts. Each piece is numbered;
  // a drawing saved under that number replaces it (see src/lib/drawn.js). The map places are drawn
  // here as the map draws them; the forest and room parts are copies of the scenes (ScenePieces.svelte).
  import Doodle from '../lib/Doodle.svelte';
  import Kittens from '../lib/Kittens.svelte';
  import ScenePieces, { FOREST, ROOM } from './ScenePieces.svelte';
  import Fit from './Fit.svelte';
  import { stops } from '../content.js';

  // the pin icon's drop (Icon.svelte), tip at (16, 29) in its 32-unit box
  const PIN = 'M16 29s-9-8-9-15a9 9 0 0 1 18 0c0 7-9 15-9 15Z';

  // M1-M9 · whole places; a place before a stop gets its seed from the stop's position (as in
  // Journey.svelte), so Prague and the farm look exactly as on the map
  const seedOf = (doodle) => stops.findIndex((st) => st.doodle === doodle) + 3;
  const PLACES = [
    ['Celá Praha', 'hrad, kopec, Malá Strana, Staré Město, Týn, Karlův most; Vltavu kreslí mapa', 'city', seedOf('city'), 1.6],
    ['Celá farma', 'ohrada, stodola, silo, domek, krávy, seno, stromy; kouř z komína zůstává v kódu', 'farm', seedOf('farm'), 1.2],
    ['Pohoří', 'použije se pro všechna pohoří na mapě', 'mountains', 8, 1.2],
    ['Lesík', 'použije se pro všechny lesy', 'forest', 2, 1.2],
    ['Kopce', 'použije se pro všechny kopce', 'hills', 10, 1.2],
    ['Jezero s rákosím', 'použije se pro všechna jezera', 'lake', 17, 1.2],
    ['Políčka', 'použije se pro všechna pole', 'field', 2, 1.2],
    ['Rozhledna', 'odbočka „vyhlídka“', 'lookout', 1, 1.2],
    ['Odpočívadlo', 'odbočka „odpočívadlo“', 'rest', 1, 1.2],
  ];

  // for the template export: the number, how many screen pixels one unit takes on the site, and
  // how thick the outlines are there
  const tpl = (id, px, line) => ({ 'data-id': id, 'data-px': px, 'data-line': line });
</script>

<div class="sheet">
  <header class="top">
    <h1>Kresby k překreslení</h1>
    <p>Co největší kusy: celá místa na mapě, vrstvy nočního lesa a obývák. Každý kus má číslo; kresba uložená pod tím číslem ho na webu nahradí.</p>
    <nav><a href="#m">M Mapa</a><a href="#f">F Noční les</a><a href="#o">O Obývák</a></nav>
  </header>

  <section id="m">
    <h2><span class="letter">M</span> Mapa cesty</h2>
    <div class="grid">
      {#each PLACES as [name, where, kind, seed, px], i}
        <figure class="item whole" {...tpl(`M${i + 1}`, px, 1.6)}>
          <span class="no">M{i + 1}</span>
          <Fit height={kind === 'city' ? 260 : 170}>
            {#if kind === 'city'}
              <!-- the Vltava as the map draws it through the city -->
              <path class="river-bank" d="M2 -110 L -6 -40 L 2 2 L 10 40 L 26 90" />
              <path class="river" d="M2 -110 L -6 -40 L 2 2 L 10 40 L 26 90" />
            {/if}
            <Doodle {kind} {seed} />
          </Fit>
          <figcaption><b>{name}</b><span>{where}</span></figcaption>
        </figure>
      {/each}

      <figure class="item" {...tpl('M10', 0.8, 2)}>
        <span class="no">M10</span>
        <Fit>
          <path class="puff" d="M30 82 C8 82 4 56 26 52 C22 28 52 20 66 36 C72 12 112 8 122 32 C134 18 162 24 164 46 C188 44 198 74 174 82 Z" />
          <path class="puff-shade" d="M24 74 C40 78 150 80 176 74 C182 78 178 82 174 82 H30 C26 82 22 79 24 74 Z" />
        </Fit>
        <figcaption><b>Mrak</b><span>plují nad mapou</span></figcaption>
      </figure>
      <figure class="item" {...tpl('M11', 1.2, 2)}>
        <span class="no">M11</span>
        <Fit>
          {#each ['upcoming', 'current'] as st, k}
            <g class="pin {st}" transform="translate({k * 60} 0)" data-part={k}>
              <ellipse class="pin-ground" cx="0" cy="1" rx="10" ry="3.5" />
              <!-- the site's pin icon at map size, as on the map (Journey.svelte) -->
              <g transform="scale(1.75) translate(-16 -29)">
                <clipPath id="tpl-pin-clip-{k}"><path d={PIN} /></clipPath>
                <path class="pin-shade" d={PIN} />
                <g clip-path="url(#tpl-pin-clip-{k})"><path class="pin-fill" d={PIN} transform="translate(-2.2 -2.2)" /></g>
                <path class="pin-line" d={PIN} />
                <path class="pin-shine" d="M10.3 12 a6.2 6.2 0 0 1 3 -3.8" />
                <!-- the cream centre, shaded like the icon's -->
                <clipPath id="tpl-pin-eye-clip-{k}"><path d="M12.4 14 a3.6 3.6 0 1 0 7.2 0 a3.6 3.6 0 1 0 -7.2 0 Z" /></clipPath>
                <path class="pin-eye-shade" d="M12.4 14 a3.6 3.6 0 1 0 7.2 0 a3.6 3.6 0 1 0 -7.2 0 Z" />
                <g clip-path="url(#tpl-pin-eye-clip-{k})"><path class="pin-eye-fill" d="M12.4 14 a3.6 3.6 0 1 0 7.2 0 a3.6 3.6 0 1 0 -7.2 0 Z" transform="translate(-2.2 -2.2)" /></g>
                <path class="pin-eye" d="M12.4 14 a3.6 3.6 0 1 0 7.2 0 a3.6 3.6 0 1 0 -7.2 0 Z" />
              </g>
            </g>
          {/each}
        </Fit>
        <figcaption><b>Špendlík zastávky</b><span>čeká / dojeto, oba vedle sebe</span></figcaption>
      </figure>
      <figure class="item" {...tpl('M12', 1, 3)} data-body="80 27">
        <span class="no">M12</span>
        <!-- the car's body as CarCard.svelte draws it, in its own pixels -->
        <Fit>
          <path class="car-body" d="M11 1.5 H63 A15.5 15.5 0 0 1 78.5 17 V19 A6.5 6.5 0 0 1 72 25.5 H8 A6.5 6.5 0 0 1 1.5 19 V11 A9.5 9.5 0 0 1 11 1.5 Z" />
          {#each [18, 62] as cx}
            <circle class="tyre" {cx} cy="27" r="8" />
            <circle class="hub" {cx} cy="27" r="3" />
          {/each}
        </Fit>
        <figcaption><b>Auto</b><span>karoserie a kola; hlavy jsou fotky a jedou nahoře</span></figcaption>
      </figure>
    </div>
  </section>

  <section id="f">
    <h2><span class="letter">F</span> Noční les v úvodu</h2>
    <div class="grid">
      {#each FOREST as [name, where, piece], i}
        <figure class="item night whole" {...tpl(`F${i + 1}`, 1, 3)}>
          <span class="no">F{i + 1}</span>
          <ScenePieces {piece} />
          <figcaption><b>{name}</b><span>{where}</span></figcaption>
        </figure>
      {/each}
      <figure class="item night" {...tpl(`F${FOREST.length + 1}`, 1, 3)}>
        <span class="no">F{FOREST.length + 1}</span>
        <Fit><Kittens cold /></Fit>
        <figcaption><b>Koťata v zimě</b><span>těla, ocásek a stín; hlavy jsou fotky</span></figcaption>
      </figure>
    </div>
  </section>

  <section id="o">
    <h2><span class="letter">O</span> Obývák na konci</h2>
    <div class="grid">
      {#each ROOM as [name, where, piece], i}
        <figure class="item room" class:whole={piece === 'room'} {...tpl(`O${i + 1}`, 1, 3)}>
          <span class="no">O{i + 1}</span>
          <ScenePieces {piece} />
          <figcaption><b>{name}</b><span>{where}</span></figcaption>
        </figure>
      {/each}
      <figure class="item room" {...tpl(`O${ROOM.length + 1}`, 1, 3)}>
        <span class="no">O{ROOM.length + 1}</span>
        <Fit><Kittens /></Fit>
        <figcaption><b>Koťata v teple</b><span>těla, ocásek a stín; hlavy jsou fotky</span></figcaption>
      </figure>
    </div>
  </section>
</div>

<style>
  .sheet {
    max-width: 1120px;
    margin: 0 auto;
    padding: 48px var(--pad) 120px;
  }
  .top h1 {
    font-size: clamp(2.4rem, 8vw, 4rem);
  }
  .top p {
    margin-top: 12px;
    max-width: 60ch;
    font-size: 1.15rem;
  }
  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    margin-top: 18px;
    font-weight: 700;
  }
  section {
    margin-top: 64px;
    scroll-margin-top: 20px;
  }
  section > h2 {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: clamp(1.8rem, 5vw, 2.4rem);
    margin-bottom: 20px;
  }
  .letter {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    background: var(--ink);
    color: var(--paper);
    border-radius: 12px;
    font-size: 1.5rem;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
    gap: 16px;
  }
  .item {
    position: relative;
    margin: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 14px;
    padding: 40px 18px 16px;
    background: rgba(251, 250, 245, 0.55);
    border: 2px dashed rgba(22, 19, 17, 0.25);
    border-radius: 16px;
  }
  /* a mid blue-grey, so both the dark trees and the pale stars and fog show */
  .item.night {
    background: #5b7090;
  }
  .item.room {
    background: #f6efe0;
  }
  .no {
    position: absolute;
    top: 10px;
    left: 12px;
    padding: 1px 8px;
    background: var(--ink);
    color: var(--paper);
    border-radius: 6px;
    font-family: var(--f-label);
    font-weight: 700;
    font-size: 0.85rem;
  }

  figcaption {
    display: grid;
    gap: 2px;
    font-family: var(--f-label);
    font-variation-settings: 'wdth' 85;
    font-size: 0.85rem;
    color: #4a4238;
  }
  figcaption b {
    font-family: var(--f-marker);
    font-size: 1rem;
    color: var(--ink);
  }
  .night figcaption,
  .night figcaption b {
    color: #f4f7fb;
  }

  /* map pieces as Journey.svelte and CarCard.svelte draw them */
  /* the Vltava at the city's own scale (the map draws it 15 and 10 wide; Prague is 1.6x) */
  .river-bank { fill: none; stroke: #3b6f9e; stroke-width: 9.4; stroke-linecap: round; stroke-linejoin: round; }
  .river { fill: none; stroke: #7fb6e4; stroke-width: 6.2; stroke-linecap: round; stroke-linejoin: round; }
  @media (min-width: 560px) {
    .whole { grid-column: span 2; }
  }
  .puff { fill: #fdfcf6; stroke: var(--ink); stroke-width: 3; stroke-linejoin: round; }
  .puff-shade { fill: #e4e7dc; }
  .pin-ground { fill: rgba(22, 19, 17, 0.25); }
  .pin-shade { fill: #e3d9bf; }
  .pin-fill { fill: var(--paper); }
  .pin-line { fill: none; stroke: var(--ink); stroke-width: 1.8; stroke-linejoin: round; stroke-dasharray: 3 2.4; }
  .pin-shine { fill: none; stroke: #fff; stroke-width: 1.8; stroke-linecap: round; opacity: 0; }
  .pin-eye-shade { fill: #e3d9bf; }
  .pin-eye-fill { fill: var(--paper); }
  .pin-eye { fill: none; stroke: var(--ink); stroke-width: 1.8; }
  .pin.current .pin-shade { fill: #b3281f; }
  .pin.current .pin-fill { fill: #e2483d; }
  .pin.current .pin-line { stroke-dasharray: none; }
  .pin.current .pin-shine { opacity: 0.8; }
  .car-body { fill: var(--paper); stroke: var(--ink); stroke-width: 3; }
  .tyre { fill: var(--ink); }
  .hub { fill: var(--land-light); stroke: var(--ink); stroke-width: 2; }
</style>
