<script>
  // @ts-check
  // a cartoon strip of masking tape: inked outline, torn zigzag ends, a cel shade along the bottom and a shine
  //   tilt   its lean in degrees
  //   width  its length in px (it is drawn to that length, so not any other CSS unit)
  /** @type {{ tilt?: number, width?: number, style?: string, class?: string }} */
  let { tilt = -4, width = 96, style = '', class: cls = '' } = $props();

  const H = 26; // strip height
  const T = 4; // depth of the torn teeth
  const id = $props.id();
  // a torn end: four teeth along the edge at x, sticking out towards dir, drawn down or up
  const torn = (x, dir, down) => {
    let d = '';
    const s = H / 4;
    for (let i = 1; i <= 4; i++) {
      const y = down ? s * i : H - s * i;
      d += ` L ${x + dir * T} ${down ? y - s / 2 : y + s / 2} L ${x} ${y}`;
    }
    return d;
  };
  const outline = $derived(`M ${T} 0 H ${width - T}${torn(width - T, 1, true)} H ${T}${torn(T, -1, false)} Z`);
</script>

<svg
  class="tape {cls}"
  aria-hidden="true"
  {width}
  height={H}
  viewBox="-2 -2 {width + 4} {H + 4}"
  style="--r:{tilt}deg; {style}"
>
  <defs>
    <clipPath id="tape-{id}"><path d={outline} /></clipPath>
  </defs>
  <path class="fill" d={outline} />
  <g clip-path="url(#tape-{id})">
    <rect class="shade" x="0" y={H - 6} {width} height="6" />
    <path class="shine" d="M {T + 7} 7 H {Math.max(T + 14, width * 0.45)}" />
  </g>
  <path class="line" d={outline} />
</svg>

<style>
  .tape {
    position: absolute;
    display: block;
    overflow: visible;
    transform: rotate(var(--r));
    filter: drop-shadow(0 3px 2px rgba(40, 60, 15, 0.25));
    pointer-events: none;
    z-index: 3;
  }
  .fill {
    fill: #f6d37a;
  }
  .shade {
    fill: #e0b04a;
  }
  .shine {
    fill: none;
    stroke: #fff;
    stroke-width: 2.5;
    stroke-linecap: round;
    opacity: 0.75;
  }
  .line {
    fill: none;
    stroke: var(--ink);
    stroke-width: 3;
    stroke-linejoin: round;
  }
</style>
