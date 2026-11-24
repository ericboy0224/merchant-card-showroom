import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// Library build for the Embed. It writes dist/momo-card.js and keeps the files of the app build.
export default defineConfig({
  plugins: [
    react(),
    {
      // The element copies the card styles into its shadow root with `?inline`. The extracted
      // CSS file is a second copy that no page loads, so the build does not write it.
      name: 'drop-extracted-css',
      enforce: 'post',
      generateBundle(_, bundle) {
        for (const name of Object.keys(bundle)) if (name.endsWith('.css')) delete bundle[name]
      },
    },
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // A library build does not replace this. React reads it, and a browser has no `process`.
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    emptyOutDir: false,
    lib: { entry: 'src/embed/index.ts', formats: ['es'], fileName: () => 'momo-card.js' },
  },
})
