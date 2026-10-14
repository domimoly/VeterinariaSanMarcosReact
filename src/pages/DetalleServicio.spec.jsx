import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DetalleServicio from "./DetalleServicio";
import { detalleServicios } from "../data/detalleServicios";

describe("DetalleServicio", () => {
  it("muestra un mensaje cuando la categoría de la dirección no existe", () => {
    render(
      <MemoryRouter initialEntries={["/servicios/categoria-inexistente"]}>
        <Routes>
          <Route path="/servicios/:categoria" element={<DetalleServicio />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Servicio no encontrado" })).toBeInTheDocument();
  });

  // Prueba adicional para la cobertura (no forma parte de las 10 del plan)
  it("muestra el título y las variantes de una categoría que sí existe", () => {
    render(
      <MemoryRouter initialEntries={["/servicios/consultas"]}>
        <Routes>
          <Route path="/servicios/:categoria" element={<DetalleServicio />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1, name: detalleServicios.consultas.titulo })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Agendar visita" })).toHaveLength(detalleServicios.consultas.variantes.length);
  });
});
