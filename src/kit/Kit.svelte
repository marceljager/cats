<script>
  // @ts-check
  // Review sheet: every general building block of the site, numbered, so changes can be asked
  // for by number ("make C4 like C1"). Real components are rendered as they are; pieces that live
  // inside a section are shown live from the page (Crop), never copied, so they can't drift.
  import Icon from '../lib/ui/Icon.svelte';
  import Button from '../lib/ui/Button.svelte';
  import Card from '../lib/ui/Card.svelte';
  import Text from '../lib/ui/Text.svelte';
  import Crop from './Crop.svelte';
  import Photo from '../lib/ui/Photo.svelte';
  import Tape from '../lib/ui/Tape.svelte';
  import CatHead from '../lib/figures/CatHead.svelte';
  import Kittens from '../lib/figures/Kittens.svelte';
  import CarCard from '../lib/figures/CarCard.svelte';
  import Doodle from '../lib/art/Doodle.svelte';
  import { KINDS } from '../lib/art/scenery.js';
  import LuggageTags from '../lib/sections/cats/LuggageTags.svelte';
  import { cats } from '../content.js';

  const colors = [
    ['--land', 'Země (pozadí)'],
    ['--land-light', 'Země světlá'],
    ['--forest', 'Les'],
    ['--sea', 'Moře'],
    ['--sun', 'Slunce'],
    ['--route', 'Trasa / červená'],
    ['--stamp', 'Razítko'],
    ['--paper', 'Papír'],
    ['--paper-shade', 'Stín papíru'],
    ['--ink-soft', 'Inkoust měkký'],
    ['--ink', 'Inkoust'],
  ];
  /** @type {(keyof typeof import('../lib/ui/Icon.svelte').ICONS)[]} */
  const icons = ['mail', 'instagram', 'pin', 'check', 'heart', 'camera', 'right', 'left', 'down', 'close', 'home', 'cats', 'copy', 'boy', 'girl', 'mountains'];
  /** @type {('calm' | 'cold' | 'happy')[]} */
  const MOODS = ['calm', 'cold', 'happy'];
  let copied = $state(false);
</script>

