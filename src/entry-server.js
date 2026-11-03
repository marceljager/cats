// build-time only: renders the page to plain HTML so crawlers and link previews see the story
// without running JavaScript (see scripts/prerender.js)
import { render } from 'svelte/server';
import App from './App.svelte';

export default () => render(App);
