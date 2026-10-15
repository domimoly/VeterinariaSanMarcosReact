import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Tienda from "./Tienda";
import { productos } from "../data/productos";

describe("Tienda", () => {
  beforeEach(() => localStorage.clear());

  it("muestra una tarjeta por producto y marca el producto añadido", async () => {
    const usuario = userEvent.setup();
    render(<Tienda />);
    expect(screen.getAllByRole("button", { name: "Añadir" })).toHaveLength(productos.length);

    await usuario.click(screen.getAllByRole("button", { name: "Añadir" })[0]);

    expect(screen.getByText("En tu carrito: 1")).toBeInTheDocument();
  });
});
