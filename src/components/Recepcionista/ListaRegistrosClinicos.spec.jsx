// Pruebas de la vista de Recepcionista
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ListaRegistrosClinicos from "./ListaRegistrosClinicos";

describe("ListaRegistrosClinicos", () => {
  it("indica cuando no hay registros", () => {
    render(<ListaRegistrosClinicos tipo="vacunas" registros={[]} onEditar={vi.fn()} onEliminar={vi.fn()} />);

    expect(screen.getByText("Sin registros.")).toBeInTheDocument();
  });

  it("muestra el estado de cada próxima dosis (vencida o al día)", () => {
    const registros = [
      { id: 1, nombre: "Antirrábica", fecha: "1999-01-01", proximaDosis: "2000-01-01" },
      { id: 2, nombre: "Séxtuple", fecha: "2098-01-01", proximaDosis: "2099-01-01" },
    ];
    render(<ListaRegistrosClinicos tipo="vacunas" registros={registros} onEditar={vi.fn()} onEliminar={vi.fn()} />);

    expect(screen.getByText("Vencida")).toBeInTheDocument();
    expect(screen.getByText("Al día")).toBeInTheDocument();
  });

  it("muestra diagnóstico, medicamentos y veterinario de una consulta", () => {
    const consulta = {
      id: 1, fecha: "2026-08-12", motivo: "Control anual", diagnostico: "Paciente sano.",
      medicamentos: "Ninguno", veterinario: "Dra. Paula Muñoz",
    };
    render(<ListaRegistrosClinicos tipo="consultas" registros={[consulta]} onEditar={vi.fn()} onEliminar={vi.fn()} />);

    expect(screen.getByText("Control anual")).toBeInTheDocument();
    expect(screen.getByText(/Paciente sano\./)).toBeInTheDocument();
    expect(screen.getByText(/Dra\. Paula Muñoz/)).toBeInTheDocument();
  });

  it("avisa qué registro se quiere editar o eliminar", async () => {
    const usuario = userEvent.setup();
    const onEditar = vi.fn();
    const onEliminar = vi.fn();
    const registro = { id: 7, nombre: "Antirrábica", fecha: "2098-01-01", proximaDosis: "2099-01-01" };
    render(<ListaRegistrosClinicos tipo="desparasitaciones" registros={[registro]} onEditar={onEditar} onEliminar={onEliminar} />);

    await usuario.click(screen.getByRole("button", { name: "Editar" }));
    await usuario.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(onEditar).toHaveBeenCalledWith(registro);
    expect(onEliminar).toHaveBeenCalledWith(7);
  });
});
