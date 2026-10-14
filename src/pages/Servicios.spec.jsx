import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Servicios from "./Servicios";
import { categoriasServicios } from "../data/servicios";

describe("Servicios", () => {
  const abrir = () => render(<MemoryRouter><Servicios /></MemoryRouter>);

  it("muestra una sección por cada categoría de servicios", () => {
    abrir();

    categoriasServicios.forEach((categoria) =>
      expect(screen.getByRole("heading", { level: 2, name: categoria.titulo })).toBeInTheDocument()
    );
  });

  it("muestra una tarjeta por cada servicio del catálogo", () => {
    abrir();
    const total = categoriasServicios.reduce((suma, categoria) => suma + categoria.items.length, 0);

    expect(screen.getAllByRole("link", { name: /Conoce más/ })).toHaveLength(total);
  });

  it("ofrece agendar solo los servicios que se pueden agendar en línea", () => {
    abrir();
    const agendables = categoriasServicios.flatMap((c) => c.items).filter((s) => s.agendable).length;

    expect(screen.getAllByRole("link", { name: "Agendar cita" })).toHaveLength(agendables);
  });
});
