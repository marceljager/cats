<script>
  // @ts-check
  // the car: a little cartoon van body on two wheels; the two big heads ride on top
  import CatHead from './CatHead.svelte';
  /** @type {{ x?: number, y?: number, tilt?: number, bump?: number, km?: number, moving?: boolean }} */
  let { x = 0, y = 0, tilt = 0, bump = 0, km = 0, moving = false } = $props();
</script>

<div class="car" style="transform: translate3d({x}px, {y}px, 0) translate(-50%, -50%) rotate({tilt}deg)" aria-hidden="true">
  <div class="bounce" style="translate: 0 {bump}px">
    <div class="body">
      <span class="wheel a"></span>
      <span class="wheel b"></span>
    </div>
    <!-- heads after the body, so they sit in front of it -->
    <svg class="riders" viewBox="0 0 120 70" aria-hidden="true">
      <CatHead catId="velik" cx={38} cy={50} r={29} mood="happy" tilt={-6} />
      <CatHead catId="polly" cx={84} cy={46} r={24} mood="happy" tilt={8} delay={0.7} />
    </svg>
  </div>
  <!-- odometer: kilometres from the forest, shown only while driving -->
  <span class="odo" class:on={moving}>{km}<small>km</small></span>
</div>

<style>
  .car {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 4;
    will-change: transform;
    pointer-events: none;
  }
  .body {
    position: relative;
    width: 80px;
    height: 27px;
    background: var(--paper);
    border: 3px solid var(--ink);
    border-radius: 11px 17px 8px 8px;
    box-shadow: 0 6px 12px -4px rgba(60, 35, 10, 0.55);
  }
  /* the two big heads ride on the car, wider than the car itself */
  .riders {
    position: absolute;
    left: 50%;
    bottom: calc(100% - 12px);
    width: 146%;
    translate: -50% 0;
    overflow: visible;
  }
  .bounce {
    position: relative;
  }
  /* a quiet number trailing the car, no plate behind it */
  .odo {
    position: absolute;
    left: 50%;
    top: calc(100% + 14px);
    translate: -50% 4px;
    display: flex;
    align-items: baseline;
    gap: 3px;
    color: var(--ink-soft);
    font-family: var(--f-marker);
    font-weight: 800;
    font-size: 1.05rem;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    text-shadow: 0 0 6px var(--land), 0 0 2px var(--land);
    opacity: 0;
    transition: opacity 0.6s ease, translate 0.6s var(--ease-out);
  }
  .odo small {
    font-size: 0.75em;
    font-weight: 700;
  }
  .odo.on {
    opacity: 0.6;
    translate: -50% 0;
    transition-duration: 0.15s;
  }
  .wheel {
    position: absolute;
    bottom: -8px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--ink);
    box-shadow: inset 0 0 0 4px var(--ink), inset 0 0 0 6px var(--land-light);
  }
  .wheel.a { left: 10px; }
  .wheel.b { right: 10px; }

  @media (min-width: 760px) {
    .body {
      width: 112px;
      height: 36px;
    }
    .wheel { width: 20px; height: 20px; bottom: -10px; }
    .wheel.a { left: 15px; }
    .wheel.b { right: 15px; }
  }
</style>
