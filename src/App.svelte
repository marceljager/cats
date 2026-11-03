<script>
  import Hero from './lib/sections/Hero.svelte';
  import Journey from './lib/sections/Journey.svelte';
  import Family from './lib/sections/Family.svelte';
  import Cats from './lib/sections/Cats.svelte';
  import Contact from './lib/sections/Contact.svelte';
  import Vet from './lib/sections/Vet.svelte';
  import Gallery from './lib/sections/Gallery.svelte';
  import Lightbox from './lib/ui/Lightbox.svelte';
  import WriteBar from './lib/ui/WriteBar.svelte';
</script>

<Hero />
<main>
  <Journey />
  <Family />
  <Cats />
  <Gallery />
  <Vet />
  <Contact />
</main>
<WriteBar />
<Lightbox />
