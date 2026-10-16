import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

function MenuRecepcion() {
  return (
    <Nav variant="pills" className="menu-recepcion mb-4" aria-label="Secciones de recepción">
      <Nav.Link as={NavLink} to="/recepcion" end>
        Agenda de citas
      </Nav.Link>
      <Nav.Link as={NavLink} to="/recepcion/fichas">
        Fichas de pacientes
      </Nav.Link>
    </Nav>
  );
}

export default MenuRecepcion;
