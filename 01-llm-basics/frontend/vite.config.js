import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Backend (src/server.js) runs on :4000. The proxy forwards API calls there,
// so the browser only talks to :5173 and we avoid CORS issues.
const BACKEND = 'http://localhost:4000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/chat': BACKEND,
      '/info': BACKEND,
    },
  },
})
