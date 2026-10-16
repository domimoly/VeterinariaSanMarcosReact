// Pruebas de la vista de Recepcionista
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MenuRecepcion from "./MenuRecepcion";

describe("MenuRecepcion", () => {
  it("marca como activa la sección en la que está el usuario", () => {
    render(
      <MemoryRouter initialEntries={["/recepcion/fichas"]}>
        <MenuRecepcion />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Fichas de pacientes" })).toHaveClass("active");
    expect(screen.getByRole("link", { name: "Agenda de citas" })).not.toHaveClass("active");
  });
});
