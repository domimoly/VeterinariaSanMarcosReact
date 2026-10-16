// Pruebas adicionales para la cobertura
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import PasoFecha from "./PasoFecha";

const crearCita = (duracionMin = 30, duracion = "30 min") => ({
  mascota: { id: 1, nombre: "Max" },
  servicio: { nombre: "Consulta General", duracion, duracionMin },
  fecha: "",
  hora: "",
});

const mostrar = (props = {}) =>
  render(<PasoFecha cita={crearCita()} citasGuardadas={[]} onContinuar={vi.fn()} onAtras={vi.fn()} {...props} />);

const radiosHabilitados = (nombre) =>
  screen.getAllByRole("radio").filter((radio) => radio.name === nombre && !radio.disabled);

describe("PasoFecha", () => {
  beforeEach(() => {
    // Reloj fijo: lunes 5 de octubre de 2026, 08:00
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-05T08:00:00"));
  });
  afterEach(() => vi.useRealTimers());

  it("exige elegir un día y una hora", async () => {
    const usuario = userEvent.setup();
    mostrar();

    await usuario.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByText("Selecciona un día")).toBeInTheDocument();
    expect(screen.getByText("Selecciona una hora")).toBeInTheDocument();
  });

  it("muestra las horas solo después de elegir un día", async () => {
    const usuario = userEvent.setup();
    mostrar();
    expect(screen.getByText("Elige un día para ver las horas disponibles.")).toBeInTheDocument();

    await usuario.selectOptions(screen.getByLabelText("Semana"), "1");
    await usuario.click(radiosHabilitados("fecha")[0]);

    expect(radiosHabilitados("hora").length).toBeGreaterThan(0);
  });

  it("entrega la fecha y la hora elegidas", async () => {
    const usuario = userEvent.setup();
    const onContinuar = vi.fn();
    mostrar({ onContinuar });

    await usuario.selectOptions(screen.getByLabelText("Semana"), "1");
    await usuario.click(radiosHabilitados("fecha")[0]);
    await usuario.click(radiosHabilitados("hora")[0]);
    await usuario.click(screen.getByRole("button", { name: "Continuar" }));

    expect(onContinuar).toHaveBeenCalledWith({
      fecha: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      hora: expect.stringMatching(/^\d{2}:\d{2}$/),
    });
  });

  it("limpia el día elegido al cambiar de semana", async () => {
    const usuario = userEvent.setup();
    mostrar();

    await usuario.selectOptions(screen.getByLabelText("Semana"), "1");
    await usuario.click(radiosHabilitados("fecha")[0]);
    await usuario.selectOptions(screen.getByLabelText("Semana"), "2");

    expect(screen.getByText("Elige un día para ver las horas disponibles.")).toBeInTheDocument();
  });

  it("avisa cuántos bloques reserva un servicio largo", () => {
    mostrar({ cita: crearCita(90, "90 min") });

    expect(screen.getByText(/reservaremos 3 bloques de 30 minutos/)).toBeInTheDocument();
  });

  it("no ofrece el domingo entre los días porque la clínica está cerrada", () => {
    mostrar();

    expect(screen.queryByText("Dom")).not.toBeInTheDocument();
  });

  it("permite volver al paso anterior", async () => {
    const usuario = userEvent.setup();
    const onAtras = vi.fn();
    mostrar({ onAtras });

    await usuario.click(screen.getByRole("button", { name: "Atrás" }));

    expect(onAtras).toHaveBeenCalled();
  });
});
