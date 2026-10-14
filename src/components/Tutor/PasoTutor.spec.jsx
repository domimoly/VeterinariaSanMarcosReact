// Pruebas adicionales para la cobertura
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import PasoTutor from "./PasoTutor";
import { usuarioDemo } from "../../data/Tutor/usuario";

const mostrar = (props = {}) =>
  render(
    <MemoryRouter>
      <PasoTutor usuario={usuarioDemo} cita={{ tutor: null }} onContinuar={vi.fn()} onAtras={vi.fn()} {...props} />
    </MemoryRouter>
  );

describe("PasoTutor", () => {
  it("precarga el teléfono y el correo desde el perfil", () => {
    mostrar();

    expect(screen.getByDisplayValue(usuarioDemo.correo)).toBeInTheDocument();
    expect(screen.getByDisplayValue(usuarioDemo.telefono)).toBeInTheDocument();
  });

  it("exige el teléfono, que en el perfil es opcional", async () => {
    const usuario = userEvent.setup();
    mostrar();

    await usuario.clear(screen.getByLabelText("Teléfono"));
    await usuario.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByText("El teléfono es obligatorio")).toBeInTheDocument();
  });

  it("rechaza un correo sin @", async () => {
    const usuario = userEvent.setup();
    mostrar();

    await usuario.clear(screen.getByLabelText("Correo"));
    await usuario.type(screen.getByLabelText("Correo"), "camila.correo.cl");
    await usuario.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByText("El correo debe contener @")).toBeInTheDocument();
  });

  it("entrega los datos del tutor con el medio de recordatorio elegido", async () => {
    const usuario = userEvent.setup();
    const onContinuar = vi.fn();
    mostrar({ onContinuar });

    await usuario.click(screen.getByLabelText("Por teléfono (llamada o mensaje)"));
    await usuario.click(screen.getByRole("button", { name: "Continuar" }));

    expect(onContinuar).toHaveBeenCalledWith(
      expect.objectContaining({ run: usuarioDemo.run, medioRecordatorio: "Teléfono" })
    );
  });

  it("permite volver al paso anterior", async () => {
    const usuario = userEvent.setup();
    const onAtras = vi.fn();
    mostrar({ onAtras });

    await usuario.click(screen.getByRole("button", { name: "Atrás" }));

    expect(onAtras).toHaveBeenCalled();
  });
});
