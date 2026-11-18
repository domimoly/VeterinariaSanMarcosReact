import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

// El administrador tiene acceso total: además de sus dos módulos, entra a las vistas de recepción.
function MenuAdmin() {
  return (
    <Nav variant="pills" className="menu-recepcion mb-4" aria-label="Secciones de administración">
      <Nav.Link as={NavLink} to="/admin/usuarios">
        Usuarios
      </Nav.Link>
      <Nav.Link as={NavLink} to="/admin/reportes">
        Reportes
      </Nav.Link>
      <Nav.Link as={NavLink} to="/recepcion" end>
        Agenda de citas
      </Nav.Link>
      <Nav.Link as={NavLink} to="/recepcion/fichas">
        Fichas de pacientes
      </Nav.Link>
    </Nav>
  );
}

export default MenuAdmin;
