// review page: every button, icon and building block of the site in one place (not part of the site)
import { mount } from 'svelte';
import '../fonts.css';
import '../app.css';
import Kit from './Kit.svelte';

export default mount(Kit, { target: document.getElementById('app') });
