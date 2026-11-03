<script>
  import Icon from './Icon.svelte';
  import Text from './Text.svelte';
  import Card from './Card.svelte';
  import { vet, cats } from '../content.js';
  import { bouncy, scrollLinked } from './springs.js';
  import { animate } from 'motion';

  // the clipboard's clip snaps shut with a little clack when you point at the report
  let clip;
  const clack = () => clip && animate(clip, { y: [0, 5, 0], scaleX: [1, 1.06, 1] }, { duration: 0.32, ease: 'easeOut' });

</script>

<section class="section vet" aria-labelledby="vet-h">
  <div class="wrap">
    <!-- a vet's clipboard with the report clipped on -->
    <!-- the clipboard comes in tilted, straightens as it reaches the middle of the screen, and tilts away again as it leaves -->
    <div
      class="board"
      onpointerenter={clack}
      use:scrollLinked={{ keyframes: { y: [14, 0, -14], rotate: [2.5, 0.8, -2.5] }, rest: { rotate: 0.8 } }}
    >
      <div class="clip" aria-hidden="true" bind:this={clip}><span></span></div>
      <article class="report">
        <header class="head">
          <span class="cross" aria-hidden="true"></span>
          <div>
            <Text variant="heading" as="h2" id="vet-h">Veterinární zpráva</Text>
            <Text class="patients"><Text variant="label">Pacienti</Text>{cats[0].name} a {cats[1].name}, sourozenci</Text>
          </div>
        </header>

        <ol class="visits">
          {#each vet.visits as v, i}
            <li class="visit">
              <span class="pin" aria-hidden="true"><Icon name="pin" size={20} /></span>
              <p class="when"><span class="chip">{v.place}</span><Text variant="small" as="span" class="step">{i + 1}. návštěva</Text></p>
              <Text variant="subheading" as="h3" class="visit-title">{v.title}</Text>
              <ul class="done">
                {#each v.done as item}
                  <li><Icon name="check" size={26} /><Text as="span">{item}</Text></li>
                {/each}
              </ul>
              <div class="quote" use:bouncy={{ over: { rotate: i % 2 ? 1.5 : -1.5, scale: 1.02, y: -2 } }}>
                <Card variant="quote" as="blockquote">
                  {#if v.quote}
                    <Text variant="subheading" as="p" lang={v.quote.lang}>„{v.quote.text}“</Text>
                  {:else}
                    <Text variant="subheading" as="p">„{vet.verdict}“</Text>
                  {/if}
                  <Text variant="small" as="cite" class="who">{v.who}</Text>
                </Card>
              </div>
            </li>
          {/each}
        </ol>

        <footer class="score">
          <Text variant="label">Celkové hodnocení</Text>
          <p class="hearts" role="img" aria-label="Plné hodnocení, 5 z 5">
            {#each Array(5) as _, k}
              <span class="heart" style="--k:{k}"><span class="heart-in" use:bouncy={{ over: { scale: 1.35, rotate: -8, y: -2 } }}><Icon name="heart" size={28} /></span></span>
            {/each}
          </p>
        </footer>

        <!-- the bill, settled: a red rubber stamp over the last line of the report -->
        <div class="bill">
          <Text variant="label">Účet</Text>
          <Text class="bill-text">{vet.paid}</Text>
          <span class="paid" aria-hidden="true">Zaplaceno</span>
        </div>
      </article>
    </div>
  </div>
</section>

<style>
  /* clipboard: a wooden board, a metal clip, the paper report on top */
  .board {
    position: relative;
    padding: 34px 12px 14px;
    background: #b98252;
    border: 3px solid var(--ink);
    border-radius: 22px;
    box-shadow:
      inset -6px -7px 0 #8f5e33,
      0 16px 18px -12px rgba(40, 60, 15, 0.55);
    max-width: 640px;
    margin: 0 auto;
    /* (its resting 0.8° lean is set by the drop-in spring) */
  }
  .clip {
    position: absolute;
    top: -16px;
    left: 50%;
    translate: -50% 0;
    width: 120px;
    height: 40px;
    background: #c9d3dc;
    border: 3px solid var(--ink);
    border-radius: 12px 12px 8px 8px;
    box-shadow: inset -4px -5px 0 #8e9aa6;
    z-index: 2;
  }
  .clip span {
    position: absolute;
    top: 8px;
    left: 50%;
    translate: -50% 0;
    width: 30px;
    height: 10px;
    background: #b98252;
    border: 2px solid var(--ink);
    border-radius: 6px;
  }
  .report {
    position: relative;
    padding: 18px 16px 18px;
    background: var(--paper);
    border: 3px solid var(--ink);
    border-radius: 10px;
    box-shadow: inset -5px -6px 0 var(--paper-shade);
    font-family: var(--f-marker);
  }
  .head {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 14px;
    border-bottom: 2px dashed var(--ink);
  }
  /* a green medical cross badge */
  .cross {
    position: relative;
    flex: none;
    width: 52px;
    height: 52px;
    background: #3f9a5a;
    border: 3px solid var(--ink);
    border-radius: 14px;
    box-shadow: inset -3px -4px 0 #2d7444;
  }
  .cross::before,
  .cross::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    translate: -50% -50%;
    background: var(--paper);
    border: 2px solid var(--ink);
    border-radius: 3px;
  }
  .cross::before {
    width: 12px;
    height: 32px;
  }
  .cross::after {
    width: 32px;
    height: 12px;
    border-inline-width: 2px;
  }
  .head :global(.patients) {
    margin-top: 4px;
  }

  /* the visits, joined like stops on the route */
  .visits {
    position: relative;
    list-style: none;
    margin: 20px 0 0;
    padding: 0 0 0 40px;
    display: grid;
    gap: 26px;
  }
  .visit {
    position: relative;
  }
  /* the dashed route from one visit's pin to the next */
  .visit:not(:last-child)::before {
    content: '';
    position: absolute;
    left: -27px;
    top: 30px;
    bottom: -26px;
    border-left: 4px dashed var(--route);
  }
  .pin {
    position: absolute;
    left: -40px;
    top: 0;
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    background: var(--paper);
    color: var(--route);
    border: 3px solid var(--route);
    border-radius: 50%;
  }
  .when {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  /* no icon in this pill, so even padding on both sides */
  .when .chip {
    padding-left: 11px;
  }
  .when :global(.step) {
    color: #4a4238;
  }
  .visits :global(.visit-title) {
    margin: 8px 0;
  }
  .done {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 8px;
  }
  .done li {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .quote {
    margin: 14px 0 0;
    --card-pad: 10px 14px 12px;
  }
  .quote :global(.who) {
    display: block;
    margin-top: 2px;
    font-style: normal;
    color: #2d5a3a;
  }

  .score {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 14px;
    margin-top: 24px;
    padding-top: 14px;
    border-top: 2px dashed var(--ink);
  }
  .bill {
    position: relative;
    margin-top: 16px;
    padding: 14px 0 4px;
    border-top: 2px dashed var(--ink);
  }
  .bill :global(.bill-text) {
    margin-top: 4px;
    max-width: 34ch;
  }
  /* the stamp: red ink pressed on at an angle, a little uneven, with a double frame */
  .paid {
    display: block;
    width: fit-content;
    margin: 14px 0 0 auto;
    padding: 6px 14px 5px;
    rotate: -7deg;
    font-family: var(--f-label);
    font-variation-settings: 'wdth' 80;
    font-weight: 800;
    font-size: 1.5rem;
    letter-spacing: 0.12em;
    line-height: 1;
    text-transform: uppercase;
    color: var(--stamp);
    border: 3px solid var(--stamp);
    border-radius: 8px;
    outline: 1.5px solid var(--stamp);
    outline-offset: 3px;
    opacity: 0.88;
    mix-blend-mode: multiply;
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -2.4 2.1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -2.4 2.1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
  @media (min-width: 560px) {
    /* room beside the text: the stamp lands across the right edge of the line */
    .paid {
      position: absolute;
      right: 4px;
      bottom: 10px;
      margin: 0;
    }
  }
  .hearts {
    display: flex;
    gap: 2px;
  }

  /* the rating hearts beat one after another, slowly, and pop when pointed at */
  .heart {
    display: block;
    transform-origin: 50% 60%;
    animation: beat 4s ease-in-out calc(var(--k) * 0.18s) infinite;
  }
  .heart:hover {
    animation-play-state: paused;
  }
  .heart-in {
    display: block;
    transform-origin: 50% 60%;
  }
  @keyframes beat {
    0%, 20%, 100% { transform: scale(1); }
    8% { transform: scale(1.18); }
    14% { transform: scale(0.96); }
  }
  @media (prefers-reduced-motion: reduce) {
    .heart { animation: none; }
  }

  @media (min-width: 760px) {
    .board {
      padding: 40px 18px 18px;
    }
    .report {
      padding: 26px 30px 24px;
    }
  }
</style>
