<svelte:options namespace="svg" />

<script>
  // a hand-drawn piece in place of the code-drawn one (its children), once its drawing exists;
  // see drawn.js. With no options it lands exactly where its template was cut from.
  //   part  just this piece of the drawing (one of the two pins; the log, to put it back in front
  //         of the fire)
  import { drawn } from './drawn.js';
  let { id, part = undefined, children, ...rest } = $props();

  const art = $derived(drawn(id));
  const from = $derived(art && (part === undefined ? art : art.parts[part]));
</script>

{#if art}
  <svg
    x={from.x}
    y={from.y}
    width={from.w}
    height={from.h}
    viewBox="{from.x} {from.y} {from.w} {from.h}"
    preserveAspectRatio="none"
    overflow={part === undefined ? 'visible' : 'hidden'}
    {...rest}
  >
    <image href={art.url} x={art.x} y={art.y} width={art.w} height={art.h} preserveAspectRatio="none" />
  </svg>
{:else}
  {@render children?.()}
{/if}
