import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    UnoCSS(),
    react()
  ],
 server: {
    allowedHosts: ['9f52efc7918b.ngrok-free.app'], // Replace with your actual host
    host: true, // or '0.0.0.0' to listen on all interfaces
    port: 5173, // optional: specify your desired port
  }

})
