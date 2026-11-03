<script>
  import Text from '../ui/Text.svelte';
  import Button from '../ui/Button.svelte';
  import CatHead from '../figures/CatHead.svelte';
  import Icon from '../ui/Icon.svelte';

</script>

<!-- a little cartoon person from the chest up: shirt, head, hair and a face
       hair 'short' | 'long'; face 'happy' (closed smiling eyes) | 'sneeze' (screwed-up eyes, open
       mouth, red nose, a tear) -->
{#snippet person(x, y, r, shirt, hair, face)}
  <g class="person">
    {#if hair === 'long'}
      <path class="hair" d="M{x - r * 1.1} {y + r * 1.3} C{x - r * 1.35} {y - r * 0.4} {x - r * 0.9} {y - r * 1.2} {x} {y - r * 1.15} C{x + r * 0.9} {y - r * 1.2} {x + r * 1.35} {y - r * 0.4} {x + r * 1.1} {y + r * 1.3} Z" />
    {/if}
    <path class="shirt {shirt}" d="M{x - r * 1.5} 162 C{x - r * 1.5} {y + r * 1.3} {x - r * 0.9} {y + r * 0.95} {x} {y + r * 0.95} C{x + r * 0.9} {y + r * 0.95} {x + r * 1.5} {y + r * 1.3} {x + r * 1.5} 162 Z" />
    <path class="sh" d="M{x + r * 0.7} {y + r * 1.05} C{x + r * 1.3} {y + r * 1.3} {x + r * 1.5} {y + r * 1.6} {x + r * 1.5} 162 H{x + r * 0.9} Z" />
    <circle class="skin" cx={x} cy={y} r={r} />
    <path class="sh" d="M{x + r * 0.55} {y - r * 0.83} A{r} {r} 0 0 1 {x + r * 0.2} {y + r * 0.98} A{r * 1.1} {r * 1.1} 0 0 0 {x + r * 0.55} {y - r * 0.83} Z" />
    {#if hair === 'short'}
      <!-- covers the whole crown, a little past the head's edge, with a side-swept fringe -->
      <path class="hair" d="M{x - r * 1.04} {y - r * 0.12} C{x - r * 1.12} {y - r * 1.5} {x + r * 1.12} {y - r * 1.5} {x + r * 1.04} {y - r * 0.12} C{x + r * 0.7} {y - r * 0.62} {x - r * 0.1} {y - r * 0.5} {x - r * 1.04} {y - r * 0.12} Z" />
    {:else}
      <!-- covers the whole crown, parted in the middle, the fringe framing the face -->
      <path class="hair" d="M{x - r * 1.04} {y - r * 0.05} C{x - r * 1.1} {y - r * 1.5} {x + r * 1.1} {y - r * 1.5} {x + r * 1.04} {y - r * 0.05} C{x + r * 0.5} {y - r * 0.6} {x + r * 0.1} {y - r * 0.6} {x} {y - r * 0.72} C{x - r * 0.1} {y - r * 0.6} {x - r * 0.5} {y - r * 0.6} {x - r * 1.04} {y - r * 0.05} Z" />
    {/if}
    {#if face === 'sneeze'}
      <path class="ink-line" d="M{x - r * 0.55} {y - r * 0.05} l{r * 0.32} {r * 0.14} l{-r * 0.32} {r * 0.14} M{x + r * 0.55} {y - r * 0.05} l{-r * 0.32} {r * 0.14} l{r * 0.32} {r * 0.14}" />
      <ellipse class="mouth" cx={x} cy={y + r * 0.6} rx={r * 0.22} ry={r * 0.2} />
      <circle class="nose" cx={x} cy={y + r * 0.28} r={r * 0.17} />
      <path class="tear" d="M{x - r * 0.7} {y + r * 0.35} q{r * 0.12} {r * 0.2} 0 {r * 0.3} q{-r * 0.12} {-r * 0.1} 0 {-r * 0.3} Z" />
    {:else}
      <path class="ink-line" d="M{x - r * 0.55} {y + r * 0.05} q{r * 0.2} {-r * 0.24} {r * 0.4} 0 M{x + r * 0.15} {y + r * 0.05} q{r * 0.2} {-r * 0.24} {r * 0.4} 0 M{x - r * 0.3} {y + r * 0.42} q{r * 0.3} {r * 0.3} {r * 0.6} 0" />
      <circle class="blush" cx={x - r * 0.62} cy={y + r * 0.35} r={r * 0.15} />
      <circle class="blush" cx={x + r * 0.62} cy={y + r * 0.35} r={r * 0.15} />
    {/if}
  </g>
{/snippet}

{#snippet dog(x, y, r, tilt)}
  <g class="dog" transform="rotate({tilt} {x} {y})">
    <ellipse class="ear" cx={x - r * 0.9} cy={y - r * 0.1} rx={r * 0.42} ry={r * 0.9} transform="rotate(18 {x - r * 0.9} {y - r * 0.1})" />
    <ellipse class="ear" cx={x + r * 0.9} cy={y - r * 0.1} rx={r * 0.42} ry={r * 0.9} transform="rotate(-18 {x + r * 0.9} {y - r * 0.1})" />
    <circle class="fur" cx={x} cy={y} r={r} />
    <ellipse class="muzzle" cx={x} cy={y + r * 0.42} rx={r * 0.5} ry={r * 0.38} />
    <circle class="eye-w" cx={x - r * 0.38} cy={y - r * 0.22} r={r * 0.24} />
    <circle class="eye-w" cx={x + r * 0.38} cy={y - r * 0.22} r={r * 0.24} />
    <circle class="dot" cx={x - r * 0.34} cy={y - r * 0.2} r={r * 0.12} />
    <circle class="dot" cx={x + r * 0.42} cy={y - r * 0.2} r={r * 0.12} />
    <ellipse class="dot" cx={x} cy={y + r * 0.28} rx={r * 0.24} ry={r * 0.17} />
    <path class="tongue" d="M{x - r * 0.15} {y + r * 0.62} q{r * 0.15} {r * 0.4} {r * 0.3} 0 Z" />
  </g>
{/snippet}

<!-- the heart icon, centred on x, y; s = 1 is 18 units wide -->
{#snippet heart(x, y, s)}
  <g transform="translate({x - 11.5 * s} {y - 10.5 * s})"><Icon name="heart" size={23 * s} /></g>
{/snippet}

<section class="section family" aria-labelledby="family-h">
  <div class="wrap">
    <Text variant="title" id="family-h" class="family-title">Tady zůstat nemůžeme</Text>
    <Text variant="lede" class="family-lede">Naši lidi by si nás nejradši nechali. Doma to ale nejde.</Text>

    <!-- a three-panel comic strip: the people who found us, the dogs, the sneezing -->
    <ol class="strip">
      <li class="frame">
        <div class="panel one">
          <svg viewBox="0 0 200 160" aria-hidden="true">
            <rect class="wall" width="200" height="160" />
            <path class="ray" d="M100 70 L0 0 H60 Z M100 70 L140 0 H200 V40 Z" />
            {@render person(66, 70, 21, 'teal', 'short', 'happy')}
            {@render person(136, 74, 19, 'pink', 'long', 'happy')}
            <!-- the arms that hold us -->
            <path class="arm teal" d="M40 162 C44 134 70 128 92 136" />
            <path class="arm pink" d="M162 162 C158 136 134 132 112 138" />
            <CatHead catId="velik" cx={86} cy={128} r={19} mood="happy" tilt={-8} />
            <CatHead catId="polly" cx={116} cy={132} r={16} mood="happy" tilt={8} delay={0.7} />
            <g class="float">{@render heart(100, 26, 1.2)}</g>
            <g class="float late">{@render heart(32, 40, 0.8)}{@render heart(172, 34, 0.9)}</g>
          </svg>
          <span class="no" aria-hidden="true">1</span>
          <Text class="caption">Lidi, co nás našli, jsou ti nejlepší. Odnesli nás z&nbsp;lesa pod Velebitem, převezli přes tři hranice do Prahy a&nbsp;taky nás vzali k&nbsp;veterináři.</Text>
        </div>
      </li>

      <li class="frame">
        <div class="panel two">
          <svg viewBox="0 0 200 160" aria-hidden="true">
            <rect class="wall" width="200" height="160" />
            <rect class="floor" y="140" width="200" height="20" />
            <!-- one sofa, two dogs, two of us squeezed in between -->
            <rect class="sofa back" x="18" y="62" width="164" height="56" rx="16" />
            <rect class="sofa" x="12" y="104" width="176" height="36" rx="10" />
            <rect class="sofa arm-r" x="6" y="86" width="26" height="54" rx="11" />
            <rect class="sofa arm-r" x="168" y="86" width="26" height="54" rx="11" />
            <path class="sh" d="M182 92 C190 92 194 98 194 106 V128 C194 136 188 140 182 140 Z" />
            <path class="legs" d="M26 140 V148 M174 140 V148" />
            {@render dog(54, 88, 21, -8)}
            {@render dog(146, 86, 22, 8)}
            <CatHead catId="velik" cx={92} cy={98} r={13} mood="calm" tilt={-14} />
            <CatHead catId="polly" cx={110} cy={102} r={11} mood="calm" tilt={12} delay={0.5} />
            <!-- a little too crowded -->
            <path class="sweat" d="M78 72 q5 8 0 12 q-5 -4 0 -12 Z M124 76 q4 7 0 10 q-4 -3 0 -10 Z" />
            <text class="mark" x="100" y="46" text-anchor="middle">!?</text>
          </svg>
          <span class="no" aria-hidden="true">2</span>
          <Text class="caption">Jenže doma už mají dva psy. Jeden z&nbsp;nich si s&nbsp;kočkama moc nerozumí. My se ho nebojíme, ale nemáme úplně klidné prostředí.</Text>
        </div>
      </li>

      <li class="frame">
        <div class="panel three">
          <svg viewBox="0 0 200 160" aria-hidden="true">
            <rect class="wall" width="200" height="160" />
            <path class="burst" d="M146 6 L154 22 L172 12 L169 30 L192 28 L177 42 L194 54 L172 57 L177 76 L158 66 L148 82 L141 66 L121 78 L125 59 L102 58 L118 44 L100 30 L123 31 L120 12 L137 23 Z" />
            <text class="hepci" x="147" y="50" text-anchor="middle">Hepčí!</text>
            {@render person(64, 80, 28, 'mustard', 'short', 'sneeze')}
            <!-- the spray, and the hand that keeps on stroking anyway -->
            <path class="spray" d="M84 98 l10 2 M86 106 l11 6 M84 112 l8 9" />
            <CatHead catId="polly" cx={150} cy={128} r={20} mood="happy" tilt={-6} delay={0.4} />
            <path class="arm mustard" d="M92 162 C96 132 114 112 140 106" />
            <ellipse class="hand" cx="144" cy="106" rx="10" ry="7" transform="rotate(-12 144 106)" />
            <!-- tissues -->
            <g transform="translate(10 124)">
              <path class="tissue" d="M18 6 C14 -10 32 -12 29 -2 C36 -12 46 -2 37 6 Z" />
              <rect class="box" x="0" y="6" width="54" height="30" rx="5" />
              <path class="sh" d="M44 6 H49 A5 5 0 0 1 54 11 V31 A5 5 0 0 1 49 36 H44 Z" />
              <path class="slot" d="M16 11 Q27 6 38 11" />
            </g>
          </svg>
          <span class="no" aria-hidden="true">3</span>
          <Text class="caption">A&nbsp;pak to kýchání, škrábání a&nbsp;oteklé oči. Jeden z&nbsp;našich lidí je na kočky alergický: slzí mu oči, smrká, a&nbsp;stejně nás pořád hladí.</Text>
        </div>
      </li>
    </ol>

    <!-- the strip's last word, straight on the map ground: the red route picks up again and leads to the ask -->
    <div class="end">
      <svg class="route" viewBox="0 0 1000 24" preserveAspectRatio="none" aria-hidden="true">
        <path d="M2 14 C160 2 300 22 470 12 C640 2 820 20 998 10" />
      </svg>
      <div class="end-text">
        <Text variant="heading" as="p" class="family-end">Proto hledáme nový domov. Místo, kde zůstaneme napořád.</Text>
        <Text class="family-note">Nejradši spolu, ale jde to i&nbsp;zvlášť.</Text>
      </div>
      <p class="next">
        <Button href="#domov" data-writebar-yields bounce={{ rest: { rotate: -1.5 }, over: { rotate: -3, x: 0, y: -2, scale: 1.03 } }}>Napište našim lidem <Icon name="right" size={24} /></Button>
        <Button href="#kotata" variant="link">Nejdřív nás poznejte <Icon name="down" size={22} /></Button>
      </p>
    </div>
  </div>
</section>

<style>
  .family :global(.family-title) {
    max-width: none;
  }
  .family :global(.family-lede) {
    margin-top: 14px;
    max-width: 48ch;
  }

  /* the comic strip: panels side by side on wide screens, stacked on a phone */
  .strip {
    list-style: none;
    margin: 36px 0 0;
    padding: 0;
    display: grid;
    gap: 28px;
  }
  .frame {
    display: grid;
  }
  .frame:nth-child(1) { rotate: -1deg; }
  .frame:nth-child(2) { rotate: 0.8deg; }
  .frame:nth-child(3) { rotate: -0.6deg; }
  .panel {
    position: relative;
    background: var(--paper);
    border: 3px solid var(--ink);
    border-radius: 10px;
    padding: 8px;
    box-shadow:
      inset -4px -5px 0 var(--paper-shade),
      0 12px 14px -10px rgba(40, 60, 15, 0.55);
  }
  .panel svg {
    display: block;
    width: 100%;
    aspect-ratio: 5 / 4;
    border: 2px solid var(--ink);
    border-radius: 6px;
    overflow: hidden;
  }
  /* the panel number, a small round badge in the corner */
  .no {
    position: absolute;
    top: -14px;
    left: -12px;
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    font-family: var(--f-marker);
    font-weight: 800;
    font-size: 1.1rem;
    color: var(--paper);
    background: var(--route);
    border: 3px solid var(--ink);
    border-radius: 50%;
  }
  /* the caption is written on the card itself, under the drawing */
  .panel {
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 12px;
    padding-bottom: 16px;
  }
  .panel :global(.caption) {
    padding: 0 8px;
    max-width: 42ch;
  }

  /* the closing ask: no card, just the map's red dashed route running across above it */
  .end {
    margin-top: 48px;
    display: grid;
    gap: 22px;
  }
  .route {
    display: block;
    width: 100%;
    height: 24px;
    overflow: visible;
  }
  .route path {
    fill: none;
    stroke: var(--route);
    stroke-width: 4;
    stroke-linecap: round;
    stroke-dasharray: 12 10;
    vector-effect: non-scaling-stroke;
  }
  .end-text {
    display: grid;
    gap: 10px;
  }
  .end :global(.family-end) {
    max-width: 22ch;
    font-size: clamp(1.6rem, 6.4vw, 2.4rem);
  }
  .end :global(.family-note) {
    max-width: 40ch;
    font-weight: 600;
  }
  .next {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px 24px;
  }
  .next :global(.button) {
    white-space: nowrap;
  }

  /* the drawings: ink outlines, a warm shade (.sh) down the right side */
  .panel svg :global(path),
  .panel svg :global(circle),
  .panel svg :global(ellipse),
  .panel svg :global(rect) {
    vector-effect: non-scaling-stroke;
  }
  .wall { fill: #fdf1c9; }
  .one .wall { fill: #fde3c4; }
  .two .wall { fill: #dceaf3; }
  .ray { fill: rgba(255, 255, 255, 0.45); }
  .floor { fill: #c9955f; }
  .sh { fill: rgba(70, 35, 10, 0.18); }
  .skin { fill: #f2c9a5; stroke: var(--ink); stroke-width: 2.4; }
  .hair { fill: #6a412a; stroke: var(--ink); stroke-width: 2.4; stroke-linejoin: round; }
  .shirt, .arm { stroke: var(--ink); stroke-width: 2.4; stroke-linejoin: round; }
  .arm { fill: none; stroke-width: 9; stroke-linecap: round; }
  .shirt.teal { fill: #5f8f8a; }
  .shirt.pink { fill: #d6407a; }
  .shirt.mustard { fill: #e3a33c; }
  .arm.teal { stroke: #5f8f8a; }
  .arm.pink { stroke: #d6407a; }
  .arm.mustard { stroke: #e3a33c; }
  .ink-line { fill: none; stroke: var(--ink); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
  .blush { fill: #f08c8c; opacity: 0.6; }
  .mouth { fill: #7a2a22; stroke: var(--ink); stroke-width: 2; }
  .nose { fill: #e2483d; stroke: var(--ink); stroke-width: 1.8; }
  .tear { fill: #8fbbe0; stroke: var(--ink); stroke-width: 1.4; }
  .hand { fill: #f2c9a5; stroke: var(--ink); stroke-width: 2.2; }
  .float { animation: rise 3.6s ease-in-out infinite; }
  .float.late { animation-delay: 1.4s; }
  @keyframes rise {
    0%, 100% { translate: 0 3px; opacity: 0.7; }
    50% { translate: 0 -4px; opacity: 1; }
  }
  /* the sofa and the dogs */
  .sofa { fill: #3a78b0; stroke: var(--ink); stroke-width: 2.4; }
  .sofa.back { fill: #2f6496; }
  .legs { fill: none; stroke: var(--ink); stroke-width: 5; stroke-linecap: round; }
  .fur { fill: #2a2522; stroke: var(--ink); stroke-width: 2.2; }
  .ear { fill: #161311; stroke: var(--ink); stroke-width: 2.2; }
  .muzzle { fill: #4a423c; }
  .eye-w { fill: var(--paper); }
  .dot { fill: var(--ink); }
  .tongue { fill: #e58a7d; }
  .sweat { fill: #8fbbe0; stroke: var(--ink); stroke-width: 1.6; }
  .mark {
    font-family: var(--f-marker);
    font-weight: 800;
    font-size: 22px;
    fill: var(--route);
    stroke: var(--ink);
    stroke-width: 0.8;
  }
  /* the sneeze */
  .burst {
    fill: var(--sun);
    stroke: var(--ink);
    stroke-width: 2.6;
    stroke-linejoin: round;
    transform-box: fill-box;
    transform-origin: center;
    animation: achoo 3.6s var(--ease-out) infinite;
  }
  @keyframes achoo {
    0%, 70%, 100% { scale: 1; }
    76% { scale: 1.14; }
    84% { scale: 0.96; }
  }
  .hepci {
    font-family: var(--f-marker);
    font-weight: 800;
    font-size: 21px;
    fill: var(--route);
  }
  .spray { fill: none; stroke: #5f93c2; stroke-width: 2.4; stroke-linecap: round; stroke-dasharray: 2 3; }
  .tissue { fill: var(--paper); stroke: var(--ink); stroke-width: 2.2; stroke-linejoin: round; }
  .box { fill: #8fbbe0; stroke: var(--ink); stroke-width: 2.4; }
  .slot { fill: none; stroke: var(--ink); stroke-width: 2; stroke-linecap: round; }

  /* tablets and an unfolded Duo: the panels stay one under another, each drawing beside its caption */
  @media (min-width: 760px) and (max-width: 1023px) {
    .strip {
      max-width: 760px;
      margin-inline: auto;
      gap: 28px;
    }
    .panel {
      grid-template-columns: 1.15fr 1fr;
      grid-template-rows: auto;
      align-items: center;
      gap: 18px;
      padding: 10px 18px 10px 10px;
    }
  }
  @media (min-width: 1024px) {
    .strip {
      grid-template-columns: repeat(3, 1fr);
      gap: 32px;
      margin-top: 48px;
    }
    .frame:nth-child(2) {
      margin-top: 24px;
    }
    .end {
      margin-top: 64px;
      grid-template-columns: 1fr auto;
      align-items: center;
      column-gap: 48px;
      row-gap: 28px;
    }
    .route {
      grid-column: 1 / -1;
    }
    .next {
      flex-direction: column;
      align-items: flex-start;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .burst, .float { animation: none; }
  }
</style>
