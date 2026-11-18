// Pruebas adicionales para la cobertura
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import * as citaService from "../../services/citaService";
import { esperarHoras, instalarCitasEnMemoria } from "../../test/citasEnMemoria";
import PasoFecha from "./PasoFecha";

vi.mock("../../services/citaService");

const crearCita = (duracionMin = 30, duracion = "30 min") => ({
  mascota: { id: 1, nombre: "Max" },
  servicio: { id: "consulta-general", nombre: "Consulta General", duracion, duracionMin },
  fecha: "",
  hora: "",
});

const mostrar = async (props = {}) => {
  render(
    <MemoryRouter>
      <Routes>
        <Route
          path="/"
          element={<PasoFecha cita={crearCita()} citasGuardadas={[]} onContinuar={vi.fn()} onAtras={vi.fn()} {...props} />}
        />
        <Route path="/sesion-requerida" element={<p>Sesión requerida</p>} />
      </Routes>
    </MemoryRouter>
  );
  await esperarHoras();
};

const radiosHabilitados = (nombre) =>
  screen.getAllByRole("radio").filter((radio) => radio.name === nombre && !radio.disabled);

describe("PasoFecha", () => {
  beforeEach(() => {
    instalarCitasEnMemoria(citaService);
    // Reloj fijo: lunes 5 de octubre de 2026, 08:00
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-05T08:00:00"));
  });
  afterEach(() => vi.useRealTimers());

  it("exige elegir un día y una hora", async () => {
    const usuario = userEvent.setup();
    await mostrar();

    await usuario.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByText("Selecciona un día")).toBeInTheDocument();
    expect(screen.getByText("Selecciona una hora")).toBeInTheDocument();
  });

  it("muestra las horas solo después de elegir un día", async () => {
    const usuario = userEvent.setup();
    await mostrar();
    expect(screen.getByText("Elige un día para ver las horas disponibles.")).toBeInTheDocument();

    await usuario.selectOptions(screen.getByLabelText("Semana"), "1");
    await esperarHoras();
    await usuario.click(radiosHabilitados("fecha")[0]);

    expect(radiosHabilitados("hora").length).toBeGreaterThan(0);
  });

  it("entrega la fecha y la hora elegidas", async () => {
    const usuario = userEvent.setup();
    const onContinuar = vi.fn();
    await mostrar({ onContinuar });

    await usuario.selectOptions(screen.getByLabelText("Semana"), "1");
    await esperarHoras();
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
    await mostrar();

    await usuario.selectOptions(screen.getByLabelText("Semana"), "1");
    await esperarHoras();
    await usuario.click(radiosHabilitados("fecha")[0]);
    await usuario.selectOptions(screen.getByLabelText("Semana"), "2");
    await esperarHoras();

    expect(screen.getByText("Elige un día para ver las horas disponibles.")).toBeInTheDocument();
  });

  it("avisa cuántos bloques reserva un servicio largo", async () => {
    await mostrar({ cita: crearCita(90, "90 min") });

    expect(screen.getByText(/reservaremos 3 bloques de 30 minutos/)).toBeInTheDocument();
  });

  it("no ofrece el domingo entre los días porque la clínica está cerrada", async () => {
    await mostrar();

    expect(screen.queryByText("Dom")).not.toBeInTheDocument();
  });

  it("permite volver al paso anterior", async () => {
    const usuario = userEvent.setup();
    const onAtras = vi.fn();
    await mostrar({ onAtras });

    await usuario.click(screen.getByRole("button", { name: "Atrás" }));

    expect(onAtras).toHaveBeenCalled();
  });

  it("pide a ms-citas las horas libres de cada día de la semana para el servicio elegido", async () => {
    await mostrar();

    // Lunes a sábado de la semana del reloj fijo (5 al 10 de octubre)
    expect(citaService.horasLibres).toHaveBeenCalledTimes(6);
    expect(citaService.horasLibres).toHaveBeenCalledWith("2026-10-05", "consulta-general");
    expect(citaService.horasLibres).toHaveBeenCalledWith("2026-10-10", "consulta-general");
  });

  it("tacha las horas que ms-citas no informa como libres y deja sin horas el día completo", async () => {
    citaService.horasLibres.mockImplementation(async (fecha) => (fecha === "2026-10-07" ? [] : ["10:00"]));
    const usuario = userEvent.setup();
    await mostrar();

    const dia = screen.getAllByRole("radio").find((radio) => radio.name === "fecha" && radio.value === "2026-10-07");
    expect(dia).toBeDisabled();
    expect(screen.getByText("Sin horas")).toBeInTheDocument();

    await usuario.click(radiosHabilitados("fecha")[0].closest("label"));
    expect(radiosHabilitados("hora").map((radio) => radio.value)).toEqual(["10:00"]);
  });

  it("avisa si no se pudo consultar la disponibilidad y permite reintentar", async () => {
    citaService.horasLibres.mockRejectedValueOnce(new Error("No se pudo conectar con el servidor."));
    const usuario = userEvent.setup();
    await mostrar();

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo conectar con el servidor.");

    await usuario.click(screen.getByRole("button", { name: "Reintentar" }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(radiosHabilitados("fecha").length).toBeGreaterThan(0);
  });

  it("lleva a iniciar sesión si el token venció mientras se consultaban las horas", async () => {
    citaService.horasLibres.mockRejectedValue(Object.assign(new Error("Tu sesión venció."), { estado: 401 }));
    render(
      <MemoryRouter>
        <Routes>
          <Route
            path="/"
            element={<PasoFecha cita={crearCita()} citasGuardadas={[]} onContinuar={vi.fn()} onAtras={vi.fn()} />}
          />
          <Route path="/sesion-requerida" element={<p>Sesión requerida</p>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Sesión requerida")).toBeInTheDocument();
  });

  it("usa los textos personalizados cuando se reutiliza para reagendar", async () => {
    await mostrar({ titulo: "Elige el nuevo horario", textoContinuar: "Siguiente", textoAtras: "Cancelar" });

    expect(screen.getByRole("heading", { name: "Elige el nuevo horario" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });
});
