// Pruebas de la vista de Recepcionista
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { guardarSesion } from "../../utils/sesion";
import MenuRecepcion from "./MenuRecepcion";

describe("MenuRecepcion", () => {
  beforeEach(() => sessionStorage.clear());

  it("marca como activa la sección en la que está el usuario", () => {
    render(
      <MemoryRouter initialEntries={["/recepcion/fichas"]}>
        <MenuRecepcion />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Fichas de pacientes" })).toHaveClass("active");
    expect(screen.getByRole("link", { name: "Agenda de citas" })).not.toHaveClass("active");
  });

  it("al administrador le muestra su menú completo para poder volver a Usuarios y Reportes", () => {
    guardarSesion({ token: "t", nombre: "Admin", correo: "admin@correo.cl", rol: "ADMINISTRADOR" });
    render(
      <MemoryRouter initialEntries={["/recepcion"]}>
        <MenuRecepcion />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Usuarios" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reportes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Agenda de citas" })).toHaveClass("active");
  });
});
