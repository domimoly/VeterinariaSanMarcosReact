import { render, screen, within } from "@testing-library/react";
import LineasPedido from "./LineasPedido";

describe("LineasPedido", () => {
  it("muestra el nombre, precio, cantidad y subtotal de cada producto", () => {
    render(
      <LineasPedido
        lineas={[
          { codigo: "MED-001", nombre: "Amoxibay 250mg", precioUnitario: 4200, cantidad: 3, subtotal: 12600 },
          { codigo: "ANT-001", nombre: "Nexgard", precioUnitario: 9500, cantidad: 1, subtotal: 9500 },
        ]}
      />
    );

    const fila = screen.getByText("Amoxibay 250mg").closest("tr");
    expect(within(fila).getByText("$4.200")).toBeInTheDocument();
    expect(within(fila).getByText("3")).toBeInTheDocument();
    expect(within(fila).getByText("$12.600")).toBeInTheDocument();
    expect(screen.getByText("Nexgard")).toBeInTheDocument();
  });
});
