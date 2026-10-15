// src/components/CompraFallida.spec.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import CompraFallida from "./CompraFallida";

describe("CompraFallida", () => {
  const compra = {
    numero: "12345678",
    datos: {
      nombre: "Pedro",
      apellidos: "Soto",
      correo: "pedro@correo.cl",
      calle: "Los Crisantemos 123",
      departamento: "",
      region: "rm",
      comuna: "Santiago",
      indicaciones: "",
    },
    lineas: [
      {
        producto: { codigo: "MED-001", nombre: "Amoxibay 250mg", precio: 4200, imagen: "/img/amoxibay.jpg" },
        cantidad: 3,
      },
    ],
    total: 12600,
  };

  it("muestra el aviso, el total y permite volver a intentar el pago", async () => {
    const usuario = userEvent.setup();
    const onReintentar = vi.fn();
    render(<CompraFallida compra={compra} onReintentar={onReintentar} />);

    expect(screen.getByRole("heading", { name: /No se pudo realizar el pago/ })).toBeInTheDocument();
    expect(screen.getByText("Total a pagar: $12.600")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Volver a realizar el pago" }));

    expect(onReintentar).toHaveBeenCalledTimes(1);
  });
});
