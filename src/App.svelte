<script>
  import Hero from './lib/Hero.svelte';
  import Journey from './lib/Journey.svelte';
  import Family from './lib/Family.svelte';
  import Cats from './lib/Cats.svelte';
  import Contact from './lib/Contact.svelte';
  import Vet from './lib/Vet.svelte';
  import Gallery from './lib/Gallery.svelte';
  import Lightbox from './lib/Lightbox.svelte';
  import WriteBar from './lib/WriteBar.svelte';
  import { stops } from './content.js';
</script>

<Hero />
<main>
  <Journey {stops} />
  <Family />
  <Cats />
  <Gallery />
  <Vet />
  <Contact />
</main>
<WriteBar />
<Lightbox />
