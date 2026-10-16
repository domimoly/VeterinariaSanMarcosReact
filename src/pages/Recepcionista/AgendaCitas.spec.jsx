// Pruebas de la vista de Recepcionista
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import AgendaCitas from "./AgendaCitas";

const crearCita = (id, estado, fecha, mascotaId = id) => ({
  id,
  codigo: `SM-00000${id}`,
  mascotaId,
  mascotaNombre: `Mascota${id}`,
  especie: "Perro",
  servicioNombre: "Consulta General",
  duracion: "30 min",
  duracionMin: 30,
  fecha,
  hora: "10:30",
  estado,
  nota: "",
  tutor: { nombre: "Camila", apellidos: "Rojas Soto", telefono: "+56912345678" },
});

const guardar = (citas) => localStorage.setItem("citasVeterinariaSanMarcos", JSON.stringify(citas));
const leer = () => JSON.parse(localStorage.getItem("citasVeterinariaSanMarcos"));
const abrir = () => render(<MemoryRouter initialEntries={["/recepcion"]}><AgendaCitas /></MemoryRouter>);
const fila = (nombre) => screen.getByText(new RegExp(nombre)).closest("tr");

describe("AgendaCitas", () => {
  beforeEach(() => localStorage.clear());

  it("cuenta las citas pendientes que quedan por revisar", () => {
    guardar([crearCita(1, "Pendiente", "2099-01-10"), crearCita(2, "Pendiente", "2099-01-11"), crearCita(3, "Confirmada", "2099-01-12")]);
    abrir();

    expect(screen.getByText("2 citas pendientes por revisar.")).toBeInTheDocument();
  });

  it("avisa cuando no hay pendientes", () => {
    guardar([crearCita(1, "Confirmada", "2099-01-10")]);
    abrir();

    expect(screen.getByText("No hay citas pendientes por revisar.")).toBeInTheDocument();
  });

  it("confirma una cita pendiente y guarda el nuevo estado", async () => {
    const usuario = userEvent.setup();
    guardar([crearCita(1, "Pendiente", "2099-01-10")]);
    abrir();

    await usuario.click(within(fila("Mascota1")).getByRole("button", { name: "Confirmar" }));

    expect(within(fila("Mascota1")).getByText("Confirmada")).toBeInTheDocument();
    expect(leer()[0].estado).toBe("Confirmada");
    expect(screen.getByText("No hay citas pendientes por revisar.")).toBeInTheDocument();
  });

  it("filtra las citas por estado", async () => {
    const usuario = userEvent.setup();
    guardar([crearCita(1, "Pendiente", "2099-01-10"), crearCita(2, "Confirmada", "2099-01-11")]);
    abrir();

    await usuario.selectOptions(screen.getByLabelText("Estado"), "Confirmada");

    expect(screen.getByText(/Mascota2/)).toBeInTheDocument();
    expect(screen.queryByText(/Mascota1/)).not.toBeInTheDocument();
  });

  it("filtra las citas por fecha y permite limpiar los filtros", async () => {
    const usuario = userEvent.setup();
    guardar([crearCita(1, "Pendiente", "2099-01-10"), crearCita(2, "Pendiente", "2099-01-11")]);
    abrir();

    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2099-01-11" } });
    expect(screen.queryByText(/Mascota1/)).not.toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(screen.getByText(/Mascota1/)).toBeInTheDocument();
  });

  it("muestra primero las citas que vienen y después el historial", () => {
    guardar([crearCita(1, "Confirmada", "2000-01-10"), crearCita(2, "Pendiente", "2099-01-10")]);
    abrir();

    const filas = screen.getAllByRole("row").slice(1); // sin el encabezado
    expect(within(filas[0]).getByText(/Mascota2/)).toBeInTheDocument();
    expect(within(filas[1]).getByText(/Mascota1/)).toBeInTheDocument();
  });

  describe("reagendar", () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date("2026-10-05T08:00:00"));
    });
    afterEach(() => vi.useRealTimers());

    it("mueve la cita a otro horario, la marca como Reagendada y deja el motivo para el tutor", async () => {
      const usuario = userEvent.setup();
      guardar([crearCita(1, "Pendiente", "2026-10-14")]);
      abrir();

      await usuario.click(within(fila("Mascota1")).getByRole("button", { name: "Reagendar" }));
      await usuario.selectOptions(screen.getByLabelText("Semana"), "1");
      const dia = screen.getAllByRole("radio").filter((r) => r.name === "fecha" && !r.disabled && r.value !== "2026-10-14")[0];
      await usuario.click(dia.closest("label"));
      await usuario.click(screen.getAllByRole("radio").filter((r) => r.name === "hora" && !r.disabled)[0].closest("label"));
      await usuario.click(screen.getByRole("button", { name: "Siguiente" }));
      await usuario.type(screen.getByLabelText(/Motivo del cambio/), "El horario pedido ya estaba ocupado");
      await usuario.click(screen.getByRole("button", { name: "Reagendar cita" }));

      const guardada = leer()[0];
      expect(guardada.estado).toBe("Reagendada");
      expect(guardada.nota).toBe("El horario pedido ya estaba ocupado");
      expect(guardada.fecha).toBe(dia.value);
      expect(screen.getByText("El horario pedido ya estaba ocupado")).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: /Reagendar cita/ })).not.toBeInTheDocument();
    });

    it("no cambia la cita si se cancela el reagendamiento", async () => {
      const usuario = userEvent.setup();
      guardar([crearCita(1, "Pendiente", "2026-10-14")]);
      abrir();

      await usuario.click(within(fila("Mascota1")).getByRole("button", { name: "Reagendar" }));
      await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(leer()[0].estado).toBe("Pendiente");
      expect(screen.queryByRole("heading", { name: /Reagendar cita/ })).not.toBeInTheDocument();
    });
  });
});
