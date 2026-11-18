import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MenuAdmin from "./MenuAdmin";

describe("MenuAdmin", () => {
  it("ofrece los módulos de administración y las vistas de recepción", () => {
    render(
      <MemoryRouter initialEntries={["/admin/reportes"]}>
        <MenuAdmin />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Usuarios" })).toHaveAttribute("href", "/admin/usuarios");
    expect(screen.getByRole("link", { name: "Reportes" })).toHaveClass("active");
    expect(screen.getByRole("link", { name: "Agenda de citas" })).toHaveAttribute("href", "/recepcion");
    expect(screen.getByRole("link", { name: "Fichas de pacientes" })).toHaveAttribute("href", "/recepcion/fichas");
  });
});
