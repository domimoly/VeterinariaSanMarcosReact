import { Navigate, Outlet, useLocation } from "react-router-dom";
import { obtenerUsuarioSesion } from "../utils/sesion";

// Protege un grupo de rutas: sin sesión lleva al login; con un rol que no corresponde,
// a la página de acceso denegado. El backend vuelve a validar el rol en cada petición.
function RutaProtegida({ roles }) {
  const ubicacion = useLocation();
  const usuario = obtenerUsuarioSesion();

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }
  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/acceso-denegado" replace />;
  }
  return <Outlet />;
}

export default RutaProtegida;