<div class="kit">
  <header class="top">
    <h1>Stavební kostky</h1>
    <p>Všechna tlačítka, štítky, karty, ikony a kresby webu na jednom místě. Každá věc má číslo, stačí napsat třeba „C4 ať vypadá jako C1“.</p>
    <nav>
      <a href="#a">A Barvy</a><a href="#b">B Písmo</a><a href="#c">C Tlačítka</a><a href="#d">D Štítky</a><a href="#e">E Karty</a><a href="#f">F Ikony</a><a href="#g">G Postavy</a><a href="#h">H Mapa</a><a href="#i">I Kresby v sekcích</a>
    </nav>
  </header>

  <!-- A · colours -->
  <section id="a">
    <h2><span class="letter">A</span> Barvy</h2>
    <div class="grid colors">
      {#each colors as [token, name], i}
        <figure class="item">
          <span class="no">A{i + 1}</span>
          <span class="swatch" style="background: var({token})"></span>
          <figcaption><b>{name}</b><code>{token}</code></figcaption>
        </figure>
      {/each}
    </div>
  </section>

  <!-- B · type -->
  <section id="b">
    <h2><span class="letter">B</span> Písmo</h2>
    <div class="stack">
      <div class="item wide dark">
        <span class="no">B1</span>
        <Text variant="display" class="hero-demo">Ahoj, jsme Velík a&nbsp;Polly.</Text>
        <small class="src">Text.svelte variant="display" · úvod</small>
      </div>
      <div class="item wide">
        <span class="no">B2</span>
        <Text variant="title">Sourozenci na cestě</Text>
        <small class="src">Text.svelte variant="title" · nadpis každé sekce</small>
      </div>
      <div class="item wide">
        <span class="no">B3</span>
        <Text variant="heading">Napište našim lidem</Text>
        <small class="src">Text.svelte variant="heading" · jména koček, nadpis na kartě, „Nejradši spolu.“, „Veterinární zpráva“</small>
      </div>
      <div class="item wide">
        <span class="no">B4</span>
        <Text variant="subheading">Les, zima a cizí dveře</Text>
        <small class="src">Text.svelte variant="subheading" · název zastávky, návštěvy u veterináře, citát, adresa</small>
      </div>
      <div class="item wide">
        <span class="no">B5</span>
        <Text variant="lede">Bratr nás našel první, sestřičku přivedl až potom. Od té doby jsme pořád spolu.</Text>
        <small class="src">Text.svelte variant="lede" · úvodní odstavce, bubliny koček</small>
      </div>
      <div class="item wide">
        <span class="no">B6</span>
        <Text variant="body">Běžný text: příliš žluťoučký kůň úpěl ďábelské ódy. Ěščřžýáíé ůú ĚŠČŘŽÝÁÍÉ ŮÚ.</Text>
        <small class="src">Text.svelte variant="body" · příběhy, seznamy</small>
      </div>
      <div class="item wide">
        <span class="no">B7</span>
        <Text variant="small">1. návštěva · veterina v Praze · Polly zblízka</Text>
        <small class="src">Text.svelte variant="small" · popisky fotek, poznámky</small>
      </div>
      <div class="item wide">
        <span class="no">B8</span>
        <Text variant="label">Adresát</Text>
        <small class="src">Text.svelte variant="label" · tištěné popisky</small>
      </div>
    </div>
  </section>

  <!-- C · buttons -->
  <section id="c">
    <h2><span class="letter">C</span> Tlačítka a odkazy</h2>
    <div class="grid">
      <div class="item dark">
        <span class="no">C1</span>
        <Button href="#c">Chci je poznat <Icon name="right" size={24} /></Button>
        <small class="src">Button.svelte · úvod</small>
      </div>
      <div class="item dark">
        <span class="no">C2</span>
        <span class="story"><Button href="#c" variant="link">Jak jsme se sem dostali <Icon name="down" size={22} /></Button></span>
        <small class="src">Button.svelte variant="link" · úvod</small>
      </div>
      <div class="item">
        <span class="no">C3</span>
        <Button href="#c"><Icon name="mail" size={28} /><span class="handle">adopce@example.cz</span></Button>
        <small class="src">Button.svelte · e-mail</small>
      </div>
      <div class="item">
        <span class="no">C4</span>
        <Button href="#c" theme="paper"><Icon name="instagram" size={28} /><span class="handle">@kocky.z.velebitu</span></Button>
        <small class="src">Button.svelte theme="paper" · Instagram</small>
      </div>
      <div class="item">
        <span class="no">C5</span>
        <span class="copy-btn">
          <Button variant="link" onclick={() => (copied = !copied)}>
            <Icon name={copied ? 'check' : 'copy'} size={20} />
            {copied ? 'Zkopírováno, stačí vložit do e-mailu' : 'Nebo si zkopírujte adresu'}
          </Button>
        </span>
        <small class="src">Button.svelte variant="link" · kopírovat adresu (klikni)</small>
      </div>
      <div class="item">
        <span class="no">C6</span>
        <div class="row">
          <Button variant="round" theme="paper" aria-label="Předchozí"><Icon name="left" size={26} /></Button>
          <Button variant="round" theme="paper" aria-label="Další"><Icon name="right" size={26} /></Button>
          <Button variant="round" theme="paper" aria-label="Zavřít"><Icon name="close" size={22} /></Button>
        </div>
        <small class="src">Button.svelte variant="round" theme="paper" · galerie</small>
      </div>
      <div class="item">
        <span class="no">C7</span>
        <Button href="#c" variant="arrow" bounce={{ rest: { rotate: -2 }, over: { rotate: -4, x: 6, y: 0, scale: 1.03 } }}>K&nbsp;vám domů</Button>
        <small class="src">Button.svelte variant="arrow" · not used on the page</small>
      </div>
    </div>
  </section>

  <!-- D · tags & badges -->
  <section id="d">
    <h2><span class="letter">D</span> Štítky a odznaky</h2>
    <div class="grid">
      <div class="item">
        <span class="no">D1</span>
        <div class="row"><span class="chip"><Icon name="check" size={18} /> Odčervení</span><span class="chip">6–7 měsíců</span></div>
        <small class="src">.chip · app.css (úvod, mapa)</small>
      </div>
      <div class="item">
        <span class="no">D2</span>
        <Crop sel=".stop .plaque" pick={0} />
        <small class="src">Cedule zastávky · Stop.svelte</small>
      </div>
      <div class="item">
        <span class="no">D3</span>
        <Crop sel="#domov .prompts" />
        <small class="src">Ikony u bodů · Contact.svelte</small>
      </div>
      <div class="item">
        <span class="no">D4</span>
        <Crop sel=".vet .score" />
        <small class="src">Hodnocení · Vet.svelte</small>
      </div>
      <div class="item wide">
        <span class="no">D5</span>
        <div class="tags-host"><LuggageTags cat={cats[0]} /></div>
        <small class="src">Visačky na kufr · LuggageTags.svelte</small>
      </div>
    </div>
  </section>

  <!-- E · cards -->
  <section id="e">
    <h2><span class="letter">E</span> Karty a bubliny</h2>
    <div class="grid">
      <div class="item">
        <span class="no">E1</span>
        <div class="demo-card">
          <Card>
            <Text variant="label">Karta</Text>
            <p>Základní kreslená karta: obrys, stín vpravo dole, stín na zemi.</p>
          </Card>
        </div>
        <small class="src">Card.svelte · zastávky na mapě, pohlednice</small>
      </div>
      <div class="item">
        <span class="no">E2</span>
        <div class="photo-host"><Photo hint="Fotka zastávky" tilt={-2} /></div>
        <small class="src">Polaroid s páskou · Photo.svelte</small>
      </div>
      <div class="item">
        <span class="no">E3</span>
        <div class="photo-host"><Photo hint="Bez pásky" tilt={2} tape={false} ratio="4 / 3" /></div>
        <small class="src">Polaroid bez pásky · Photo.svelte</small>
      </div>
      <div class="item">
        <span class="no">E4</span>
        <div class="says">
          <Card variant="bubble">
            <p>Jsem Polly, holka, je mi 6–7 měsíců a&nbsp;jmenuju se po Poljaně.</p>
          </Card>
        </div>
        <small class="src">Card.svelte variant="bubble" · Sourozenci na cestě</small>
      </div>
      <div class="item">
        <span class="no">E5</span>
        <div class="quote">
          <Card variant="quote" as="blockquote">
            <p lang="hr">Zdravi su kao riba.</p>
            <cite>Veterinářka, Chorvatsko</cite>
          </Card>
        </div>
        <small class="src">Card.svelte variant="quote" · Veterinární zpráva</small>
      </div>
      <div class="item">
        <span class="no">E6</span>
        <div class="tape-host"><Tape tilt={-4} /><Tape tilt={5} width={70} /></div>
        <small class="src">Lepicí páska · Tape.svelte</small>
      </div>
    </div>
  </section>

  <!-- F · icons -->
  <section id="f">
    <h2><span class="letter">F</span> Ikony</h2>
    <div class="grid icons">
      {#each icons as name, i}
        <figure class="item">
          <span class="no">F{i + 1}</span>
          <div class="row"><Icon {name} size={48} /><Icon {name} size={24} /></div>
          <figcaption><code>{name}</code></figcaption>
        </figure>
      {/each}
    </div>
    <p class="note">Icon.svelte · 48 a 24 px</p>
  </section>

  <!-- G · characters -->
  <section id="g">
    <h2><span class="letter">G</span> Postavy</h2>
    <div class="grid">
      {#each ['velik', 'polly'] as cat, c}
        {#each MOODS as mood, m}
          <figure class="item">
            <span class="no">G{c * 3 + m + 1}</span>
            <svg class="head-demo" viewBox="-60 -80 120 140" aria-hidden="true"><CatHead catId={cat} r={44} {mood} /></svg>
            <figcaption><b>{cat === 'velik' ? 'Velík' : 'Polly'}</b> · <code>{mood}</code></figcaption>
          </figure>
        {/each}
      {/each}
      <figure class="item dark">
        <span class="no">G7</span>
        <svg class="kittens-demo" viewBox="680 640 220 230" aria-hidden="true"><Kittens cold /></svg>
        <figcaption>Koťata, zima (úvod)</figcaption>
      </figure>
      <figure class="item warm">
        <span class="no">G8</span>
        <svg class="kittens-demo" viewBox="680 640 220 230" aria-hidden="true"><Kittens /></svg>
        <figcaption>Koťata, teplo (konec)</figcaption>
      </figure>
      <figure class="item">
        <span class="no">G9</span>
        <div class="car-host"><CarCard x={110} y={70} km={330} moving /></div>
        <figcaption>Auto s tachometrem · CarCard.svelte</figcaption>
      </figure>
    </div>
    <p class="note">Hlavy jsou zatím kreslené, po dodání fotek je nahradí výřez z fotky (CatHead.svelte).</p>
  </section>

  <!-- H · map doodles -->
  <section id="h">
    <h2><span class="letter">H</span> Kresby na mapě</h2>
    <div class="grid doodles">
      {#each KINDS as kind, i}
        <figure class="item">
          <span class="no">H{i + 1}</span>
          <svg class="doodle-demo" viewBox={kind === 'city' || kind === 'mountains' ? '-170 -150 340 220' : '-120 -110 240 170'} aria-hidden="true"><Doodle {kind} x={0} y={0} seed={i + 3} /></svg>
          <figcaption><code>{kind}</code></figcaption>
        </figure>
      {/each}
    </div>
    <p class="note">Doodle.svelte</p>

    <div class="grid map-bits crops">
      <figure class="item">
        <span class="no">H{KINDS.length + 1}</span>
        <Crop sel=".journey .pin" pick={1} />
        <figcaption>Špendlík zastávky · Journey.svelte</figcaption>
      </figure>
      <figure class="item">
        <span class="no">H{KINDS.length + 2}</span>
        <Crop sel=".journey .cloud" pick={0} />
        <figcaption>Mrak nad mapou · Journey.svelte</figcaption>
      </figure>
      <figure class="item">
        <span class="no">H{KINDS.length + 3}</span>
        <Crop sel=".journey .border" pick={0} />
        <figcaption>Hranice se jmény zemí · Journey.svelte</figcaption>
      </figure>
    </div>
    <p class="note">Trasa, řeky a tráva jsou vidět na celé mapě (I9).</p>
  </section>
  <!-- I · drawings that live inside one section, shown live from the page -->
  <section id="i">
    <h2><span class="letter">I</span> Kresby v sekcích</h2>
    <div class="grid crops">
      <figure class="item wide">
        <span class="no">I1</span>
        <Crop sel="header.hero" />
        <figcaption>Noční les v úvodu · Hero.svelte</figcaption>
      </figure>
      <figure class="item wide">
        <span class="no">I2</span>
        <Crop sel="#domov .scene" />
        <figcaption>Obývák u krbu na konci · Contact.svelte</figcaption>
      </figure>
      <figure class="item wide">
        <span class="no">I3</span>
        <Crop sel=".gallery .line" />
        <figcaption>Šňůra s kolíčky a háčky · Gallery.svelte</figcaption>
      </figure>
      <figure class="item">
        <span class="no">I4</span>
        <Crop sel=".vet .board" />
        <figcaption>Psací deska s klipem (najeď myší) · Vet.svelte</figcaption>
      </figure>
      <figure class="item wide">
        <span class="no">I5</span>
        <Crop sel="#domov .sheet" />
        <figcaption>Pohlednice: známka a razítko přiletí po dopsání adresy · Contact.svelte</figcaption>
      </figure>
      <figure class="item wide">
        <span class="no">I6</span>
        <Crop sel=".cats .book" view={1300} />
        <figcaption>Otevřená kniha se záložkou · Cats.svelte</figcaption>
      </figure>
      <figure class="item wide">
        <span class="no">I7</span>
        <Crop sel=".family .strip" view={1300} />
        <figcaption>Komiks o&nbsp;třech obrázcích: lidi, psi, „Hepčí!“ · Family.svelte</figcaption>
      </figure>
      <figure class="item">
        <span class="no">I8</span>
        <Crop sel=".cats .booth" />
        <figcaption>Pásek z fotobudky · Cats.svelte</figcaption>
      </figure>
      <figure class="item wide">
        <span class="no">I9</span>
        <Crop sel=".journey .route" view={1300} />
        <figcaption>Mapa: trasa, řeky, hranice, tráva a auto · Journey.svelte</figcaption>
      </figure>
    </div>
    <p class="note">Živé výřezy ze skutečné stránky: ukazují přesně to, co je na webu, a reagují na myš.</p>
  </section>
</div>

<style>
  .kit {
    max-width: 1120px;
    margin: 0 auto;
    padding: 48px var(--pad) 120px;
  }
  .top h1 {
    font-size: clamp(2.4rem, 8vw, 4rem);
  }
  .top p {
    margin-top: 12px;
    max-width: 56ch;
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
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
    gap: 16px;
  }
  .colors {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  .icons {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  .doodles {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
  }
  .stack {
    display: grid;
    gap: 16px;
  }
  /* each specimen sits on a quiet sheet so the blocks themselves stand out */
  .item {
    position: relative;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 14px;
    min-height: 150px;
    padding: 40px 22px 18px;
    background: rgba(251, 250, 245, 0.55);
    border: 2px dashed rgba(22, 19, 17, 0.25);
    border-radius: 16px;
  }
  .item.wide {
    grid-column: 1 / -1;
  }
  .item.dark {
    background: #16243a;
    color: #dce8f5;
  }
  .item.warm {
    background: #f6d9a8;
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
    letter-spacing: 0.04em;
  }
  .src,
  figcaption,
  .note {
    font-family: var(--f-label);
    font-variation-settings: 'wdth' 85;
    font-size: 0.85rem;
    color: #4a4238;
  }
  .dark .src,
  .dark figcaption {
    color: #9fb4cc;
  }
  .note {
    margin-top: 10px;
  }
  figcaption {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: baseline;
  }
  code {
    font-size: 0.8rem;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
  }
  .swatch {
    width: 100%;
    height: 64px;
    border: 2px solid var(--ink);
    border-radius: 10px;
  }
  .colors .item {
    min-height: 0;
  }
  .colors figcaption {
    flex-direction: column;
    gap: 0;
  }

  /* B · type specimens */
  .item :global(.hero-demo) {
    max-width: 11ch;
    color: var(--paper);
    text-shadow: 0 4px 0 rgba(5, 9, 15, 0.6);
  }
  /* C · copies of the section buttons */
  .story {
    color: #dce8f5;
  }
  .copy-btn {
    color: var(--ink-soft);
  }
  .handle {
    overflow-wrap: anywhere;
    font-size: 1.15rem;
  }
  .story:hover {
    text-decoration: underline wavy;
    text-underline-offset: 5px;
  }
  .tags-host {
    width: 100%;
    max-width: 640px;
    padding-top: 10px;
  }

  /* E · cards */
  .demo-card {
    max-width: 280px;
  }
  .photo-host {
    width: 200px;
  }
  .says {
    margin-top: 10px;
    --card-pad: 24px 20px 20px;
  }
  .says p {
    font-size: clamp(1.2rem, 4.8vw, 1.4rem);
    font-weight: 600;
    font-variation-settings: 'INFM' 70, 'BNCE' 25;
    line-height: 1.45;
  }
  .quote {
    --card-pad: 10px 14px 12px;
  }
  .quote p {
    font-size: 1.2rem;
    font-weight: 800;
    font-variation-settings: 'INFM' 100;
  }
  .quote cite {
    display: block;
    margin-top: 2px;
    font-style: normal;
    font-weight: 600;
    font-size: 0.95rem;
    color: #2d5a3a;
  }
  .tape-host {
    display: flex;
    gap: 20px;
    align-items: center;
  }
  .tape-host :global(*) {
    position: static !important;
  }

  /* G, H · drawings */
  .head-demo {
    width: 120px;
    height: 140px;
    overflow: visible;
    align-self: center;
  }
  .kittens-demo {
    width: 200px;
    height: 210px;
    align-self: center;
    overflow: visible;
  }
  .car-host {
    position: relative;
    width: 220px;
    height: 140px;
    align-self: center;
  }
  .doodles .item {
    overflow: hidden;
  }
  .doodle-demo {
    width: 100%;
    height: 170px;
    overflow: visible;
  }
  .crops .item {
    align-items: stretch;
  }

  .map-bits {
    margin-top: 16px;
  }
</style>
