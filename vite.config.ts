import { defineConfig } from 'vite'
import { fileURLToPath, URL} from 'url'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)), 
      "@enki": fileURLToPath(new URL("./src/editor", import.meta.url)),
    }
  }
})
