import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // base path = repo name (so GitHub Pages serves assets correctly)
  base: '/miami-dade-intel/',
  build: {
    outDir: path.resolve(__dirname, '../docs'),
    emptyOutDir: false,
  },
});
