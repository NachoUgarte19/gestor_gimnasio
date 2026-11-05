import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vite transforma JSX y sirve la aplicacion durante el desarrollo.
export default defineConfig({
  // El plugin habilita el trabajo con componentes React y la actualizacion en desarrollo.
  plugins: [react()],
  server: {
    // Preparado para la futura API. El front actual utiliza datos locales y no depende de este proxy.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
