import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Guldkant-Portal/',
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})