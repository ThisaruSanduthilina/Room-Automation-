import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    open: true,
    allowedHosts: ['0c2d8b249c07.ngrok-free.app']
  }
})
