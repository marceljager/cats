<script>
  import Hero from './lib/sections/Hero.svelte';
  import Journey from './lib/sections/journey/Journey.svelte';
  import Family from './lib/sections/Family.svelte';
  import Cats from './lib/sections/cats/Cats.svelte';
  import Contact from './lib/sections/contact/Contact.svelte';
  import Vet from './lib/sections/Vet.svelte';
  import Gallery from './lib/sections/Gallery.svelte';
  import Lightbox from './lib/chrome/Lightbox.svelte';
  import WriteBar from './lib/chrome/WriteBar.svelte';
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
