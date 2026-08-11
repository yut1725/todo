import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: change "deadline-todo" to your GitHub repo name.
// GitHub Pages serves project sites from https://<user>.github.io/<repo>/
// so Vite needs to know that sub-path at build time.
export default defineConfig({
  plugins: [react()],
  base: '/deadline-todo/',
})
