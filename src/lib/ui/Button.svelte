<script>
  // the cartoon button: inked outline, cel shade along the bottom, springy on hover.
  // A link with href, a <button> without one.
  //   variant 'default' | 'arrow' (the right end is a pointed arrow tip, like a signpost)
  //           | 'round' (icon only, a circle; size from --round, 52px by default)
  //           | 'link'  (no box: text with a wavy underline, in the surrounding colour)
  //   theme   'red' | 'paper'
  //   bounce  options for use:bouncy, e.g. { rest: { rotate: -2 } }
  import { bouncy } from '../motion/springs.js';

  let { href = undefined, variant = 'default', theme = 'red', bounce = {}, children, ...rest } = $props();
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  class="button {variant} {theme}"
  {href}
  type={href ? undefined : 'button'}
  use:bouncy={bounce}
  {...rest}
>
  {#if variant === 'arrow'}
    <svg class="tip" viewBox="0 0 30 60" preserveAspectRatio="none" aria-hidden="true">
      <path class="tip-fill" d="M-2 1.5 L28 30 L-2 58.5 Z" />
      <path class="tip-shade" d="M-2 53.5 L22.7 30 L28 30 L-2 58.5 Z" />
      <path class="tip-line" d="M0 1.5 L28 30 L0 58.5" />
    </svg>
  {/if}
  {@render children()}
</svelte:element>

<style>
  .button {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    min-height: 60px;
    margin: 0;
    padding: 0 22px;
    background: var(--bg);
    color: var(--fg);
    border: 3px solid var(--ink);
    border-radius: 14px;
    box-shadow:
      inset -4px -5px 0 var(--shade),
      0 12px 16px -8px rgba(0, 0, 0, 0.6);
    font-family: var(--f-marker);
    font-weight: 800;
    font-size: 1.35rem;
    font-variation-settings: 'INFM' 100;
    line-height: 1.15;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .red {
    --bg: var(--route);
    --fg: var(--paper);
    --shade: #a8241c;
  }
  .paper {
    --bg: var(--paper);
    --fg: var(--ink);
    --shade: var(--paper-shade);
  }
  .paper:hover {
    --bg: var(--land-light);
  }

  /* arrow: the body stays open on the right and a drawn tip carries the outline to a point */
  .arrow {
    margin-right: 28px;
    padding-right: 8px;
    border-right: 0;
    border-radius: 14px 0 0 14px;
    box-shadow: inset 0 -5px 0 var(--shade);
    filter: drop-shadow(0 10px 8px rgba(40, 60, 15, 0.35));
  }
  .tip {
    position: absolute;
    top: -3px;
    left: calc(100% - 1px);
    width: 29px;
    height: calc(100% + 6px);
    overflow: visible;
  }
  .tip-fill {
    fill: var(--bg);
    transition: fill 0.2s;
  }
  .tip-shade {
    fill: var(--shade);
  }
  .tip-line {
    fill: none;
    stroke: var(--ink);
    stroke-width: 3;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }

  .round {
    justify-content: center;
    width: var(--round, 52px);
    height: var(--round, 52px);
    min-height: 0;
    padding: 0;
    border-radius: 50%;
  }

  .link {
    gap: 8px;
    min-height: 44px;
    padding: 6px 2px;
    background: none;
    color: inherit;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    font-size: inherit;
    font-weight: 700;
    text-decoration: underline wavy;
    text-decoration-thickness: 1.5px;
    text-underline-offset: 5px;
  }
</style>
