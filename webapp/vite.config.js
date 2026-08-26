import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Plain Vite + Svelte SPA (no SvelteKit needed for a handful of demo pages).
// Base is relative so the build can be dropped alongside the existing
// static site (e.g. served from /webapp/dist/) without path rewriting.
export default defineConfig({
  plugins: [svelte()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
