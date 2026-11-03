// review page: every hand-drawn piece of the map, the forest and the living room, one by one (not part of the site)
import { mount } from 'svelte';
import '../fonts.css';
import '../app.css';
import Drawings from './Drawings.svelte';

export default mount(Drawings, { target: document.getElementById('app') });
