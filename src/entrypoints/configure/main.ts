import { mount } from 'svelte';
import Root from './Root.svelte';
import './app.css';
import RouterApp from '$lib/RouterApp.svelte';
import { registerRoute } from '$lib/router';

registerRoute("#/", Root);

const app = mount(RouterApp, {
  target: document.getElementById('app')!,
});

export default app;
