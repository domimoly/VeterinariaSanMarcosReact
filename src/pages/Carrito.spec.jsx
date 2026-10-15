import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Carrito from "./Carrito";

describe("Carrito", () => {
  beforeEach(() => localStorage.clear());

  it("actualiza el total al aumentar la cantidad de un producto", async () => {
    const usuario = userEvent.setup();
    localStorage.setItem("carritoVeterinariaSanMarcos", JSON.stringify([{ codigo: "MED-001", cantidad: 1 }]));

    render(
      <MemoryRouter>
        <Carrito />
      </MemoryRouter>
    );
    expect(screen.getByText("Total:").textContent).toContain("$4.200");

    await usuario.click(screen.getByRole("button", { name: "Agregar una unidad de Amoxibay 250mg" }));

    expect(screen.getByText("Total:").textContent).toContain("$8.400");
  });

  it("ignora un producto guardado que ya no existe y muestra el carrito vacío", () => {
    localStorage.setItem("carritoVeterinariaSanMarcos", JSON.stringify([{ codigo: "NO-EXISTE", cantidad: 2 }]));

    render(
      <MemoryRouter>
        <Carrito />
      </MemoryRouter>
    );

    expect(screen.getByText("Tu carrito está vacío.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar compra" })).toBeDisabled();
  });
});
