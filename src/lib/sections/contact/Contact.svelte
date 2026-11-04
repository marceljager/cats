<script>
  // @ts-check
  import Icon from '../../ui/Icon.svelte';
  import Text from '../../ui/Text.svelte';
  import Button from '../../ui/Button.svelte';
  import Card from '../../ui/Card.svelte';
  import Flyer from './Flyer.svelte';
  import LivingRoom from './LivingRoom.svelte';
  import CatHead from '../../figures/CatHead.svelte';
  import { contact } from '../../../content.js';
  import { onMount } from 'svelte';

  // the fire is the only light in the room: track where it is so the darkness can fall away from it
  let room;
  let fireGroup = $state(); // the flames' group, from LivingRoom
  let light = $state('');
  function aimLight() {
    if (!room || !fireGroup) return;
    const r = room.getBoundingClientRect();
    const f = fireGroup.getBoundingClientRect();
    const fx = f.left + f.width / 2 - r.left;
    const fy = f.top + f.height * 0.55 - r.top;
    // reach: the distance to the farthest corner, so the far corners end up darkest
    const reach = Math.max(Math.hypot(fx, fy), Math.hypot(r.width - fx, fy), Math.hypot(fx, r.height - fy), Math.hypot(r.width - fx, r.height - fy));
    light = `--fx:${fx.toFixed(0)}px; --fy:${fy.toFixed(0)}px; --reach:${reach.toFixed(0)}px`;
  }
  onMount(() => {
    aimLight();
    const ro = new ResizeObserver(aimLight);
    ro.observe(room);
    return () => ro.disconnect();
  });

  const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(contact.mail.subject)}&body=${encodeURIComponent(contact.mail.body)}`;

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

</script>

<section class="contact" id="domov" aria-labelledby="domov-h" bind:this={room} style={light} data-writebar-yields>
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
              <CatHead catId="velik" cx={29} cy={54} r={14} mood="happy" wobble={false} tilt={6} />
              <CatHead catId="polly" cx={52} cy={60} r={12} mood="happy" wobble={false} tilt={-6} />
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
          <Button href={mailto} data-track="napsat-email">
            <Icon name="mail" size={28} />
            <span class="btn-text">
              <Text variant="small" as="span" class="btn-cap">Pošlete e-mail</Text>
              <span class="handle">{contact.email}</span>
            </span>
          </Button>
          <Button
            theme="paper"
            href={contact.placeholder ? '#domov' : `https://www.instagram.com/${contact.instagram}`}
            target={contact.placeholder ? undefined : '_blank'}
            rel="noopener"
            data-track={contact.placeholder ? undefined : 'instagram'}
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

  <LivingRoom bind:fire={fireGroup} />

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
    .flicker { animation: none; }
  }
</style>
