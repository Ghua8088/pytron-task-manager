import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Important for relative paths in built assets
  build: {
    outDir: '../build/frontend', // Output to a folder that Python can serve or Pywebview can load
    emptyOutDir: true,
  }
})
