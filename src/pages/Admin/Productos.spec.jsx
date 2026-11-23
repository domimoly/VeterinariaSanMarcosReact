import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import * as productoService from "../../services/productoService";
import { instalarProductosEnMemoria, productosDemo } from "../../test/productosEnMemoria";
import { guardarSesion } from "../../utils/sesion";
import Productos from "./Productos";

vi.mock("../../services/productoService", async (importarOriginal) => ({
  ...(await importarOriginal()),
  listarProductos: vi.fn(),
  crearProducto: vi.fn(),
  actualizarProducto: vi.fn(),
  eliminarProducto: vi.fn(),
}));

let memoria;
const abrir = async () => {
  render(
    <MemoryRouter initialEntries={["/admin/productos"]}>
      <Routes>
        <Route path="/admin/productos" element={<Productos />} />
        <Route path="/sesion-requerida" element={<p>Sesión requerida</p>} />
      </Routes>
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.queryByText("Cargando productos...")).not.toBeInTheDocument());
};
const fila = (texto) => screen.getByText(texto).closest("tr");

describe("Productos (administración)", () => {
  beforeEach(() => {
    sessionStorage.clear();
    guardarSesion({ token: "t", nombre: "Administrador San Marcos", correo: "admin@veterinariasanmarcos.cl", rol: "ADMINISTRADOR" });
    memoria = instalarProductosEnMemoria(productoService, [
      ...productosDemo.slice(0, 3),
      { ...productosDemo[12] }, // Apoquel: stock 5 (poco stock)
      { ...productosDemo[3], activo: false }, // Nexgard oculto
    ]);
  });
  afterEach(() => vi.restoreAllMocks());

  it("pide al servicio también los productos ocultos y los muestra con su estado", async () => {
    await abrir();

    expect(productoService.listarProductos).toHaveBeenCalledWith({ incluirInactivos: true });
    expect(within(fila("Amoxibay 250mg")).getByText("Visible")).toBeInTheDocument();
    expect(within(fila("Nexgard")).getByText("Oculto")).toBeInTheDocument();
  });

  it("resume el total, los visibles y los de poco stock", async () => {
    await abrir();
    const resumen = screen.getByRole("region", { name: "Resumen de productos" });

    expect(within(resumen).getByText("Total de productos").nextSibling).toHaveTextContent("5");
    expect(within(resumen).getByText("Visibles en la tienda").nextSibling).toHaveTextContent("4");
    expect(within(resumen).getByText(/Con poco stock/).nextSibling).toHaveTextContent("1");
  });

  it("filtra por texto y por categoría", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.type(screen.getByLabelText("Buscar productos"), "enrox");
    expect(screen.getByText("Enrox 50mg")).toBeInTheDocument();
    expect(screen.queryByText("Amoxibay 250mg")).not.toBeInTheDocument();

    await usuario.clear(screen.getByLabelText("Buscar productos"));
    await usuario.selectOptions(screen.getByLabelText("Filtrar por categoría"), "Antiparasitario");
    expect(screen.getByText("Nexgard")).toBeInTheDocument();
    expect(screen.queryByText("Enrox 50mg")).not.toBeInTheDocument();
  });

  it("avisa cuando ningún producto coincide", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.type(screen.getByLabelText("Buscar productos"), "zzzz");

    expect(screen.getByText("No se encontraron productos")).toBeInTheDocument();
  });

  it("crea un producto desde el formulario", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.click(screen.getByRole("button", { name: "Nuevo producto" }));
    await usuario.type(screen.getByLabelText("Código"), "ACC-003");
    await usuario.type(screen.getByLabelText("Nombre"), "Collar antipulgas");
    await usuario.selectOptions(screen.getByLabelText("Categoría"), "Accesorio");
    await usuario.type(screen.getByLabelText("Precio (CLP)"), "7500");
    await usuario.type(screen.getByLabelText("Stock"), "9");
    await usuario.click(screen.getByRole("button", { name: "Crear producto" }));

    expect(await screen.findByText("Collar antipulgas")).toBeInTheDocument();
    expect(memoria.productos().some((p) => p.codigo === "ACC-003")).toBe(true);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("edita el precio y el stock de un producto", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.click(screen.getByRole("button", { name: "Editar Amoxibay 250mg" }));
    await usuario.clear(screen.getByLabelText("Precio (CLP)"));
    await usuario.type(screen.getByLabelText("Precio (CLP)"), "4500");
    await usuario.clear(screen.getByLabelText("Stock"));
    await usuario.type(screen.getByLabelText("Stock"), "3");
    await usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => expect(within(fila("Amoxibay 250mg")).getByText("$4.500")).toBeInTheDocument());
    expect(within(fila("Amoxibay 250mg")).getByText("3")).toHaveClass("text-danger");
    expect(productoService.actualizarProducto).toHaveBeenCalledWith(1, expect.objectContaining({ precio: 4500, stock: 3 }));
  });

  it("oculta y vuelve a mostrar un producto en la tienda", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.click(screen.getByRole("button", { name: "Ocultar Amoxibay 250mg" }));
    await waitFor(() => expect(within(fila("Amoxibay 250mg")).getByText("Oculto")).toBeInTheDocument());

    await usuario.click(screen.getByRole("button", { name: "Mostrar Amoxibay 250mg" }));
    await waitFor(() => expect(within(fila("Amoxibay 250mg")).getByText("Visible")).toBeInTheDocument());
  });

  it("elimina un producto solo si se confirma", async () => {
    const usuario = userEvent.setup();
    const confirmar = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    await abrir();

    await usuario.click(screen.getByRole("button", { name: "Eliminar Enrox 50mg" }));
    expect(productoService.eliminarProducto).not.toHaveBeenCalled();

    await usuario.click(screen.getByRole("button", { name: "Eliminar Enrox 50mg" }));

    await waitFor(() => expect(screen.queryByText("Enrox 50mg")).not.toBeInTheDocument());
    expect(confirmar).toHaveBeenCalledTimes(2);
    expect(productoService.eliminarProducto).toHaveBeenCalledWith(2);
  });

  it("muestra el error del servidor dentro del formulario y lo deja abierto", async () => {
    const usuario = userEvent.setup();
    productoService.crearProducto.mockRejectedValueOnce(new Error("Ya existe un producto con el código ACC-003"));
    await abrir();

    await usuario.click(screen.getByRole("button", { name: "Nuevo producto" }));
    await usuario.type(screen.getByLabelText("Código"), "ACC-003");
    await usuario.type(screen.getByLabelText("Nombre"), "Collar antipulgas");
    await usuario.type(screen.getByLabelText("Precio (CLP)"), "7500");
    await usuario.type(screen.getByLabelText("Stock"), "9");
    await usuario.click(screen.getByRole("button", { name: "Crear producto" }));

    expect(await screen.findByText("Ya existe un producto con el código ACC-003")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear producto" })).toBeInTheDocument();
  });

  it("explica el error de carga y permite reintentar", async () => {
    const usuario = userEvent.setup();
    productoService.listarProductos.mockRejectedValueOnce(new Error("No se pudo conectar con el servidor"));
    await abrir();
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo conectar con el servidor");

    await usuario.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("Amoxibay 250mg")).toBeInTheDocument();
  });

  it("lleva a la página de sesión requerida si el token venció", async () => {
    productoService.listarProductos.mockRejectedValueOnce(Object.assign(new Error("Sesión vencida"), { estado: 401 }));
    render(
      <MemoryRouter initialEntries={["/admin/productos"]}>
        <Routes>
          <Route path="/admin/productos" element={<Productos />} />
          <Route path="/sesion-requerida" element={<p>Sesión requerida</p>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Sesión requerida")).toBeInTheDocument();
  });
});
