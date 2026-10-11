// src/components/TarjetaBlog.spec.jsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TarjetaBlog from "./TarjetaBlog";

describe("TarjetaBlog", () => {
  const publicacion = {
    slug: "01",
    titulo: "¿Cuántas vacunas debe ponerse un cachorro?",
    extracto: "Calendario de vacunación del primer año.",
    autor: "Dra. Paula Muñoz",
    fecha: "12 Mayo 2026",
    imagenAlt: "Cachorro recibiendo su vacuna",
  };

  it("muestra el título y el autor recibidos por props", () => {
    render(
      <MemoryRouter>
        <TarjetaBlog publicacion={publicacion} />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: publicacion.titulo })).toBeInTheDocument();
    expect(screen.getByText("Dra. Paula Muñoz")).toBeInTheDocument();
  });
});
