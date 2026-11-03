<script>
  // an <svg> that frames whatever is drawn inside it: the view box is measured from the drawing
  let { pad = 8, height = 150, children } = $props();
  let g;
  let box = $state('0 0 100 100');
  $effect(() => {
    const b = g.getBBox();
    box = `${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`;
  });
</script>

<svg viewBox={box} style="height:{height}px" aria-hidden="true">
  <g bind:this={g}>{@render children()}</g>
</svg>

<style>
  svg {
    display: block;
    width: 100%;
    overflow: visible;
  }
</style>
