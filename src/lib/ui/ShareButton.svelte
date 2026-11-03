<script>
  // the little "Sdílet" button in the hero's corner: on a phone it opens the phone's own share
  // sheet; elsewhere it drops a taped paper note with the ways to send us on
  import { onMount, tick } from 'svelte';
  import Button from './Button.svelte';
  import Icon from './Icon.svelte';
  import Text from './Text.svelte';
  import { options, canShare, shareNative, linkCopier } from '../services/share.svelte.js';
  import { site } from '../../content.js';

  let root;
  let menu = $state();
  let open = $state(false);
  let list = $state.raw([]);
  let native = false;
  const link = linkCopier();

  // the button itself opens the phone's share sheet, so the note never lists it
  onMount(() => {
    native = canShare();
    list = options({ native: false });
    return link.stop;
  });

  async function toggle() {
    // a share sheet that fails to open (some desktop browsers) drops the note instead
    if (native && (await shareNative()) !== 'failed') return;
    open = !open;
    if (open) {
      await tick();
      menu?.querySelector('a, button')?.focus();
    }
  }
  function shut(refocus = false) {
    open = false;
    if (refocus) root?.querySelector('.button')?.focus();
  }
  // a click anywhere else or Esc puts the note away
  function closeOnOutsideClick(e) {
    if (open && !root.contains(e.target)) shut();
  }
  function closeOnEscape(e) {
    if (open && e.key === 'Escape') shut(true);
  }
</script>

<svelte:window onclick={closeOnOutsideClick} onkeydown={closeOnEscape} />

<div class="share" bind:this={root}>
  <Button theme="paper" onclick={toggle} aria-expanded={open} aria-controls="share-menu" bounce={{ over: { scale: 1.06, rotate: -2 } }}>
    <Icon name="share" size={24} />
    <span>Sdílet</span>
  </Button>

  {#if open}
    <div class="note" id="share-menu" bind:this={menu}>
      <Text variant="subheading" as="p" class="note-title">{site.share.heading}</Text>
      <Text variant="small" class="note-text">Pošlete nás někomu, kdo by nám mohl dát domov.</Text>
      <ul>
        {#each list as o (o.id)}
          <li>
            {#if o.href}
              <a href={o.href} target={o.id === 'email' ? undefined : '_blank'} rel="noopener" onclick={() => shut()}>
                <Icon name={o.icon} size={26} />{o.long}
              </a>
            {:else}
              <button type="button" onclick={link.copy} class:done={link.copied}>
                <Icon name={link.copied ? 'check' : o.icon} size={26} />{link.copied ? 'Odkaz je zkopírovaný' : link.failed ? 'Odkaz se nepovedlo zkopírovat' : o.long}
              </button>
            {/if}
          </li>
        {/each}
      </ul>
      <span class="sr" role="status">{#if link.copied}Odkaz je zkopírovaný.{:else if link.failed}Odkaz se nepovedlo zkopírovat. Zkopírujte ho prosím z&nbsp;adresního řádku.{/if}</span>
    </div>
  {/if}
</div>

<style>
  .share {
    position: absolute;
    top: max(16px, env(safe-area-inset-top));
    right: max(16px, env(safe-area-inset-right));
    z-index: 5;
  }
  .share :global(.button) {
    min-height: 46px;
    padding: 0 16px 0 12px;
    gap: 8px;
    font-size: 1rem;
  }
  .note {
    position: absolute;
    top: calc(100% + 14px);
    right: 0;
    width: min(300px, calc(100vw - 32px));
    padding: 18px 16px 12px;
    color: var(--ink);
    background: var(--paper);
    border: 3px solid var(--ink);
    border-radius: 8px;
    box-shadow:
      inset -4px -5px 0 var(--paper-shade),
      0 16px 22px -12px rgba(0, 0, 0, 0.55);
    transform-origin: 85% 0;
    rotate: 1.5deg;
    animation: drop 0.32s var(--ease-back);
    font-family: var(--f-marker);
  }
  .note :global(.note-title) {
    margin: 0 0 4px;
  }
  .note :global(.note-text) {
    margin: 0 0 10px;
    color: var(--ink-soft);
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
  }
  li + li {
    border-top: 2px dashed rgba(22, 19, 17, 0.25);
  }
  a,
  button {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 48px;
    padding: 6px 6px;
    margin: 0;
    border: 0;
    border-radius: 6px;
    background: none;
    font: inherit;
    font-size: 1rem;
    color: inherit;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.15s ease, translate 0.2s var(--ease-out);
  }
  a:hover,
  button:hover {
    background: #f3ecd8;
    translate: 3px 0;
  }
  a:focus-visible,
  button:focus-visible {
    outline: 3px solid var(--route);
    outline-offset: 0;
  }
  .done {
    color: #2f7a33;
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  @keyframes drop {
    from { opacity: 0; translate: 0 -8px; rotate: -3deg; }
  }
  @media (prefers-reduced-motion: reduce) {
    .note { animation: none; }
  }
</style>
