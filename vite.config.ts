import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/ENAT-Frontend-/' : '/',
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true,
  },
}))