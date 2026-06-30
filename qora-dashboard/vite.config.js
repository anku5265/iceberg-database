import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_API_URL || 'http://localhost:8000'

  return {
    plugins: [react()],
    css: {
      postcss: {
        plugins: [tailwindcss()],
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: backendUrl,
          rewrite: path => path.replace(/^\/api/, ''),
          changeOrigin: true,
        },
      },
    },
  }
})
