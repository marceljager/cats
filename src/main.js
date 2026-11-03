import { hydrate, mount } from 'svelte';
import './fonts.css';
import './app.css';
import App from './App.svelte';

// the built index.html already holds the prerendered page; in dev it is empty
const target = document.getElementById('app');

export default target.firstChild ? hydrate(App, { target }) : mount(App, { target });
