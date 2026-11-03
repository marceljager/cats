<script>
  // @ts-check
  // every piece of text on the page, in one of eight sizes:
  //   display     the hero's big hello
  //   title       one headline per section
  //   heading     a big heading on a card (names, "Napište našim lidem")
  //   subheading  a small heading (a stop's title, a vet visit)
  //   lede        the opening paragraph, speech bubbles
  //   body        running text
  //   small       captions and side notes
  //   label       printed caption in condensed capitals
  // `as` picks the element (each size has a sensible default); colour, width and spacing come from
  // the surroundings, so pass a `class` and style it with :global() where the layout needs it.
  const TAG = { display: 'h1', title: 'h2', heading: 'h3', subheading: 'h4', lede: 'p', body: 'p', small: 'p', label: 'span' };
  /** @type {{ variant?: keyof typeof TAG, as?: string, class?: string, children: import('svelte').Snippet, [attr: string]: unknown }} */
  let { variant = 'body', as = undefined, class: cls = '', children, ...rest } = $props();
</script>

<svelte:element this={as ?? TAG[variant]} class="text {variant} {cls}" {...rest}>{@render children()}</svelte:element>

<style>
  .text {
    margin: 0;
    font-family: var(--f-marker);
    text-wrap: pretty;
  }
  .display,
  .title,
  .heading,
  .subheading {
    font-weight: 800;
    font-variation-settings: 'INFM' 100, 'BNCE' 40;
    letter-spacing: -0.02em;
    line-height: 1.02;
    text-wrap: balance;
  }
  .display {
    font-size: clamp(2.8rem, 12vw, 5.8rem);
  }
  .title {
    max-width: 16ch;
    font-size: clamp(2.6rem, 6.2vw, 5.4rem);
  }
  .heading {
    font-size: clamp(2rem, 8vw, 2.6rem);
  }
  .subheading {
    font-size: 1.3rem;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }
  .lede {
    font-size: clamp(1.15rem, 4.6vw, 1.45rem);
    font-weight: 600;
    line-height: 1.45;
  }
  .body {
    font-size: 1.0625rem;
    line-height: 1.55;
  }
  .small {
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.35;
  }
  .label {
    display: block;
    font-family: var(--f-label);
    font-variation-settings: 'wdth' 70;
    font-weight: 700;
    font-size: 0.6875rem;
    letter-spacing: 0.08em;
    line-height: 1.3;
    text-transform: uppercase;
    opacity: 0.8;
  }
</style>
