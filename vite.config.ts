import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/rtt-card.ts',
      formats: ['es'],
      fileName: () => 'rtt-card.js',
    },
    target: 'es2022',
    sourcemap: true,
  },
});
