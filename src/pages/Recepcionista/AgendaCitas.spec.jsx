// Pruebas de la vista de Recepcionista
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import * as citaService from "../../services/citaService";
import { esperarHoras, instalarCitasEnMemoria } from "../../test/citasEnMemoria";
import AgendaCitas from "./AgendaCitas";

vi.mock("../../services/citaService");

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

// "Guardar" deja las citas en el ms-citas simulado; "leer" devuelve lo que quedó guardado ahí
let memoria;
const guardar = (citas) => {
  memoria = instalarCitasEnMemoria(citaService, citas);
};
const leer = () => memoria.citas();
const abrir = async () => {
  render(
    <MemoryRouter initialEntries={["/recepcion"]}>
      <Routes>
        <Route path="/recepcion" element={<AgendaCitas />} />
        <Route path="/sesion-requerida" element={<p>Sesión requerida</p>} />
      </Routes>
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.queryByText("Cargando la agenda...")).not.toBeInTheDocument());
};
const fila = (nombre) => screen.getByText(new RegExp(nombre)).closest("tr");

describe("AgendaCitas", () => {
  beforeEach(() => guardar([]));

  it("cuenta las citas pendientes que quedan por revisar", async () => {
    guardar([crearCita(1, "Pendiente", "2099-01-10"), crearCita(2, "Pendiente", "2099-01-11"), crearCita(3, "Confirmada", "2099-01-12")]);
    await abrir();

    expect(screen.getByText("2 citas pendientes por revisar.")).toBeInTheDocument();
  });

  it("avisa cuando no hay pendientes", async () => {
    guardar([crearCita(1, "Confirmada", "2099-01-10")]);
    await abrir();

    expect(screen.getByText("No hay citas pendientes por revisar.")).toBeInTheDocument();
  });

  it("confirma una cita pendiente en ms-citas y actualiza el estado", async () => {
    const usuario = userEvent.setup();
    guardar([crearCita(1, "Pendiente", "2099-01-10")]);
    await abrir();

    await usuario.click(within(fila("Mascota1")).getByRole("button", { name: "Confirmar" }));

    expect(await within(fila("Mascota1")).findByText("Confirmada")).toBeInTheDocument();
    expect(citaService.confirmarCita).toHaveBeenCalledWith(1);
    expect(leer()[0].estado).toBe("Confirmada");
    expect(screen.getByText("No hay citas pendientes por revisar.")).toBeInTheDocument();
  });

  it("filtra las citas por estado", async () => {
    const usuario = userEvent.setup();
    guardar([crearCita(1, "Pendiente", "2099-01-10"), crearCita(2, "Confirmada", "2099-01-11")]);
    await abrir();

    await usuario.selectOptions(screen.getByLabelText("Estado"), "Confirmada");

    expect(screen.getByText(/Mascota2/)).toBeInTheDocument();
    expect(screen.queryByText(/Mascota1/)).not.toBeInTheDocument();
  });

  it("filtra las citas por fecha y permite limpiar los filtros", async () => {
    const usuario = userEvent.setup();
    guardar([crearCita(1, "Pendiente", "2099-01-10"), crearCita(2, "Pendiente", "2099-01-11")]);
    await abrir();

    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2099-01-11" } });
    expect(screen.queryByText(/Mascota1/)).not.toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(screen.getByText(/Mascota1/)).toBeInTheDocument();
  });

  it("muestra primero las citas que vienen y después el historial", async () => {
    guardar([crearCita(1, "Confirmada", "2000-01-10"), crearCita(2, "Pendiente", "2099-01-10")]);
    await abrir();

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

    it("mueve la cita en ms-citas a otro horario, la marca como Reagendada y deja el motivo para el tutor", async () => {
      const usuario = userEvent.setup();
      guardar([crearCita(1, "Pendiente", "2026-10-14")]);
      await abrir();

      await usuario.click(within(fila("Mascota1")).getByRole("button", { name: "Reagendar" }));
      await esperarHoras();
      await usuario.selectOptions(screen.getByLabelText("Semana"), "1");
      await esperarHoras();
      const dia = screen.getAllByRole("radio").filter((r) => r.name === "fecha" && !r.disabled && r.value !== "2026-10-14")[0];
      await usuario.click(dia.closest("label"));
      await usuario.click(screen.getAllByRole("radio").filter((r) => r.name === "hora" && !r.disabled)[0].closest("label"));
      await usuario.click(screen.getByRole("button", { name: "Siguiente" }));
      await usuario.type(screen.getByLabelText(/Motivo del cambio/), "El horario pedido ya estaba ocupado");
      await usuario.click(screen.getByRole("button", { name: "Reagendar cita" }));

      await waitFor(() => expect(screen.queryByRole("heading", { name: /Reagendar cita/ })).not.toBeInTheDocument());
      const guardada = leer()[0];
      expect(citaService.reagendarCita).toHaveBeenCalledWith(1, {
        fecha: dia.value,
        hora: expect.stringMatching(/^\d{2}:\d{2}$/),
        nota: "El horario pedido ya estaba ocupado",
      });
      expect(guardada.estado).toBe("Reagendada");
      expect(guardada.nota).toBe("El horario pedido ya estaba ocupado");
      expect(guardada.fecha).toBe(dia.value);
      expect(screen.getByText("El horario pedido ya estaba ocupado")).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: /Reagendar cita/ })).not.toBeInTheDocument();
    });

    it("no cambia la cita si se cancela el reagendamiento", async () => {
      const usuario = userEvent.setup();
      guardar([crearCita(1, "Pendiente", "2026-10-14")]);
      await abrir();

      await usuario.click(within(fila("Mascota1")).getByRole("button", { name: "Reagendar" }));
      await esperarHoras();
      await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(leer()[0].estado).toBe("Pendiente");
      expect(screen.queryByRole("heading", { name: /Reagendar cita/ })).not.toBeInTheDocument();
    });
  });

  describe("errores del servicio de citas", () => {
    it("muestra el error de carga de la agenda y permite reintentar", async () => {
      const usuario = userEvent.setup();
      guardar([crearCita(1, "Pendiente", "2099-01-10")]);
      citaService.listarCitas.mockRejectedValueOnce(new Error("No se pudo conectar con el servidor."));
      await abrir();

      expect(screen.getByText(/No se pudo conectar con el servidor/)).toBeInTheDocument();

      await usuario.click(screen.getByRole("button", { name: "Reintentar" }));
      expect(await screen.findByText(/Mascota1/)).toBeInTheDocument();
    });

    it("si falla al confirmar, muestra el motivo y la cita sigue pendiente", async () => {
      const usuario = userEvent.setup();
      guardar([crearCita(1, "Pendiente", "2099-01-10")]);
      citaService.confirmarCita.mockRejectedValueOnce(new Error("No se puede confirmar una cita cancelada"));
      await abrir();

      await usuario.click(within(fila("Mascota1")).getByRole("button", { name: "Confirmar" }));

      expect(await screen.findByText("No se puede confirmar una cita cancelada")).toBeInTheDocument();
      expect(within(fila("Mascota1")).getByText("Pendiente")).toBeInTheDocument();
    });

    it("si ms-citas rechaza el reagendamiento, deja abierto el formulario con el motivo", async () => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date("2026-10-05T08:00:00"));
      const usuario = userEvent.setup();
      guardar([crearCita(1, "Pendiente", "2026-10-14")]);
      citaService.reagendarCita.mockRejectedValueOnce(new Error("No quedan cupos a las 09:00"));
      await abrir();

      await usuario.click(within(fila("Mascota1")).getByRole("button", { name: "Reagendar" }));
      await esperarHoras();
      await usuario.selectOptions(screen.getByLabelText("Semana"), "1");
      await esperarHoras();
      await usuario.click(screen.getAllByRole("radio").filter((r) => r.name === "fecha" && !r.disabled)[0].closest("label"));
      await usuario.click(screen.getAllByRole("radio").filter((r) => r.name === "hora" && !r.disabled)[0].closest("label"));
      await usuario.click(screen.getByRole("button", { name: "Siguiente" }));
      await usuario.type(screen.getByLabelText(/Motivo del cambio/), "El médico no estará ese día");
      await usuario.click(screen.getByRole("button", { name: "Reagendar cita" }));

      expect(await screen.findByText("No quedan cupos a las 09:00")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /Reagendar cita/ })).toBeInTheDocument();
      expect(leer()[0].estado).toBe("Pendiente");
      vi.useRealTimers();
    });

    it("si la sesión venció, lleva a la página de sesión requerida", async () => {
      guardar([]);
      citaService.listarCitas.mockRejectedValueOnce(Object.assign(new Error("Tu sesión venció"), { estado: 401 }));
      await abrir();

      expect(await screen.findByText("Sesión requerida")).toBeInTheDocument();
    });
  });
});
