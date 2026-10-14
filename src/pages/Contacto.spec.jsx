import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import Contacto from "./Contacto";

describe("Contacto", () => {
  beforeEach(() => localStorage.clear());

  it("guarda el último mensaje en localStorage al enviar el formulario", async () => {
    const usuario = userEvent.setup();
    // Espía: registra las llamadas a setItem sin cambiar su comportamiento
    const espia = vi.spyOn(Storage.prototype, "setItem");

    render(<Contacto />);
    await usuario.type(screen.getByLabelText("Nombre"), "Camila");
    await usuario.type(screen.getByLabelText("Apellido"), "Rojas");
    await usuario.type(screen.getByLabelText("Correo"), "camila@correo.cl");
    await usuario.type(screen.getByLabelText("Comentario"), "Quisiera consultar por una vacuna.");
    await usuario.click(screen.getByRole("button", { name: "Enviar" }));

    expect(espia).toHaveBeenCalledWith(
      "ultimoContactoVeterinariaSanMarcos",
      expect.stringContaining("camila@correo.cl")
    );

    espia.mockRestore();
  });
});
