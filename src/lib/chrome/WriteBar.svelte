<script>
  // @ts-check
  // phones: the page is long, so the way to write to us waits at the bottom edge, under the thumb,
  // with the two of them peeking over it. It steps aside while anything marked data-writebar-yields
  // is on screen: the hero and the family section's "write to us" buttons, and the contact section
  // itself.
  import { onMount } from 'svelte';
  import Button from '../ui/Button.svelte';
  import Icon from '../ui/Icon.svelte';
  import CatHead from '../figures/CatHead.svelte';
  import { onScreen, onScrollFrame } from '../motion/viewport.js';

  let shown = $state(false);

  // looked up fresh each time, so a section that re-renders can't leave a stale answer behind
  function updateShown() {
    shown = ![...document.querySelectorAll('[data-writebar-yields]')].some((el) => onScreen(el));
  }
  onMount(() => {
    updateShown();
    return onScrollFrame(updateShown);
  });
</script>

<div class="bar" class:shown inert={!shown}>
  <svg class="faces" viewBox="-34 -36 68 52" aria-hidden="true">
    <CatHead catId="velik" cx={-12} cy={0} r={15} mood="happy" tilt={-8} delay={0} />
    <CatHead catId="polly" cx={14} cy={3} r={13} mood="happy" tilt={8} delay={0.6} />
  </svg>
  <Button href="#domov" bounce={{ over: { scale: 1.02 } }}>Napište našim lidem <Icon name="right" size={24} /></Button>
</div>

<style>
  .bar {
    position: fixed;
    z-index: 20;
    left: 12px;
    right: 12px;
    bottom: calc(10px + env(safe-area-inset-bottom));
    display: none;
    translate: 0 calc(100% + 40px);
    visibility: hidden;
    transition:
      translate 0.45s var(--ease-out),
      visibility 0s linear 0.45s;
  }
  .bar.shown {
    translate: 0 0;
    visibility: visible;
    transition:
      translate 0.5s var(--ease-back),
      visibility 0s;
  }
  /* the two of them peek over the button's top edge, ears first */
  .faces {
    position: absolute;
    z-index: 0;
    left: 18px;
    bottom: calc(100% - 14px);
    width: 76px;
    overflow: visible;
  }
  .bar :global(.button) {
    position: relative;
    z-index: 1;
    width: 100%;
    justify-content: center;
    min-height: 56px;
    font-size: 1.25rem;
  }
  /* phones, and touch screens of any size (tablets, an unfolded Duo); a mouse has the page's own buttons */
  @media (max-width: 759px), (pointer: coarse) {
    .bar {
      display: block;
    }
  }
  /* wider screens: a button, not a band across the whole width */
  @media (min-width: 560px) {
    .bar {
      left: 50%;
      right: auto;
      width: 420px;
      margin-left: -210px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .bar,
    .bar.shown {
      transition: visibility 0s;
    }
  }
</style>
