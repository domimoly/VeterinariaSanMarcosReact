import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TarjetaDetalleServicio from "./TarjetaDetalleServicio";

describe("TarjetaDetalleServicio", () => {
  const variante = {
    nombre: "Consulta General",
    subtitulo: "(Perros y Gatos)",
    descripcion: "Evaluación médica integral.",
    caracteristicas: ["Examen físico completo", "Plan de tratamiento"],
    imagenAlt: "Veterinario examinando a un perro",
  };

  it("muestra el nombre, la descripción y cada característica", () => {
    render(<MemoryRouter><TarjetaDetalleServicio variante={variante} /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: /Consulta General/ })).toBeInTheDocument();
    expect(screen.getByText("Evaluación médica integral.")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("lleva a agendar una cita", () => {
    render(<MemoryRouter><TarjetaDetalleServicio variante={variante} /></MemoryRouter>);

    expect(screen.getByRole("link", { name: "Agendar visita" })).toHaveAttribute("href", "/agendar-cita");
  });
});
