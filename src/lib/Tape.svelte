<script>
  // a cartoon strip of masking tape: inked outline, torn zigzag ends, a cel shade along the bottom and a shine
  let { rotate = -4, width = '96px', style = '', class: cls = '' } = $props();

  const H = 26; // strip height
  const T = 4; // depth of the torn teeth
  const id = $props.id();
  const w = $derived(parseFloat(width) || 96);
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
  const outline = $derived(`M ${T} 0 H ${w - T}${torn(w - T, 1, true)} H ${T}${torn(T, -1, false)} Z`);
</script>

<svg
  class="tape {cls}"
  aria-hidden="true"
  width={w}
  height={H}
  viewBox="-2 -2 {w + 4} {H + 4}"
  style="--r:{rotate}deg; {style}"
>
  <defs>
    <clipPath id="tape-{id}"><path d={outline} /></clipPath>
  </defs>
  <path class="fill" d={outline} />
  <g clip-path="url(#tape-{id})">
    <rect class="shade" x="0" y={H - 6} width={w} height="6" />
    <path class="shine" d="M {T + 7} 7 H {Math.max(T + 14, w * 0.45)}" />
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
