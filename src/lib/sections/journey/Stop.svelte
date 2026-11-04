<script>
  // @ts-check
  import Photo from '../../ui/Photo.svelte';
  import Text from '../../ui/Text.svelte';
  import Card from '../../ui/Card.svelte';
  import Tape from '../../ui/Tape.svelte';
  import Icon from '../../ui/Icon.svelte';
  import { springTo } from '../../motion/springs.js';

  // one stop's story beside the map; it stays dimmed and lowered (upcoming) until the car reaches its
  // pin (reached), then pops open and gets taped down
  /** @type {{ stop: import('../../../content.js').Stop, side?: 'left' | 'right', reached?: boolean, el?: HTMLElement }} */
  let { stop, side = 'right', reached = false, el = $bindable() } = $props();
  const lean = $derived(side === 'right' ? 0.8 : -0.8);
</script>

<article class="stop {side}" class:upcoming={!reached} bind:this={el} aria-labelledby="stop-{stop.id}">
  <div
    class="card"
    use:springTo={{
      to: reached ? { y: 0, scale: 1, rotate: lean } : { y: 34, scale: 0.9, rotate: lean * -4 },
      bounce: 0.55,
      duration: 0.3,
    }}
  >
    <Card>
      <!-- taped on once the car reaches it, and it stays -->
      {#if reached}
        <Tape tilt={7} width={88} class="pin-tape" />
      {/if}
      <header>
        <h3 id="stop-{stop.id}" class="plaque">{stop.place}</h3>
        <span class="chip country"><Icon name="pin" size={18} /><span class="visually-hidden">Země: </span>{stop.country}</span>
      </header>
      <div class="body">
        <div class="shot">
          <Photo src={stop.photo} hint={stop.photoHint} alt={stop.photoHint} tilt={side === 'right' ? 2 : -2} tape={false} sizes="260px" />
        </div>
        <div class="text">
          <Text variant="subheading" class="stop-title">{stop.title}</Text>
          {#each stop.story as para}
            <Text>{para}</Text>
          {/each}
        </div>
      </div>
    </Card>
  </div>
</article>

<style>
  .stop {
    position: relative;
    z-index: 5;
  }
  .card {
    container-type: inline-size;
    --card-pad: 0 18px 22px;
    border-radius: 18px;
    font-family: var(--f-marker);
    /* its own layer: the spring moves and scales it every frame, which shouldn't repaint the story */
    will-change: transform;
  }
  header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 12px;
    margin-bottom: 18px;
  }
  /* the country chip sits right on the card's top edge, like the sign beside it */
  .country {
    align-self: flex-start;
    margin-top: -20px;
    position: relative;
    z-index: 1;
  }
  /* the place name on a red map sign that sticks out of the card */
  .plaque {
    display: inline-block;
    margin: -26px 0 0 -6px;
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
    font-size: clamp(2rem, 8.6vw, 3rem);
    transform: rotate(-2.5deg);
  }
  .left .plaque {
    transform: rotate(2deg);
  }
  .text :global(.stop-title) {
    margin-bottom: 8px;
  }
  .body {
    display: grid;
    gap: 16px;
  }
  .text {
    display: grid;
    gap: 10px;
    max-width: 62ch;
  }
  .shot {
    position: relative;
    width: min(100%, 260px);
  }
  .card :global(.pin-tape) {
    top: -12px;
  }
  .card :global(.pin-tape) {
    right: -26px;
  }
  /* phones: the country chip reaches the card's right corner, so the tape holds the side edge below it */
  @media (max-width: 759px) {
    .card :global(.pin-tape) {
      top: 30px;
    }
  }
  /* the story pops open when the car pulls up */
  /* (the card's lift and lean spring with the car, see use:springTo) */
  .upcoming .card :global(.surface > *) {
    opacity: 0.6;
    filter: saturate(0.3);
  }
  .card :global(.surface > *) {
    transition: opacity 0.14s ease-out, filter 0.14s ease-out;
  }
  /* the header and the story on layers of their own, so their fade runs on the compositor instead of
     repainting the whole story on every frame of it */
  header,
  .body {
    will-change: opacity, filter;
  }
  .upcoming .card {
    outline: 3px dashed rgba(22, 19, 17, 0.55);
    outline-offset: 8px;
  }

  @media (min-width: 760px) {
    .stop {
      width: calc(100% - var(--gutter));
    }
    .stop.right {
      margin-left: var(--gutter);
    }
  }
  /* photo beside the story only once the card itself is wide enough for both; otherwise it stays on top */
  @container (min-width: 580px) {
    .body {
      grid-template-columns: 220px 1fr;
      align-items: start;
    }
  }
</style>
