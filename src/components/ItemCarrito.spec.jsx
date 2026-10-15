import { render, screen } from "@testing-library/react";
import ItemCarrito from "./ItemCarrito";

describe("ItemCarrito", () => {
  const producto = {
    codigo: "MED-001",
    nombre: "Amoxibay 250mg",
    categoria: "Medicamento",
    precio: 4200,
    stock: 15,
    descripcion: "Antibiótico de amplio espectro.",
    imagen: "/img/amoxibay.jpg",
  };

  it("muestra la categoría y el total según la cantidad", () => {
    render(<ItemCarrito producto={producto} cantidad={3} />);

    expect(screen.getByText("Medicamento")).toBeInTheDocument();
    expect(screen.getByText("$12.600")).toBeInTheDocument(); // 4.200 x 3
  });
});
