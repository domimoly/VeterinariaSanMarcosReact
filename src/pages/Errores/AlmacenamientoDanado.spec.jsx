import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MiPerfil from "../Tutor/MiPerfil";
import AgendaCitas from "../Recepcionista/AgendaCitas";

describe("Datos guardados dañados", () => {
  beforeEach(() => {
    localStorage.clear();
    ["usuarioVeterinariaSanMarcos", "mascotasVeterinariaSanMarcos", "citasVeterinariaSanMarcos"].forEach((clave) =>
      localStorage.setItem(clave, "{esto no es json")
    );
  });

  it("Mi perfil sigue funcionando con datos de demostración", () => {
    render(
      <MemoryRouter>
        <MiPerfil />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /Mis mascotas/i })).toBeInTheDocument();
  });

  it("la agenda de recepción sigue funcionando con datos de demostración", () => {
    render(
      <MemoryRouter>
        <AgendaCitas />
      </MemoryRouter>
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
