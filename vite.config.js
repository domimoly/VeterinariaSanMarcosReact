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
      // Alcance: solo los archivos propios (Inicio, Servicios, Agendar cita, Contacto, Blog y Mi perfil)
      include: [
        'src/utils/**/*.js',
        'src/pages/{Inicio,Servicios,DetalleServicio,AgendarCita,Contacto,Blog,DetalleBlog,MiPerfil}.jsx',
        'src/components/{TarjetaServicio,TarjetaDetalleServicio,TarjetaBlog,FormularioContacto}.jsx',
        'src/components/{EncabezadoPerfil,FormularioPerfil,TarjetaMascota,FormularioMascota}.jsx',
        'src/components/{HistorialMascota,TablaControles,TarjetaConsulta}.jsx',
        'src/components/{PasosCita,ResumenCita,FilaResumen,PasoMascota,PasoFecha,PasoTutor,PasoConfirmacion}.jsx',
        'src/components/{CitaSolicitada,TarjetaCita,ListaCitas}.jsx',
      ],
    },
  },
})
