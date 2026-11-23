import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import * as productoService from "../services/productoService";
import { instalarProductosEnMemoria, productosDemo } from "../test/productosEnMemoria";
import Tienda from "./Tienda";

vi.mock("../services/productoService", async (importarOriginal) => ({
  ...(await importarOriginal()),
  listarProductos: vi.fn(),
  crearProducto: vi.fn(),
  actualizarProducto: vi.fn(),
  eliminarProducto: vi.fn(),
}));

const abrir = async () => {
  render(
    <MemoryRouter>
      <Tienda />
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.queryByText("Cargando productos...")).not.toBeInTheDocument());
};

describe("Tienda", () => {
  beforeEach(() => {
    localStorage.clear();
    instalarProductosEnMemoria(productoService);
  });

  it("muestra una tarjeta por producto que entrega ms-productos", async () => {
    await abrir();

    expect(screen.getAllByRole("button", { name: "Añadir" })).toHaveLength(productosDemo.length);
    expect(screen.getByText("Amoxibay 250mg")).toBeInTheDocument();
  });

  it("solo muestra los productos activos", async () => {
    instalarProductosEnMemoria(productoService, [
      { ...productosDemo[0] },
      { ...productosDemo[1], activo: false },
    ]);
    await abrir();

    expect(screen.getByText("Amoxibay 250mg")).toBeInTheDocument();
    expect(screen.queryByText("Enrox 50mg")).not.toBeInTheDocument();
  });

  it("avisa que el producto se añadió, marca la cantidad y ofrece ir al carrito", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.click(screen.getAllByRole("button", { name: "Añadir" })[0]);

    expect(screen.getByText("En tu carrito: 1")).toBeInTheDocument();
    expect(screen.getByText(/se añadió al carrito/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver carrito (1)" })).toHaveAttribute("href", "/carrito");
    expect(JSON.parse(localStorage.getItem("carritoVeterinariaSanMarcos"))).toEqual([
      { codigo: "MED-001", cantidad: 1 },
    ]);
  });

  it("no deja añadir más unidades que el stock", async () => {
    const usuario = userEvent.setup();
    instalarProductosEnMemoria(productoService, [{ ...productosDemo[0], stock: 2 }]);
    await abrir();

    await usuario.click(screen.getByRole("button", { name: "Añadir" }));
    await usuario.click(screen.getByRole("button", { name: "Añadir" }));

    expect(screen.getByRole("button", { name: "Sin más stock" })).toBeDisabled();
    expect(JSON.parse(localStorage.getItem("carritoVeterinariaSanMarcos"))[0].cantidad).toBe(2);
  });

  it("explica el error y permite reintentar cuando la API no responde", async () => {
    const usuario = userEvent.setup();
    productoService.listarProductos.mockRejectedValueOnce(new Error("No se pudo conectar con el servidor"));
    await abrir();

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo conectar con el servidor");

    await usuario.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("Amoxibay 250mg")).toBeInTheDocument();
  });

  it("avisa cuando no hay productos", async () => {
    instalarProductosEnMemoria(productoService, []);
    await abrir();

    expect(screen.getByText("Por ahora no hay productos disponibles.")).toBeInTheDocument();
  });
});
