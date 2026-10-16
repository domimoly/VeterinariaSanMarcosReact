// Pruebas de la vista de Recepcionista
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ReagendarCita from "./ReagendarCita";

const cita = {
  id: 1,
  codigo: "SM-000001",
  mascotaId: 1,
  mascotaNombre: "Max",
  servicioNombre: "Consulta General",
  duracion: "30 min",
  duracionMin: 30,
  fecha: "2026-10-12",
  hora: "09:30",
  estado: "Pendiente",
};

// Los días y las horas son radios ocultos por CSS: el usuario hace clic en su etiqueta
const primeroHabilitado = (nombre) =>
  screen.getAllByRole("radio").filter((radio) => radio.name === nombre && !radio.disabled)[0].closest("label");

const mostrar = (props = {}) =>
  render(<ReagendarCita cita={cita} citasGuardadas={[cita]} onGuardar={vi.fn()} onCancelar={vi.fn()} {...props} />);

const elegirHorario = async (usuario) => {
  await usuario.selectOptions(screen.getByLabelText("Semana"), "1");
  await usuario.click(primeroHabilitado("fecha"));
  await usuario.click(primeroHabilitado("hora"));
  await usuario.click(screen.getByRole("button", { name: "Siguiente" }));
};

describe("ReagendarCita", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-05T08:00:00"));
  });
  afterEach(() => vi.useRealTimers());

  it("empieza pidiendo el nuevo horario de la cita indicada", () => {
    mostrar();

    expect(screen.getByRole("heading", { name: "Reagendar cita SM-000001" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Elige el nuevo horario" })).toBeInTheDocument();
  });

  it("no avanza sin elegir un día y una hora", async () => {
    const usuario = userEvent.setup();
    mostrar();

    await usuario.click(screen.getByRole("button", { name: "Siguiente" }));

    expect(screen.getByText("Selecciona un día")).toBeInTheDocument();
  });

  it("exige explicar el motivo del cambio", async () => {
    const usuario = userEvent.setup();
    const onGuardar = vi.fn();
    mostrar({ onGuardar });

    await elegirHorario(usuario);
    await usuario.click(screen.getByRole("button", { name: "Reagendar cita" }));

    expect(screen.getByText("Explica el motivo del cambio")).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it("rechaza un motivo demasiado corto", async () => {
    const usuario = userEvent.setup();
    mostrar();

    await elegirHorario(usuario);
    await usuario.type(screen.getByLabelText(/Motivo del cambio/), "No");
    await usuario.click(screen.getByRole("button", { name: "Reagendar cita" }));

    expect(screen.getByText("Escribe al menos 5 caracteres")).toBeInTheDocument();
  });

  it("entrega el nuevo horario y el motivo cuando todo es válido", async () => {
    const usuario = userEvent.setup();
    const onGuardar = vi.fn();
    mostrar({ onGuardar });

    await elegirHorario(usuario);
    await usuario.type(screen.getByLabelText(/Motivo del cambio/), "El médico no estará ese día");
    await usuario.click(screen.getByRole("button", { name: "Reagendar cita" }));

    expect(onGuardar).toHaveBeenCalledWith({
      fecha: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      hora: expect.stringMatching(/^\d{2}:\d{2}$/),
      nota: "El médico no estará ese día",
    });
  });

  it("permite volver a elegir el horario desde el paso del motivo", async () => {
    const usuario = userEvent.setup();
    mostrar();

    await elegirHorario(usuario);
    await usuario.click(screen.getByRole("button", { name: "Volver" }));

    expect(screen.getByRole("heading", { name: "Elige el nuevo horario" })).toBeInTheDocument();
  });

  it("permite mover la cita dentro de su propio día, porque no se bloquea a sí misma", async () => {
    const usuario = userEvent.setup();
    mostrar();

    await usuario.selectOptions(screen.getByLabelText("Semana"), "1");
    const mismoDia = screen.getAllByRole("radio").find((radio) => radio.name === "fecha" && radio.value === cita.fecha);
    await usuario.click(mismoDia.closest("label"));
    await usuario.click(primeroHabilitado("hora"));
    await usuario.click(screen.getByRole("button", { name: "Siguiente" }));

    expect(screen.getByText(/Nuevo horario:/)).toBeInTheDocument();
  });

  it("avisa cuando se cancela", async () => {
    const usuario = userEvent.setup();
    const onCancelar = vi.fn();
    mostrar({ onCancelar });

    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancelar).toHaveBeenCalled();
  });
});
