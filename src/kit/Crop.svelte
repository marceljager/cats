<script>
  // A live window onto part of the real page: loads the site in an iframe at desktop size,
  // scrolls it to the element and shows just that piece, scaled to fit. Always up to date and still
  // interactive, for drawings that live inside a section instead of in their own component.
  //   sel      CSS selector; every match is included and the window fits around all of them
  //   pick     only the n-th match (0-based), e.g. one tree out of a whole row
  //   isolate  hide everything else on the page, so the piece stands alone on `bg`
  //   alone    with isolate: show the element itself but not its children (e.g. a background)
  //   scroll   false keeps the page at the top (for the opening scene, whose layers move on scroll)
  let { sel, pick = undefined, isolate = false, alone = false, scroll = true, bg = '#eef2df', pad = 24, layout = 1280, view = 900 } = $props();

  let box = $state();
  let frame = $state();
  let crop = $state(null); // { x, y, w, h } in page pixels
  // the iframe grows taller when a piece near the end of the page cannot be scrolled up into view
  let tall = $state(view);
  let fit = $state(0); // width available for the crop

  function targets(doc) {
    const all = [...doc.querySelectorAll(sel)];
    return pick === undefined ? all : all.slice(pick, pick + 1);
  }

  // hide the rest of the page; the marked pieces (and, unless `alone`, everything inside them) stay
  function hideTheRest(doc, els) {
    els.forEach((el) => el.setAttribute('data-crop', ''));
    if (doc.getElementById('crop-isolate')) return;
    const style = doc.createElement('style');
    style.id = 'crop-isolate';
    style.textContent = `
      html, body { background: ${bg} !important; }
      body * { visibility: hidden !important; }
      [data-crop]${alone ? '' : ', [data-crop] *'} { visibility: visible !important; }
    `;
    doc.head.append(style);
  }

  // put the pieces at the top of the iframe's view and read where they landed
  function place() {
    const doc = frame?.contentDocument;
    const els = doc ? targets(doc) : [];
    if (!els.length) return;
    if (isolate) hideTheRest(doc, els);
    if (scroll) {
      els[0].scrollIntoView({ block: 'start', behavior: 'instant' });
      frame.contentWindow.scrollBy({ top: -pad, behavior: 'instant' });
    }
    const rs = els.map((el) => el.getBoundingClientRect()).filter((r) => r.width || r.height);
    if (!rs.length) return;
    const l = Math.min(...rs.map((r) => r.left));
    const t = Math.min(...rs.map((r) => r.top));
    const r = Math.max(...rs.map((r) => r.right));
    const b = Math.max(...rs.map((r) => r.bottom));
    crop = { x: l - pad, y: t - pad, w: r - l + pad * 2, h: b - t + pad * 2 };
    tall = Math.max(view, Math.ceil(crop.y + crop.h));
  }

  // the page keeps reflowing after load (fonts, the map laying itself out), so measure again
  // whenever it changes size, and a few more times while its entrance animations settle
  let stop = () => {};
  async function measure() {
    stop();
    const doc = frame.contentDocument;
    await doc.fonts.ready;
    const ro = new ResizeObserver(place);
    ro.observe(doc.body);
    const timers = [0, 300, 800, 1500, 2500].map((t) => setTimeout(place, t));
    stop = () => {
      ro.disconnect();
      timers.forEach(clearTimeout);
    };
  }
  $effect(() => () => stop());

  $effect(() => {
    if (!box) return;
    const ro = new ResizeObserver(() => (fit = box.clientWidth));
    ro.observe(box);
    return () => ro.disconnect();
  });

  const scale = $derived(crop && fit ? Math.min(1, fit / crop.w) : 0);
</script>

<div class="crop" class:ready={crop} bind:this={box} style={crop ? `height:${crop.h * scale}px` : ''}>
  <div class="window" style={crop ? `width:${crop.w}px; height:${crop.h}px; transform:scale(${scale})` : ''}>
    <iframe
      bind:this={frame}
      src="/"
      title="Ukázka z webu"
      loading="lazy"
      width={layout}
      height={tall}
      onload={measure}
      style={crop ? `translate:${-crop.x}px ${-crop.y}px` : ''}
    ></iframe>
  </div>
  {#if !crop}<span class="wait">Načítám…</span>{/if}
</div>

<style>
  .crop {
    position: relative;
    width: 100%;
    min-height: 60px;
    overflow: hidden;
  }
  .window {
    position: relative;
    overflow: hidden;
    transform-origin: 0 0;
  }
  iframe {
    display: block;
    border: 0;
  }
  .crop:not(.ready) iframe {
    visibility: hidden;
    position: absolute;
  }
  .wait {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-family: var(--f-label);
    font-size: 0.85rem;
    color: #4a4238;
  }
</style>
