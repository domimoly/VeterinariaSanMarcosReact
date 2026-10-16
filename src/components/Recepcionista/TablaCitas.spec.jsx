// Pruebas de la vista de Recepcionista
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import TablaCitas from "./TablaCitas";

const crearCita = (id, estado, fecha = "2099-01-15") => ({
  id,
  codigo: `SM-00000${id}`,
  mascotaNombre: `Mascota${id}`,
  especie: "Perro",
  servicioNombre: "Consulta General",
  duracion: "30 min",
  fecha,
  hora: "10:30",
  estado,
  nota: "",
  tutor: { nombre: "Camila", apellidos: "Rojas Soto", telefono: "+56912345678" },
});

const fila = (nombre) => screen.getByText(new RegExp(nombre)).closest("tr");

describe("TablaCitas", () => {
  it("avisa cuando no hay citas que mostrar", () => {
    render(<TablaCitas citas={[]} onConfirmar={vi.fn()} onReagendar={vi.fn()} />);

    expect(screen.getByText("No hay citas que coincidan con los filtros.")).toBeInTheDocument();
  });

  it("muestra paciente, tutor, servicio y estado de cada cita", () => {
    render(<TablaCitas citas={[crearCita(1, "Pendiente")]} onConfirmar={vi.fn()} onReagendar={vi.fn()} />);

    expect(screen.getByText(/Mascota1 \(Perro\)/)).toBeInTheDocument();
    expect(screen.getByText(/Camila Rojas Soto/)).toBeInTheDocument();
    expect(screen.getByText("Consulta General")).toBeInTheDocument();
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });

  it("ofrece Confirmar solo en las citas pendientes que aún no llegan", () => {
    const citas = [
      crearCita(1, "Pendiente"),
      crearCita(2, "Confirmada"),
      crearCita(3, "Cancelada"),
      crearCita(4, "Pendiente", "2000-01-15"), // ya pasó
    ];
    render(<TablaCitas citas={citas} onConfirmar={vi.fn()} onReagendar={vi.fn()} />);

    expect(within(fila("Mascota1")).getByRole("button", { name: "Confirmar" })).toBeInTheDocument();
    expect(within(fila("Mascota2")).queryByRole("button", { name: "Confirmar" })).not.toBeInTheDocument();
    expect(within(fila("Mascota2")).getByRole("button", { name: "Reagendar" })).toBeInTheDocument();
    expect(within(fila("Mascota3")).queryByRole("button")).not.toBeInTheDocument();
    expect(within(fila("Mascota4")).queryByRole("button")).not.toBeInTheDocument();
  });

  it("avisa qué cita se quiere confirmar o reagendar", async () => {
    const usuario = userEvent.setup();
    const onConfirmar = vi.fn();
    const onReagendar = vi.fn();
    const cita = crearCita(1, "Pendiente");
    render(<TablaCitas citas={[cita]} onConfirmar={onConfirmar} onReagendar={onReagendar} />);

    await usuario.click(screen.getByRole("button", { name: "Confirmar" }));
    await usuario.click(screen.getByRole("button", { name: "Reagendar" }));

    expect(onConfirmar).toHaveBeenCalledWith(1);
    expect(onReagendar).toHaveBeenCalledWith(cita);
  });

  it("muestra la nota que dejó la clínica al reagendar", () => {
    const cita = { ...crearCita(1, "Reagendada"), nota: "Se movió por una cirugía de urgencia." };
    render(<TablaCitas citas={[cita]} onConfirmar={vi.fn()} onReagendar={vi.fn()} />);

    expect(screen.getByText("Se movió por una cirugía de urgencia.")).toBeInTheDocument();
  });
});
