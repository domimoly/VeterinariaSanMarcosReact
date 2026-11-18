import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import * as citaService from "../../services/citaService";
import * as mascotaService from "../../services/mascotaService";
import { instalarCitasEnMemoria } from "../../test/citasEnMemoria";
import { instalarMascotasEnMemoria } from "../../test/mascotasEnMemoria";
import MiPerfil from "../Tutor/MiPerfil";
import AgendaCitas from "../Recepcionista/AgendaCitas";

vi.mock("../../services/mascotaService");
vi.mock("../../services/citaService");

describe("Datos guardados dañados", () => {
  beforeEach(() => {
    localStorage.clear();
    instalarMascotasEnMemoria(mascotaService);
    instalarCitasEnMemoria(citaService);
    ["usuarioVeterinariaSanMarcos", "mascotasVeterinariaSanMarcos", "citasVeterinariaSanMarcos"].forEach((clave) =>
      localStorage.setItem(clave, "{esto no es json")
    );
  });

  it("Mi perfil sigue funcionando con datos de demostración", async () => {
    render(
      <MemoryRouter>
        <MiPerfil />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /Mis mascotas/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Cargando tus citas...")).not.toBeInTheDocument());
  });

  it("la agenda de recepción sigue funcionando aunque haya datos dañados en el navegador", async () => {
    render(
      <MemoryRouter>
        <AgendaCitas />
      </MemoryRouter>
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Cargando la agenda...")).not.toBeInTheDocument());
  });
});
