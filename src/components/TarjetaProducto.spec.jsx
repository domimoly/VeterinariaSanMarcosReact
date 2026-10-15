import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import TarjetaProducto from "./TarjetaProducto";

describe("TarjetaProducto", () => {
  const producto = {
    codigo: "MED-001",
    nombre: "Amoxibay 250mg",
    categoria: "Medicamento",
    precio: 4200,
    stock: 15,
    descripcion: "Antibiótico de amplio espectro.",
    imagen: "/img/amoxibay.jpg",
  };

  it("muestra el nombre, el precio y el stock que queda", () => {
    render(<TarjetaProducto producto={producto} cantidadEnCarrito={3} onAgregar={vi.fn()} />);

    expect(screen.getByText("Amoxibay 250mg")).toBeInTheDocument();
    expect(screen.getByText("$4.200")).toBeInTheDocument();
    expect(screen.getByText("Stock disponible: 12")).toBeInTheDocument(); // 15 - 3
    expect(screen.getByText("En tu carrito: 3")).toBeInTheDocument();
  });

  it("desactiva el botón cuando todo el stock ya está en el carrito", () => {
    render(<TarjetaProducto producto={producto} cantidadEnCarrito={15} onAgregar={vi.fn()} />);

    expect(screen.getByText("Sin unidades disponibles")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sin más stock" })).toBeDisabled();
  });

  it("llama a onAgregar con el código del producto al presionar Añadir", async () => {
    const usuario = userEvent.setup();
    const onAgregar = vi.fn();
    render(<TarjetaProducto producto={producto} cantidadEnCarrito={0} onAgregar={onAgregar} />);

    await usuario.click(screen.getByRole("button", { name: "Añadir" }));

    expect(onAgregar).toHaveBeenCalledWith("MED-001");
  });
});
