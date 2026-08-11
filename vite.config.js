import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://yut1725.github.io/todo/
export default defineConfig({
  plugins: [react()],
  base: '/todo/',
})
