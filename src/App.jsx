import { Route, Routes } from "react-router-dom";
import Cabecera from "./components/Cabecera";
import Navegacion from "./components/Navegacion";
import PiePagina from "./components/PiePagina";
import Inicio from "./pages/Inicio";
import Servicios from "./pages/Servicios";
import DetalleServicio from "./pages/DetalleServicio";
import Contacto from "./pages/Contacto";
import Blog from "./pages/Blog";
import DetalleBlog from "./pages/DetalleBlog";
import MiPerfil from "./pages/Tutor/MiPerfil";
import AgendarCita from "./pages/Tutor/AgendarCita";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import RutaProtegida from "./components/RutaProtegida";
import { ROLES } from "./utils/sesion";
import Usuarios from "./pages/Admin/Usuarios";
import Nosotros from "./pages/Nosotros";
import Tienda from "./pages/Tienda";
import Carrito from "./pages/Carrito";
import NoEncontrada from "./pages/NoEncontrada";
import SinSesion from "./pages/Errores/SinSesion";
import SinPermiso from "./pages/Errores/SinPermiso";
import ErrorServidor from "./pages/Errores/ErrorServidor";
import LimiteError from "./components/Errores/LimiteError";
import AgendaCitas from "./pages/Recepcionista/AgendaCitas";
import FichasPacientes from "./pages/Recepcionista/FichasPacientes";

function App() {
  return (
    <>
      <Cabecera />
      <Navegacion />

      <LimiteError>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/servicios/:categoria" element={<DetalleServicio />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<DetalleBlog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          <Route element={<RutaProtegida roles={[ROLES.tutor]} />}>
            <Route path="/mi-perfil" element={<MiPerfil />} />
            <Route path="/agendar-cita" element={<AgendarCita />} />
          </Route>

          <Route element={<RutaProtegida roles={[ROLES.recepcionista]} />}>
            <Route path="/recepcion" element={<AgendaCitas />} />
            <Route path="/recepcion/fichas" element={<FichasPacientes />} />
          </Route>

          <Route element={<RutaProtegida roles={[ROLES.administrador]} />}>
            <Route path="/admin/usuarios" element={<Usuarios />} />
          </Route>
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/sesion-requerida" element={<SinSesion />} />
          <Route path="/acceso-denegado" element={<SinPermiso />} />
          <Route path="/error" element={<ErrorServidor />} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </LimiteError>

      <PiePagina />
    </>
  );
}

export default App;
