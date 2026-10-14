// Pruebas adicionales para la cobertura
import { render, screen } from "@testing-library/react";
import FilaResumen from "./FilaResumen";

describe("FilaResumen", () => {
  it("muestra el valor cuando existe", () => {
    render(<dl><FilaResumen titulo="Mascota" valor="Max (Perro)" /></dl>);

    expect(screen.getByText("Max (Perro)")).toBeInTheDocument();
  });

  it("muestra 'Pendiente' cuando todavía no hay valor", () => {
    render(<dl><FilaResumen titulo="Mascota" valor="" /></dl>);

    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });
});
