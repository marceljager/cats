<script>
  // a photo taped onto the box; without src it shows a placeholder to replace.
  // A real photo opens big in the lightbox; pass zoom={false} where a button around it does that.
  //   sizes    how wide the photo shows, for picking a file from srcset (scripts/images.js makes them)
  //   eager    load it right away instead of when it scrolls near
  //   preview  a small copy already on screen: shown blurred, with a spinner, until this one loads
  import Icon from './Icon.svelte';
  import Text from './Text.svelte';
  import Tape from './Tape.svelte';
  import { zoomPhoto } from './lightbox.js';
  import { photoInfo, srcset, photoFile } from './images.js';
  let { src = null, hint = '', alt = '', ratio = '4 / 5', tilt = 0, tape = true, zoom = true, sizes = '300px', eager = false, preview = null, class: cls = '' } = $props();
  let figure;
  let img = $state();
  let loaded = $state(false);
  // the big file didn't come: the small copy stays, sharp, rather than a blur and a spinner forever
  let failed = $state(false);
  const p = $derived(photoInfo(src));
  // a photo that was already in the cache can finish loading before its onload is listened to
  $effect(() => {
    if (img?.complete && img.naturalWidth) loaded = true;
  });
</script>

{#snippet picture()}
  {#if preview && !loaded}
    <img class="preview" class:failed src={preview} alt="" aria-hidden="true" />
  {/if}
  {#if preview && !loaded && !failed}
    <span class="spinner" aria-hidden="true">
      <svg viewBox="0 0 40 40"><circle class="ring" cx="20" cy="20" r="14" /><circle class="dash" cx="20" cy="20" r="14" /></svg>
    </span>
  {/if}
  <picture>
    {#if p}
      <source type="image/avif" srcset={srcset(src, 'avif')} {sizes} />
      <source type="image/webp" srcset={srcset(src, 'webp')} {sizes} />
    {/if}
    <img
      bind:this={img}
      class:waiting={preview && !loaded}
      src={photoFile(src, 800)}
      srcset={srcset(src)}
      sizes={p ? sizes : undefined}
      width={p?.w}
      height={p?.h}
      {alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onload={() => (loaded = true)}
      onerror={() => (failed = true)}
    />
  </picture>
{/snippet}

<figure class="photo {cls}" style="--tilt:{tilt}deg; --ratio:{ratio}" bind:this={figure}>
  {#if tape}
    <Tape tilt={-12} width={68} style="top:-12px; left:-14px;" />
    <Tape tilt={9} width={60} style="bottom:-10px; right:-12px; top:auto;" />
  {/if}
  {#if src && zoom}
    <button
      class="frame zoom"
      type="button"
      aria-label="{alt || hint}: zvětšit fotku"
      onclick={(e) => zoomPhoto({ el: figure, photo: src, alt, hint, ratio, tilt, tape, opener: e.currentTarget })}
    >
      {@render picture()}
    </button>
  {:else}
    <div class="frame">
      {#if src}
        {@render picture()}
      {:else}
        <div class="placeholder" role="img" aria-label={alt || `Zástupná fotka: ${hint}`}>
          <Icon name="camera" size={30} />
          <!-- the frame's label already says this to screen readers -->
          <Text variant="label" aria-hidden="true">Fotka</Text>
          <Text variant="small" as="span" class="hint" aria-hidden="true">{hint}</Text>
        </div>
      {/if}
    </div>
  {/if}
</figure>

<style>
  .photo {
    position: relative;
    margin: 0;
    padding: 9px 9px 14px;
    background: var(--paper);
    border: 3px solid var(--ink);
    border-radius: 10px;
    box-shadow:
      inset -4px -5px 0 var(--paper-shade),
      0 12px 14px -10px rgba(40, 60, 15, 0.55);
    transform: rotate(var(--tilt));
  }
  .frame {
    position: relative;
    display: block;
    width: 100%;
    aspect-ratio: var(--ratio);
    overflow: hidden;
    border: 2px solid var(--ink);
    border-radius: 6px;
    background: #e9e3d6;
  }
  .zoom {
    padding: 0;
    font: inherit;
    cursor: zoom-in;
  }
  .zoom:focus-visible {
    outline-offset: 4px;
  }
  picture {
    display: block;
    width: 100%;
    height: 100%;
  }
  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: scale 0.2s var(--ease-out), opacity 0.35s var(--ease-out);
  }
  /* the big one fades in over its blurred small copy once it has arrived */
  img.waiting {
    opacity: 0;
  }
  .preview {
    position: absolute;
    inset: 0;
    filter: blur(14px) saturate(1.1);
    scale: 1.08;
  }
  .preview.failed {
    filter: none;
    scale: 1;
  }
  /* a red route dash running round a paper disc, in the middle of the photo while it loads;
     it waits a moment first, so a photo that arrives quickly never flashes it */
  .spinner {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    width: 56px;
    height: 56px;
    margin: -28px 0 0 -28px;
    display: grid;
    place-items: center;
    background: var(--paper);
    border: 3px solid var(--ink);
    border-radius: 50%;
    box-shadow: 0 8px 10px -6px rgba(20, 30, 15, 0.5);
    opacity: 0;
    animation: appear 0.2s var(--ease-out) 0.18s forwards;
  }
  .spinner svg {
    width: 38px;
    height: 38px;
    animation: spin 0.9s linear infinite;
  }
  .ring {
    fill: none;
    stroke: var(--paper-shade);
    stroke-width: 4;
  }
  .dash {
    fill: none;
    stroke: var(--route);
    stroke-width: 4;
    stroke-linecap: round;
    stroke-dasharray: 9 7;
  }
  @keyframes appear {
    to { opacity: 1; }
  }
  @keyframes spin {
    to { rotate: 360deg; }
  }
  .zoom:hover img {
    scale: 1.03;
  }
  .placeholder {
    height: 100%;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 6px;
    padding: 12px;
    text-align: center;
    color: #5d5245;
    background:
      radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.7) 0 14%, transparent 15%),
      repeating-linear-gradient(-45deg, transparent 0 11px, rgba(80, 104, 46, 0.12) 11px 13px),
      #e3ecc4;
  }
  .placeholder :global(.hint) {
    max-width: 16ch;
  }
  @media (prefers-reduced-motion: reduce) {
    img {
      transition: none;
    }
    .spinner svg {
      animation-duration: 3s;
    }
  }
</style>
