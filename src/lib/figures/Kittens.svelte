<svelte:options namespace="svg" />

<script>
  // Velík and Polly, small bodies with big bobbling heads, sitting side by side;
  // `cold` adds the forest shiver and breath
  import CatHead from './CatHead.svelte';
  let { cold = false, x = 0, y = 0, scale = 1 } = $props();
</script>

<g class="kittens" transform="translate({x} {y}) scale({scale})">
      <ellipse class="cat-shadow" cx="790" cy="858" rx="110" ry="10" />
      <g class:shiver={cold}>
        <!-- Velík: a ginger tabby sitting up, shoulders broad enough to carry his wide face, two
             white front paws -->
        <path class="body ginger" d="M710 856 C704 822 714 794 738 784 C754 778 774 778 790 784 C814 794 824 822 818 856 Z" />
        <path class="fur-shade ginger" d="M794 786 C814 798 822 824 818 856 H802 C806 826 804 804 794 786 Z" />
        <path class="stripes ginger" d="M716 820 C724 818 730 820 734 826 M714 836 C722 834 728 836 732 842 M812 820 C804 818 798 820 794 826 M814 836 C806 834 800 836 796 842" />
        <path class="outline" d="M710 856 C704 822 714 794 738 784 C754 778 774 778 790 784 C814 794 824 822 818 856 Z" />
        <path class="paw" d="M736 857 C736 846 744 842 752 842 C760 842 766 846 766 857 Z" />
        <path class="paw" d="M766 857 C766 846 772 842 780 842 C788 842 794 846 794 857 Z" />
        <CatHead catId="velik" cx={764} cy={774} r={56} mood={cold ? 'cold' : 'happy'} look={cold ? 1 : 0} tilt={cold ? -3 : 6} delay={0} />
      </g>
      <g class:shiver={cold} class="two">
        <!-- Polly: drawn like her brother, smaller: a grey-brown tabby with darker stripes down her
             sides and two light front paws -->
        <path class="body tabby" d="M800 858 C794 826 806 800 830 798 C856 800 866 826 862 858 Z" />
        <path class="fur-shade tabby" d="M846 802 C860 812 866 834 862 858 H850 C854 834 854 816 846 802 Z" />
        <path class="stripes tabby" d="M805 828 C810 826 814 828 817 832 M804 842 C809 840 813 842 816 846 M857 828 C852 826 848 828 845 832 M858 842 C853 840 849 842 846 846" />
        <path class="outline" d="M800 858 C794 826 806 800 830 798 C856 800 866 826 862 858 Z" />
        <path class="paw tabby" d="M812 859 C812 851 817 848 822 848 C827 848 831 851 831 859 Z" />
        <path class="paw tabby" d="M831 859 C831 851 835 848 840 848 C845 848 850 851 850 859 Z" />
        <CatHead catId="polly" cx={836} cy={784} r={46} mood={cold ? 'cold' : 'happy'} look={cold ? 1 : 0} tilt={cold ? 2 : -7} delay={0.9} />
      </g>
{#if cold}
      <g class="breath">
        <!-- Velík breathes out to the left, away from his sister -->
        <circle class="left" cx="722" cy="802" r="5" />
        <circle class="left" cx="710" cy="790" r="7" />
        <circle cx="878" cy="806" r="4" />
        <circle cx="888" cy="794" r="6" />
      </g>
      {/if}
    </g>

<style>
  /* the kittens: ink outlines on everything */
  .kittens path,
  .kittens circle {
    stroke: var(--ink);
    stroke-width: 3;
    vector-effect: non-scaling-stroke;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  .cat-shadow {
    fill: rgba(0, 0, 0, 0.35);
  }
  /* one flat colour per body, sampled from the fur in each head photo: Velík a soft ginger,
     Polly a grey-brown tabby */
  .body.ginger { fill: #c99366; }
  .body.tabby { fill: #ab9a83; }
  /* the shade down each body's right side: the same fur, just darker */
  .fur-shade { stroke: none !important; }
  /* tabby marks down their sides, and their front paws: Velík's white like his chin, Polly's a
     light fawn */
  .kittens .stripes {
    fill: none;
    stroke-width: 3.5;
  }
  .kittens .stripes.ginger { stroke: #96613f; }
  .kittens .stripes.tabby { stroke: #66563f; stroke-width: 3; }
  .paw { fill: #f6ecdc; }
  .paw.tabby { fill: #dccdb6; }
  .fur-shade.ginger { fill: #a8744d; }
  .fur-shade.tabby { fill: #8a7a66; }
  /* the outline again on top, over the shade */
  .outline { fill: none; }
  /* brrr: short shivers every second or so */
  .shiver {
    animation: shiver 1.1s linear infinite;
  }
  .shiver.two {
    animation-delay: 0.35s;
    animation-duration: 0.95s;
  }
  @keyframes shiver {
    0%, 40%, 100% { translate: 0 0; }
    46% { translate: -1.8px 0; }
    52% { translate: 1.8px 0; }
    58% { translate: -1.6px 0; }
    64% { translate: 1.6px 0; }
    70% { translate: -1px 0; }
    76% { translate: 0 0; }
  }
  .breath circle {
    fill: #e7f0fb;
    stroke: none !important;
    opacity: 0;
    animation: breath 3.4s ease-out infinite;
  }
  .breath circle:nth-child(n + 3) {
    animation-delay: 1.7s;
  }
  .breath .left {
    animation-name: breath-left;
  }
  @keyframes breath {
    0% { opacity: 0; translate: 0 0; }
    25% { opacity: 0.8; }
    100% { opacity: 0; translate: 14px -18px; }
  }
  @keyframes breath-left {
    0% { opacity: 0; translate: 0 0; }
    25% { opacity: 0.8; }
    100% { opacity: 0; translate: -14px -18px; }
  }


  @media (prefers-reduced-motion: reduce) {
    .shiver, .breath circle { animation: none; }
    .breath circle { opacity: 0.5; }
  }
</style>
