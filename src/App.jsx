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
import MiPerfil from "./pages/MiPerfil";

function App() {
  return (
    <>
      <Cabecera />
      <Navegacion />

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/servicios/:categoria" element={<DetalleServicio />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<DetalleBlog />} />
        <Route path="/mi-perfil" element={<MiPerfil />} />
      </Routes>

      <PiePagina />
    </>
  );
}

export default App;