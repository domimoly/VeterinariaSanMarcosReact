// Pruebas adicionales para la cobertura
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import PasoConfirmacion from "./PasoConfirmacion";

const cita = {
  mascota: { id: 1, nombre: "Max", especie: "Perro" },
  servicio: { id: "consulta-general", nombre: "Consulta General", duracion: "30 min", duracionMin: 30, precio: "$15.000" },
  fecha: "2026-10-12",
  hora: "10:30",
  observaciones: "Come poco",
  tutor: {
    run: "12345678K", nombre: "Camila", apellidos: "Rojas Soto",
    telefono: "+56912345678", correo: "camila@correo.cl", medioRecordatorio: "Correo",
  },
};

const mostrar = (props = {}) =>
  render(
    <PasoConfirmacion
      cita={cita}
      citasGuardadas={[]}
      onConfirmar={vi.fn()}
      onAtras={vi.fn()}
      onCambiarHora={vi.fn()}
      {...props}
    />
  );

describe("PasoConfirmacion", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-05T08:00:00"));
  });
  afterEach(() => vi.useRealTimers());

  it("resume la solicitud, incluidos los antecedentes y el medio de recordatorio", () => {
    mostrar();

    expect(screen.getByText("Max (Perro)")).toBeInTheDocument();
    expect(screen.getByText("Come poco")).toBeInTheDocument();
    expect(screen.getByText("Por correo")).toBeInTheDocument();
  });

  it("exige confirmar que los datos son correctos antes de enviar", async () => {
    const usuario = userEvent.setup();
    const onConfirmar = vi.fn();
    mostrar({ onConfirmar });

    await usuario.click(screen.getByRole("button", { name: "Solicitar cita" }));

    expect(screen.getByText("Debes confirmar que los datos son correctos")).toBeInTheDocument();
    expect(onConfirmar).not.toHaveBeenCalled();
  });

  it("envía la solicitud en estado Pendiente con un código", async () => {
    const usuario = userEvent.setup();
    const onConfirmar = vi.fn();
    mostrar({ onConfirmar });

    await usuario.click(screen.getByLabelText(/Confirmo que los datos/));
    await usuario.click(screen.getByRole("button", { name: "Solicitar cita" }));

    expect(onConfirmar).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: "Pendiente",
        mascotaNombre: "Max",
        servicioNombre: "Consulta General",
        codigo: expect.stringMatching(/^SM-\d{6}$/),
      })
    );
  });

  it("no envía y ofrece elegir otra hora si la mascota ya tiene una cita ese día", async () => {
    const usuario = userEvent.setup();
    const onConfirmar = vi.fn();
    const onCambiarHora = vi.fn();
    const existente = { mascotaId: 1, fecha: "2026-10-12", hora: "15:00", duracionMin: 30, estado: "Pendiente" };
    mostrar({ onConfirmar, onCambiarHora, citasGuardadas: [existente] });

    await usuario.click(screen.getByLabelText(/Confirmo que los datos/));
    await usuario.click(screen.getByRole("button", { name: "Solicitar cita" }));

    expect(screen.getByText("No pudimos reservar tu hora.")).toBeInTheDocument();
    expect(onConfirmar).not.toHaveBeenCalled();

    await usuario.click(screen.getByRole("button", { name: "Elegir otra hora" }));
    expect(onCambiarHora).toHaveBeenCalled();
  });

  it("permite volver al paso anterior", async () => {
    const usuario = userEvent.setup();
    const onAtras = vi.fn();
    mostrar({ onAtras });

    await usuario.click(screen.getByRole("button", { name: "Atrás" }));

    expect(onAtras).toHaveBeenCalled();
  });
});
