import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const path = (relative) => fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
  root: path('../../'),
  cacheDir: path('../../node_modules/.vite-reference'),
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      '@/registry/base-nova/ui': path('./upstream'),
      '@/app/(create)/components/icon-placeholder': path('./icon-placeholder.tsx'),
    },
  },
  esbuild: { jsx: 'automatic' },
});
