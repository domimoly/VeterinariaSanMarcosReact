// Pruebas de la vista de Recepcionista
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import FiltrosCitas from "./FiltrosCitas";

describe("FiltrosCitas", () => {
  it("ofrece todos los estados de una cita", () => {
    render(<FiltrosCitas filtros={{ estado: "", fecha: "" }} onCambiar={vi.fn()} onLimpiar={vi.fn()} />);

    ["Todos", "Pendiente", "Confirmada", "Reagendada", "Cancelada"].forEach((estado) =>
      expect(screen.getByRole("option", { name: estado })).toBeInTheDocument()
    );
  });

  it("avisa cuando se elige un estado", async () => {
    const usuario = userEvent.setup();
    const onCambiar = vi.fn();
    render(<FiltrosCitas filtros={{ estado: "", fecha: "" }} onCambiar={onCambiar} onLimpiar={vi.fn()} />);

    await usuario.selectOptions(screen.getByLabelText("Estado"), "Confirmada");

    expect(onCambiar).toHaveBeenCalled();
  });

  it("permite limpiar los filtros", async () => {
    const usuario = userEvent.setup();
    const onLimpiar = vi.fn();
    render(<FiltrosCitas filtros={{ estado: "Pendiente", fecha: "" }} onCambiar={vi.fn()} onLimpiar={onLimpiar} />);

    await usuario.click(screen.getByRole("button", { name: "Limpiar filtros" }));

    expect(onLimpiar).toHaveBeenCalled();
  });

  it("evita que el formulario recargue la página al presionar Enter", () => {
    render(<FiltrosCitas filtros={{ estado: "", fecha: "" }} onCambiar={vi.fn()} onLimpiar={vi.fn()} />);
    const formulario = screen.getByLabelText("Fecha").closest("form");

    // fireEvent devuelve false cuando el evento fue cancelado con preventDefault
    expect(fireEvent.submit(formulario)).toBe(false);
  });
});
