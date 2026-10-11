import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DetalleServicio from "./DetalleServicio";

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
});
