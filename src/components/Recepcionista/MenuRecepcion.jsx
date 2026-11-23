import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import MenuAdmin from "../Admin/MenuAdmin";
import { obtenerUsuarioSesion, ROLES } from "../../utils/sesion";

// El administrador entra a las mismas vistas, pero con su menú completo para poder volver a sus módulos
function MenuRecepcion() {
  if (obtenerUsuarioSesion()?.rol === ROLES.administrador) return <MenuAdmin />;

  return (
    <Nav variant="pills" className="menu-recepcion mb-4" aria-label="Secciones de recepción">
      <Nav.Link as={NavLink} to="/recepcion" end>
        Agenda de citas
      </Nav.Link>
      <Nav.Link as={NavLink} to="/recepcion/fichas">
        Fichas de pacientes
      </Nav.Link>
      <Nav.Link as={NavLink} to="/recepcion/pedidos">
        Pedidos
      </Nav.Link>
    </Nav>
  );
}

export default MenuRecepcion;
