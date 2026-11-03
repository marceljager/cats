<script>
  // a cartoon surface: inked outline, flat cel shade along the lower-right edge.
  // Position, size and motion belong to whatever wraps it; inner spacing comes from --card-pad.
  //   variant 'card'   (paper card with a soft ground shadow, e.g. the map stops)
  //           | 'bubble' (wobbly speech bubble)
  //           | 'quote'  (small green bubble for a quote)
  //   as      the element to render, e.g. 'blockquote'
  //   --card-bg overrides the background
  let { variant = 'card', as = 'div', children, ...rest } = $props();
</script>

<svelte:element this={as} class="surface {variant}" {...rest}>
  {@render children()}
</svelte:element>

<style>
  .surface {
    position: relative;
    margin: 0;
    padding: var(--card-pad, 18px 20px);
    background: var(--card-bg, var(--paper));
    color: var(--ink);
    border: 3px solid var(--ink);
    border-radius: 18px;
  }
  .card {
    box-shadow:
      inset -6px -7px 0 var(--paper-shade),
      inset 4px 4px 0 #fff,
      0 16px 18px -12px rgba(40, 60, 15, 0.55);
  }
  .bubble {
    border-radius: 28px 28px 32px 26px / 26px 30px 28px 30px;
    box-shadow:
      inset -5px -6px 0 var(--paper-shade),
      0 12px 14px -10px rgba(40, 60, 15, 0.5);
  }
  .quote {
    background: var(--card-bg, #e4f1e7);
    border-width: 2.5px;
    box-shadow: inset -3px -4px 0 #c5e0cb;
  }
</style>
