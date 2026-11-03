<script>
  // @ts-check
  import Text from '../ui/Text.svelte';
  import Button from '../ui/Button.svelte';
  import CatHead from '../figures/CatHead.svelte';
  import Icon from '../ui/Icon.svelte';
  import Card from '../ui/Card.svelte';
  import Tape from '../ui/Tape.svelte';
  import { animate } from 'motion';
  import { pop } from '../motion/springs.js';
  import { reducedMotion } from '../motion/viewport.js';

  // the two of us talking it over (\u00a0 keeps a one-letter word on the next one's line;
  // **…** marks why we can't stay, set in bold; dogs: the line that sets off the sofa drawing)
  /** @type {{ cat: 'velik' | 'polly', mood: 'happy' | 'calm', text: string, dogs?: boolean }[]} */
  const lines = [
    { cat: 'velik', mood: 'happy', text: 'Polly, naši lidi jsou ti nejlepší. Odvezli nás z\u00a0lesa pod Velebitem až do Prahy.' },
    { cat: 'polly', mood: 'calm', text: 'To jo. Jenže doma mají **dva\u00a0psy** a\u00a0jeden si **s\u00a0kočkama moc nerozumí**.', dogs: true },
    { cat: 'velik', mood: 'calm', text: 'A\u00a0jeden z\u00a0našich lidí je **na nás alergický**. Kýchá, slzí mu oči… a\u00a0stejně nás hladí.' },
  ];
  // the text in pieces, every odd one bold
  const parts = (/** @type {string} */ text) => text.split(/\*\*(.+?)\*\*/);

  /** @type {HTMLElement} */ let sheet;
  /** @type {SVGTextElement} */ let mark;
  /** @type {SVGPathElement} */ let sweat;

  // The conversation plays out as you get to it: each bubble pops up out of its speaker's tag in turn,
  // like a message arriving, and a marker swipes under the problem words. Polly's line about the
  // dogs sets off the drawing: the sofa jolts, the !? pops up, the sweat breaks out.
  // Everything is on the page as it is until the script hides it, so without it nothing is missing;
  // with reduced motion it all just stays put.
  /** @param {HTMLOListElement} node */
  function conversation(node) {
    if (reducedMotion()) return;
    const lines = /** @type {HTMLElement[]} */ ([...node.children]);
    for (const li of lines) {
      li.style.opacity = '0';
      li.dataset.wait = '';
    }
    mark.style.opacity = '0';
    sweat.style.opacity = '0';
    // one after another, never two at once, however fast the page is scrolled
    let turn = Promise.resolve();
    let last = 0;
    const say = (/** @type {HTMLElement} */ li) => {
      turn = turn.then(async () => {
        const wait = 240 - (performance.now() - last);
        if (wait > 0) await new Promise((r) => setTimeout(r, wait));
        last = performance.now();
        animate(li, { opacity: [0, 1], scale: [0.6, 1], y: [-10, 0] }, { type: 'spring', bounce: 0.4, visualDuration: 0.26, opacity: { duration: 0.08 } });
        setTimeout(() => delete li.dataset.wait, 120);
        if ('dogs' in li.dataset) setTimeout(startle, 150);
      });
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          say(/** @type {HTMLElement} */ (e.target));
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    for (const li of lines) io.observe(li);
    return { destroy: () => io.disconnect() };
  }
  function startle() {
    pop(sheet, { x: [0, -5, 5, -3, 0] }, { type: 'tween', duration: 0.36, ease: 'easeOut' });
    pop(mark, { opacity: [0, 1], scale: [0.2, 1], rotate: [-25, 0] }, { bounce: 0.6, visualDuration: 0.4, opacity: { duration: 0.1 } });
    pop(sweat, { opacity: [0, 1], y: [-6, 0] }, { type: 'tween', duration: 0.3, delay: 0.15, ease: 'easeOut' });
  }
</script>

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

<!-- one sofa, two dogs, the two of us squeezed in between -->
{#snippet crowdedSofa()}
  <svg class="sofa-pic" viewBox="0 0 200 160" aria-hidden="true">
    <rect class="wall" width="200" height="160" />
    <rect class="floor" y="140" width="200" height="20" />
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
    <path class="sweat" bind:this={sweat} d="M78 72 q5 8 0 12 q-5 -4 0 -12 Z M124 76 q4 7 0 10 q-4 -3 0 -10 Z" />
    <text class="mark" bind:this={mark} x="100" y="46" text-anchor="middle">!?</text>
  </svg>
{/snippet}

<section class="section family" aria-labelledby="family-h">
  <div class="wrap">
    <Text variant="title" id="family-h" class="family-title">Tady zůstat nemůžeme</Text>
    <Text variant="lede" class="family-lede">Naši lidi by si nás nejradši nechali. Doma to ale nejde.</Text>

    <!-- the one drawing (the crowded sofa), and the story told beside it in our own bubbles -->
    <div class="story">
      <div class="sofa-sheet paper-sheet" bind:this={sheet}>
        <Tape tilt={-12} width={68} style="top:-12px; left:-14px;" />
        {@render crowdedSofa()}
        <Tape tilt={9} width={60} style="bottom:-10px; right:-12px; top:auto;" />
      </div>

      <ol class="talk" use:conversation>
        {#each lines as line, i (i)}
          <li class="line {line.cat}" data-dogs={line.dogs ? '' : undefined}>
            <!-- who's talking: the head and name, shown under the bubble (its tail curls down to
                 them) but read out first -->
            <span class="who">
              <svg class="mini" viewBox="-20 -24 40 42" aria-hidden="true">
                <CatHead catId={line.cat} r={15} mood={line.mood} wobble={false} />
              </svg>
              {line.cat === 'velik' ? 'Velík' : 'Polly'}
            </span>
            <Card variant="bubble" class="said">
              <svg class="tail" viewBox="0 0 40 34" aria-hidden="true">
                <path class="tail-fill" d="M6 36 C14 26 18 14 12 2 C24 10 32 22 34 36 Z" />
                <path class="tail-line" d="M6 33 C14 24 18 14 12 2 C24 10 32 22 34 33" />
              </svg>
              <Text variant="lede">{#each parts(line.text) as part, j (j)}{#if j % 2}<strong>{part}</strong>{:else}{part}{/if}{/each}</Text>
            </Card>
          </li>
        {/each}
      </ol>
    </div>

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

  /* the drawing and our bubbles: one under the other on a phone, side by side from a laptop up */
  .story {
    margin-top: 36px;
    display: grid;
    gap: 36px;
  }
  /* the drawing on a sheet of paper, a little askew, like the stops on the map */
  .sofa-sheet {
    position: relative;
    align-self: start;
    padding: 9px;
    rotate: -1.5deg;
    --sheet-shade: -4px -5px;
    --sheet-drop: 0 12px 14px -10px rgba(40, 60, 15, 0.55);
  }
  .talk {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 26px;
  }
  /* a conversation: Velík from the left, Polly answering from the right, each bubble a little askew */
  .line {
    display: grid;
    justify-items: start;
    gap: 14px;
  }
  .line.polly {
    justify-items: end;
  }
  .line :global(.said) {
    --card-pad: 18px 18px 18px;
    max-width: 46ch;
    width: calc(100% - clamp(16px, 6vw, 48px));
  }
  .line.velik :global(.said) {
    rotate: -0.8deg;
  }
  .line.polly :global(.said) {
    rotate: 0.8deg;
  }
  /* the tail, curling down from the bubble's bottom edge to the name under it */
  .tail {
    position: absolute;
    bottom: -20px;
    left: 22px;
    width: 30px;
    height: 24px;
    overflow: visible;
    scale: 1 -1;
  }
  .line.polly .tail {
    left: auto;
    right: 22px;
    scale: -1 -1;
  }
  .tail-fill {
    fill: var(--paper);
  }
  .tail-line {
    fill: none;
    stroke: var(--ink);
    stroke-width: 3;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  /* the speaker: the same little ink tag as under our photos */
  .who {
    order: 1;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-inline: 6px;
    padding: 3px 12px 4px 6px;
    background: var(--ink);
    color: var(--paper);
    border: 3px solid var(--ink);
    border-radius: 999px;
    font-family: var(--f-marker);
    font-weight: 800;
    font-size: 0.95rem;
    rotate: -2deg;
  }
  .line.polly .who {
    rotate: 2deg;
  }
  /* the problem words: bold, with a marker swipe under them that draws in as the bubble lands */
  .line strong {
    font-weight: 800;
    background: linear-gradient(rgba(214, 51, 42, 0.26), rgba(214, 51, 42, 0.26)) no-repeat 0 88% / 100% 0.38em;
    transition: background-size 0.32s var(--ease-out) 0.05s;
  }
  .line:global([data-wait]) strong {
    background-size: 0% 0.38em;
  }
  /* each message grows out of its speaker's tag at the bottom */
  .line.velik {
    transform-origin: 30px 100%;
  }
  .line.polly {
    transform-origin: calc(100% - 30px) 100%;
  }
  .mini {
    width: 26px;
    height: 27px;
    margin: -6px 0 -3px;
    overflow: visible;
  }

  .sofa-pic {
    display: block;
    width: 100%;
    aspect-ratio: 5 / 4;
    border: 2px solid var(--ink);
    border-radius: 6px;
    overflow: hidden;
  }
  .sofa-pic :global(path),
  .sofa-pic :global(circle),
  .sofa-pic :global(ellipse),
  .sofa-pic :global(rect) {
    vector-effect: non-scaling-stroke;
  }
  .wall { fill: #dceaf3; }
  .floor { fill: #c9955f; }
  .sh { fill: rgba(70, 35, 10, 0.18); }
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
    transform-box: fill-box;
    transform-origin: 50% 80%;
    font-family: var(--f-marker);
    font-weight: 800;
    font-size: 22px;
    fill: var(--route);
    stroke: var(--ink);
    stroke-width: 0.8;
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

  /* tablets: the drawing stays on top, the bubbles keep to a readable width under it */
  @media (min-width: 760px) and (max-width: 1023px) {
    .story {
      max-width: 700px;
      margin-inline: auto;
    }
    .sofa-sheet {
      width: min(100%, 520px);
      justify-self: center;
    }
  }
  @media (min-width: 1024px) {
    .story {
      margin-top: 48px;
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
      align-items: center;
      gap: 56px;
    }
    .talk {
      gap: 22px;
    }
    /* the drawing sits level with the middle of the conversation beside it */
    .sofa-sheet {
      align-self: center;
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
</style>
