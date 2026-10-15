import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Alcance: las vistas del tutor (carpetas Tutor) y mis vistas públicas (Inicio, Servicios, Contacto y Blog)
      include: [
        'src/utils/**/*.js',
        'src/pages/Tutor/**/*.jsx',
        'src/components/Tutor/**/*.jsx',
        'src/pages/{Inicio,Servicios,DetalleServicio,Contacto,Blog,DetalleBlog}.jsx',
        'src/components/{TarjetaServicio,TarjetaDetalleServicio,TarjetaBlog,FormularioContacto}.jsx',
      ],
    },
  },
})
