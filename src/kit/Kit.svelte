<script>
  // Review sheet: every general building block of the site, numbered, so changes can be asked
  // for by number ("make C4 like C1"). Real components are rendered as they are; scoped styles
  // that live inside a section component are copied here 1:1 (marked "kopie").
  import Icon from '../lib/Icon.svelte';
  import Button from '../lib/Button.svelte';
  import Card from '../lib/Card.svelte';
  import Text from '../lib/Text.svelte';
  import Crop from './Crop.svelte';
  import Photo from '../lib/Photo.svelte';
  import Tape from '../lib/Tape.svelte';
  import CatHead from '../lib/CatHead.svelte';
  import Kittens from '../lib/Kittens.svelte';
  import CarCard from '../lib/CarCard.svelte';
  import Doodle from '../lib/Doodle.svelte';
  import LuggageTags from '../lib/LuggageTags.svelte';
  import { cats } from '../content.js';

  // the pin icon's drop (Icon.svelte), tip at (16, 29) in its 32-unit box
  const PIN = 'M16 29s-9-8-9-15a9 9 0 0 1 18 0c0 7-9 15-9 15Z';

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
  const icons = ['mail', 'instagram', 'pin', 'check', 'heart', 'camera', 'right', 'left', 'down', 'close', 'home', 'cats', 'copy', 'boy', 'girl', 'mountains'];
  const doodles = ['forest', 'city', 'farm', 'mountains', 'hills', 'lake', 'field', 'lookout', 'rest'];
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
        <div class="row"><span class="chip"><Icon name="check" size={18} /> Očkovaní</span><span class="chip">6–7 měsíců</span></div>
        <small class="src">.chip · app.css (úvod, mapa)</small>
      </div>
      <div class="item">
        <span class="no">D2</span>
        <span class="plaque">Praha</span>
        <small class="src">Cedule zastávky · Stop.svelte (kopie)</small>
      </div>
      <div class="item">
        <span class="no">D3</span>
        <div class="who-wrap">
          <span class="who"
            ><svg viewBox="-24 -32 48 56" width="26" height="26" aria-hidden="true"><CatHead cat="velik" r={18} mood="happy" wobble={false} /></svg
            >Velík</span
          >
        </div>
        <small class="src">Jmenovka bubliny · Cats.svelte (kopie)</small>
      </div>
      <div class="item">
        <span class="no">D4</span>
        <ul class="prompts">
          <li><Icon name="home" size={28} /> kde a&nbsp;jak bydlíte</li>
          <li><Icon name="heart" size={28} /> kdo u&nbsp;vás žije</li>
          <li><Icon name="cats" size={28} /> oba, nebo jednoho</li>
        </ul>
        <small class="src">Ikony u bodů · Contact.svelte (kopie)</small>
      </div>
      <div class="item">
        <span class="no">D5</span>
        <div class="row">
          <Icon name="check" size={26} />
          <span class="hearts">{#each Array(5) as _}<Icon name="heart" size={26} />{/each}</span>
        </div>
        <small class="src">Odškrtnuto a hodnocení · Vet.svelte (kopie)</small>
      </div>
      <div class="item">
        <span class="no">D6</span>
        <span class="dogs">
          <svg viewBox="0 0 64 40">
            {#each [[18, 22, -8], [44, 20, 6]] as [cx, cy, r]}
              <g transform="rotate({r} {cx} {cy})">
                <ellipse class="ear" cx={cx - 10} cy={cy - 2} rx="5" ry="10" transform="rotate(18 {cx - 10} {cy - 2})" />
                <ellipse class="ear" cx={cx + 10} cy={cy - 2} rx="5" ry="10" transform="rotate(-18 {cx + 10} {cy - 2})" />
                <circle class="dog" cx={cx} cy={cy} r="11" />
                <ellipse class="muzzle" cx={cx} cy={cy + 4.5} rx="5.5" ry="4.2" />
                <circle class="eye-w" cx={cx - 4.2} cy={cy - 2.5} r="2.6" />
                <circle class="eye-w" cx={cx + 4.2} cy={cy - 2.5} r="2.6" />
                <circle class="dot" cx={cx - 3.8} cy={cy - 2.2} r="1.3" />
                <circle class="dot" cx={cx + 4.6} cy={cy - 2.2} r="1.3" />
                <ellipse class="dot" cx={cx} cy={cy + 3} rx="2.6" ry="1.9" />
                <path class="tongue" d="M{cx - 1.6} {cy + 7} q1.6 3.4 3.2 0 Z" />
              </g>
            {/each}
          </svg>
          <b>2 psi</b>
        </span>
        <small class="src">Odznak „2 psi“ · Family.svelte (kopie)</small>
      </div>
      <div class="item wide">
        <span class="no">D7</span>
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
            <span class="who"
              ><svg viewBox="-24 -32 48 56" width="26" height="26" aria-hidden="true"><CatHead cat="polly" r={18} mood="happy" wobble={false} /></svg
              >Polly</span
            >
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
        <div class="tape-host"><Tape rotate={-4} /><Tape rotate={5} width="70px" /></div>
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
        {#each ['calm', 'cold', 'happy'] as mood, m}
          <figure class="item">
            <span class="no">G{c * 3 + m + 1}</span>
            <svg class="head-demo" viewBox="-60 -80 120 140" aria-hidden="true"><CatHead {cat} r={44} {mood} /></svg>
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
      {#each doodles as kind, i}
        <figure class="item">
          <span class="no">H{i + 1}</span>
          <svg class="doodle-demo" viewBox={kind === 'city' || kind === 'mountains' ? '-170 -150 340 220' : '-120 -110 240 170'} aria-hidden="true"><Doodle {kind} x={0} y={0} seed={i + 3} /></svg>
          <figcaption><code>{kind}</code></figcaption>
        </figure>
      {/each}
    </div>
    <p class="note">Doodle.svelte</p>

    <div class="grid map-bits">
      <figure class="item">
        <span class="no">H11</span>
        <svg class="bit" viewBox="0 0 240 90" aria-hidden="true">
          <path class="ahead" d="M10 70 C70 70 80 20 130 20 S 200 60 230 30" />
          <path class="done" d="M10 70 C70 70 80 20 130 20" />
        </svg>
        <figcaption>Trasa: projetá (červená) a ještě čeká (tečky) · Journey.svelte</figcaption>
      </figure>
      <figure class="item">
        <span class="no">H12</span>
        <svg class="bit" viewBox="0 0 240 90" aria-hidden="true">
          <path class="road-edge" d="M10 75 C80 75 120 15 230 20" />
          <path class="road" d="M10 75 C80 75 120 15 230 20" />
        </svg>
        <figcaption>Silnice · Journey.svelte</figcaption>
      </figure>
      <figure class="item">
        <span class="no">H13</span>
        <svg class="bit" viewBox="0 0 240 90" aria-hidden="true">
          <path class="river-bank" d="M10 20 C70 20 90 70 150 65 S 210 30 230 40" />
          <path class="river" d="M10 20 C70 20 90 70 150 65 S 210 30 230 40" />
        </svg>
        <figcaption>Řeka · Journey.svelte</figcaption>
      </figure>
      <figure class="item">
        <span class="no">H14</span>
        <svg class="bit" viewBox="0 0 240 90" aria-hidden="true">
          <g class="border">
            <path d="M 0 48 C 72 34, 144 62, 240 44" />
            <text x="8" y="34">Chorvatsko</text>
            <text x="8" y="74">Slovinsko</text>
          </g>
        </svg>
        <figcaption>Hranice se jmény zemí · Journey.svelte</figcaption>
      </figure>
      <figure class="item">
        <span class="no">H15</span>
        <svg class="bit" viewBox="0 0 240 90" aria-hidden="true">
          <path class="tufts" d="M40 50 l-3 -7 M40 50 l0 -8 M40 50 l3 -7 M120 30 l-3 -7 M120 30 l0 -8 M120 30 l3 -7 M190 64 l-3 -7 M190 64 l0 -8 M190 64 l3 -7 M80 74 l-3 -7 M80 74 l0 -8 M80 74 l3 -7" />
        </svg>
        <figcaption>Trsy trávy · Journey.svelte</figcaption>
      </figure>
      <figure class="item">
        <span class="no">H16</span>
        <svg class="bit" viewBox="-5 0 210 100" aria-hidden="true">
          <g class="cloud">
            <path class="puff" d="M30 82 C8 82 4 56 26 52 C22 28 52 20 66 36 C72 12 112 8 122 32 C134 18 162 24 164 46 C188 44 198 74 174 82 Z" />
            <path class="puff-shade" d="M24 74 C40 78 150 80 176 74 C182 78 178 82 174 82 H30 C26 82 22 79 24 74 Z" />
          </g>
        </svg>
        <figcaption>Mrak nad mapou · Journey.svelte</figcaption>
      </figure>
      <figure class="item">
        <span class="no">H17</span>
        <svg class="bit" viewBox="-40 -50 200 62" aria-hidden="true">
          {#each ['upcoming', 'current'] as st, k}
            <g class="pin {st}" transform="translate({k * 80} 0)">
              <ellipse class="pin-ground" cx="0" cy="1" rx="10" ry="3.5" />
              <!-- the site's pin icon at map size, as on the map (Journey.svelte) -->
              <g transform="scale(1.75) translate(-16 -29)">
                <clipPath id="kit-pin-clip-{k}"><path d={PIN} /></clipPath>
                <path class="pin-shade" d={PIN} />
                <g clip-path="url(#kit-pin-clip-{k})"><path class="pin-fill" d={PIN} transform="translate(-2.2 -2.2)" /></g>
                <path class="pin-line" d={PIN} />
                <path class="pin-shine" d="M10.3 12 a6.2 6.2 0 0 1 3 -3.8" />
                <!-- the cream centre, shaded like the icon's -->
                <clipPath id="kit-pin-eye-clip-{k}"><path d="M12.4 14 a3.6 3.6 0 1 0 7.2 0 a3.6 3.6 0 1 0 -7.2 0 Z" /></clipPath>
                <path class="pin-eye-shade" d="M12.4 14 a3.6 3.6 0 1 0 7.2 0 a3.6 3.6 0 1 0 -7.2 0 Z" />
                <g clip-path="url(#kit-pin-eye-clip-{k})"><path class="pin-eye-fill" d="M12.4 14 a3.6 3.6 0 1 0 7.2 0 a3.6 3.6 0 1 0 -7.2 0 Z" transform="translate(-2.2 -2.2)" /></g>
                <path class="pin-eye" d="M12.4 14 a3.6 3.6 0 1 0 7.2 0 a3.6 3.6 0 1 0 -7.2 0 Z" />
              </g>
            </g>
          {/each}
        </svg>
        <figcaption>Špendlík zastávky: čeká / dojeto · Journey.svelte</figcaption>
      </figure>
    </div>
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
  /* D · tags */
  .plaque {
    display: inline-block;
    padding: 8px 20px 10px;
    background: var(--sun);
    color: var(--ink);
    border: 3px solid var(--ink);
    border-radius: 8px;
    /* a place-name sign: flat, with a thin frame line just inside the edge */
    box-shadow:
      inset 0 0 0 3px var(--sun),
      inset 0 0 0 5px var(--ink),
      0 10px 12px -9px rgba(40, 60, 15, 0.55);
    font-weight: 800;
    font-variation-settings: 'INFM' 100, 'BNCE' 40;
    line-height: 1.02;
    font-size: clamp(2rem, 8.6vw, 3rem);
    transform: rotate(-2.5deg);
  }
  .who-wrap {
    position: relative;
    height: 34px;
    width: 120px;
  }
  .who {
    position: absolute;
    top: -16px;
    right: 18px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 12px 4px 6px;
    background: var(--ink);
    color: var(--paper);
    border: 2.5px solid var(--ink);
    border-radius: 999px;
    font-weight: 800;
    font-size: 0.95rem;
    rotate: 2deg;
  }
  .who-wrap .who {
    top: 0;
    right: auto;
    left: 0;
  }
  .who svg {
    overflow: visible;
  }
  .prompts {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 10px;
    font-size: 1.1rem;
  }
  .prompts li {
    display: flex;
    align-items: center;
    gap: 12px;
    line-height: 1.3;
  }
  .hearts {
    display: flex;
    gap: 4px;
  }
  .dogs {
    display: grid;
    place-items: center;
    align-content: center;
    width: 96px;
    aspect-ratio: 1;
    background: var(--sea);
    color: var(--paper);
    border: 3px solid #fff;
    outline: 2.5px solid var(--ink);
    border-radius: 50%;
    box-shadow:
      inset -3px -4px 0 rgba(0, 0, 0, 0.18),
      0 9px 10px -6px rgba(40, 60, 15, 0.55);
    rotate: 8deg;
  }
  .dogs svg {
    width: 60px;
    overflow: visible;
  }
  .dogs b {
    font-weight: 800;
    font-size: 1.15rem;
    line-height: 1;
  }
  .dog { fill: #2a2522; stroke: var(--ink); stroke-width: 2; }
  .ear { fill: #161311; stroke: var(--ink); stroke-width: 2; }
  .muzzle { fill: #4a423c; }
  .eye-w { fill: var(--paper); }
  .tongue { fill: #e58a7d; }
  .dot { fill: var(--ink); }
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

  /* H · map pieces drawn by Journey.svelte (kopie) */
  .map-bits {
    margin-top: 16px;
  }
  .bit {
    width: 100%;
    height: 100px;
    overflow: visible;
  }
  .ahead,
  .done {
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
  .river-bank { fill: none; stroke: #3b6f9e; stroke-width: 15; stroke-linecap: round; }
  .river { fill: none; stroke: #7fb6e4; stroke-width: 10; stroke-linecap: round; }
  .tufts { fill: none; stroke: #6f9a4a; stroke-width: 1.8; stroke-linecap: round; }
  .road-edge { fill: none; stroke: var(--ink); stroke-width: 8; stroke-linecap: round; opacity: 0.75; }
  .road { fill: none; stroke: var(--paper); stroke-width: 4.5; stroke-linecap: round; }
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
  .cloud {
    filter: drop-shadow(0 22px 5px rgba(40, 60, 15, 0.13));
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
</style>
