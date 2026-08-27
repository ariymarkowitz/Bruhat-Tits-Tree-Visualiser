import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: "./",
  test: {
    // A helper that uses runes has to live in a .svelte.ts file, and so does its test.
    include: ['src/**/*.test.ts', 'src/**/*.test.svelte.ts'],
  },
})
