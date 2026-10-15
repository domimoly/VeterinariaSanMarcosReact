// src/pages/Carrito.spec.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Carrito from "./Carrito";

async function completarFormulario(usuario) {
  await usuario.type(screen.getByLabelText("Nombre*"), "Pedro");
  await usuario.type(screen.getByLabelText("Apellidos*"), "Soto");
  await usuario.type(screen.getByLabelText("Correo*"), "pedro@correo.cl");
  await usuario.type(screen.getByLabelText("Calle*"), "Los Crisantemos 123");
  await usuario.selectOptions(screen.getByLabelText("Región*"), "rm");
  await usuario.selectOptions(screen.getByLabelText("Comuna*"), "Santiago");
  await usuario.click(screen.getByRole("button", { name: /Pagar ahora/ }));
}

const mostrar = () =>
  render(
    <MemoryRouter>
      <Carrito />
    </MemoryRouter>
  );

describe("Carrito", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("carritoVeterinariaSanMarcos", JSON.stringify([{ codigo: "MED-001", cantidad: 3 }]));
  });

  it("ignora un producto guardado que ya no existe y muestra el carrito vacío", () => {
    localStorage.setItem("carritoVeterinariaSanMarcos", JSON.stringify([{ codigo: "NO-EXISTE", cantidad: 2 }]));
    mostrar();

    expect(screen.getByText("Tu carrito está vacío.")).toBeInTheDocument();
  });

  it("paga, muestra la compra realizada y vacía el carrito cuando el banco aprueba", async () => {
    const usuario = userEvent.setup();
    const espia = vi.spyOn(Math, "random").mockReturnValue(0.1);
    mostrar();
    expect(screen.getByText("Total a pagar: $12.600")).toBeInTheDocument();

    await completarFormulario(usuario);

    expect(screen.getByRole("heading", { name: /Se ha realizado la compra/ })).toBeInTheDocument();
    expect(screen.getByText("Total pagado: $12.600")).toBeInTheDocument();
    expect(localStorage.getItem("carritoVeterinariaSanMarcos")).toBe("[]");
    espia.mockRestore();
  });

  it("muestra el pago rechazado y conserva los datos y el carrito al reintentar", async () => {
    const usuario = userEvent.setup();
    const espia = vi.spyOn(Math, "random").mockReturnValue(0.9);
    mostrar();

    await completarFormulario(usuario);
    expect(screen.getByRole("heading", { name: /No se pudo realizar el pago/ })).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Volver a realizar el pago" }));

    expect(screen.getByLabelText("Nombre*")).toHaveValue("Pedro");
    expect(screen.getByText("Total a pagar: $12.600")).toBeInTheDocument();
    espia.mockRestore();
  });
});
