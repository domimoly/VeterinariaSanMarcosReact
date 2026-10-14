// Pruebas adicionales para la cobertura
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import ListaCitas from "./ListaCitas";

const crearCita = (id, estado) => ({
  id,
  codigo: `SM-00000${id}`,
  servicioNombre: "Consulta General",
  mascotaNombre: "Max",
  especie: "Perro",
  fecha: "2099-01-15",
  hora: "10:30",
  precio: "$15.000",
  estado,
  nota: "",
});

describe("ListaCitas", () => {
  it("invita a agendar cuando no hay citas", () => {
    render(<MemoryRouter><ListaCitas citas={[]} onCancelar={vi.fn()} /></MemoryRouter>);

    expect(screen.getByText("Aún no has solicitado citas.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Agendar cita" })).toHaveAttribute("href", "/agendar-cita");
  });

  it("separa las citas próximas del historial", () => {
    const citas = [crearCita(1, "Pendiente"), crearCita(2, "Cancelada")];
    render(<MemoryRouter><ListaCitas citas={citas} onCancelar={vi.fn()} /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: "Próximas citas" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Historial" })).toBeInTheDocument();
    expect(screen.getByText("Código SM-000001")).toBeInTheDocument();
    expect(screen.getByText("Código SM-000002")).toBeInTheDocument();
  });

  it("avisa cuando no hay citas próximas", () => {
    render(<MemoryRouter><ListaCitas citas={[crearCita(1, "Cancelada")]} onCancelar={vi.fn()} /></MemoryRouter>);

    expect(screen.getByText("No tienes citas próximas.")).toBeInTheDocument();
  });
});
