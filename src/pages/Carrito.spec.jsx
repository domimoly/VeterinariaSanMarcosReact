// src/pages/Carrito.spec.jsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import * as pedidoService from "../services/pedidoService";
import * as perfilService from "../services/perfilService";
import * as productoService from "../services/productoService";
import { instalarPedidosEnMemoria } from "../test/pedidosEnMemoria";
import { usuarioDemo } from "../test/perfilDemo";
import { instalarPerfilEnMemoria } from "../test/perfilEnMemoria";
import { instalarProductosEnMemoria } from "../test/productosEnMemoria";
import { guardarSesion } from "../utils/sesion";
import Carrito from "./Carrito";

vi.mock("../services/productoService", async (importarOriginal) => ({
  ...(await importarOriginal()),
  listarProductos: vi.fn(),
  crearProducto: vi.fn(),
  actualizarProducto: vi.fn(),
  eliminarProducto: vi.fn(),
}));
vi.mock("../services/pedidoService", async (importarOriginal) => ({
  ...(await importarOriginal()),
  crearPedido: vi.fn(),
  listarPedidos: vi.fn(),
  entregarPedido: vi.fn(),
  cancelarPedido: vi.fn(),
}));

vi.mock("../services/perfilService");

// Perfil de la cuenta con la que se inicia sesión (sin dirección, para que cada prueba la complete)
const perfilSinDireccion = {
  ...usuarioDemo,
  nombre: "Camila",
  apellidos: "Rojas Díaz",
  correo: "camila@example.cl",
  region: "",
  comuna: "",
  direccion: "",
};

const CLAVE = "carritoVeterinariaSanMarcos";
const guardado = () => JSON.parse(localStorage.getItem(CLAVE));

async function completarFormulario(usuario) {
  await usuario.selectOptions(screen.getByLabelText("Región*"), "rm");
  await usuario.selectOptions(screen.getByLabelText("Comuna*"), "Santiago");
  await usuario.type(screen.getByLabelText("Calle*"), "Los Crisantemos 123");
  await usuario.click(screen.getByRole("button", { name: /Pagar ahora/ }));
}

const abrir = async () => {
  render(
    <MemoryRouter initialEntries={["/carrito"]}>
      <Routes>
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/sesion-requerida" element={<p>Sesión requerida</p>} />
      </Routes>
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.queryByText("Cargando carrito...")).not.toBeInTheDocument());
  await waitFor(() => expect(screen.queryByText("Cargando tus datos...")).not.toBeInTheDocument());
};

describe("Carrito", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(CLAVE, JSON.stringify([{ codigo: "MED-001", cantidad: 3 }]));
    instalarProductosEnMemoria(productoService);
    instalarPedidosEnMemoria(pedidoService, []);
    instalarPerfilEnMemoria(perfilService, perfilSinDireccion);
    guardarSesion({ token: "t", nombre: "Camila Rojas Díaz", correo: "camila@example.cl", rol: "TUTOR" });
  });
  afterEach(() => vi.restoreAllMocks());

  it("muestra el carrito vacío cuando no hay productos", async () => {
    localStorage.setItem(CLAVE, "[]");
    await abrir();

    expect(screen.getByText("Tu carrito está vacío.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir a la tienda" })).toHaveAttribute("href", "/tienda");
  });

  it("ignora y quita del carrito un producto que ya no existe", async () => {
    localStorage.setItem(CLAVE, JSON.stringify([{ codigo: "NO-EXISTE", cantidad: 2 }]));
    await abrir();

    expect(screen.getByText("Tu carrito está vacío.")).toBeInTheDocument();
    expect(guardado()).toEqual([]);
  });

  it("baja la cantidad al stock disponible", async () => {
    localStorage.setItem(CLAVE, JSON.stringify([{ codigo: "MED-009", cantidad: 9 }])); // Vetmedin: stock 4
    await abrir();

    expect(screen.getByText("Total a pagar: $112.000")).toBeInTheDocument();
    expect(guardado()).toEqual([{ codigo: "MED-009", cantidad: 4 }]);
  });

  it("calcula el total con los precios que entrega la API y permite cambiar las cantidades", async () => {
    const usuario = userEvent.setup();
    await abrir();
    expect(screen.getByText("Total a pagar: $12.600")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Agregar una unidad de Amoxibay 250mg" }));
    expect(screen.getByText("Total a pagar: $16.800")).toBeInTheDocument();
    expect(guardado()).toEqual([{ codigo: "MED-001", cantidad: 4 }]);

    await usuario.click(screen.getByRole("button", { name: "Quitar una unidad de Amoxibay 250mg" }));
    expect(guardado()).toEqual([{ codigo: "MED-001", cantidad: 3 }]);

    await usuario.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(screen.getByText("Tu carrito está vacío.")).toBeInTheDocument();
    expect(guardado()).toEqual([]);
  });

  it("parte con el nombre, los apellidos y la dirección guardados en el perfil", async () => {
    instalarPerfilEnMemoria(perfilService, { ...perfilSinDireccion, region: "rm", comuna: "Santiago", direccion: "Los Crisantemos 123" });
    await abrir();

    expect(screen.getByLabelText("Apellidos*")).toHaveValue("Rojas Díaz");
    expect(screen.getByLabelText("Calle*")).toHaveValue("Los Crisantemos 123");
    expect(screen.getByLabelText("Comuna*")).toHaveValue("Santiago");
  });

  it("si no puede leer el perfil, parte con el nombre y el correo de la sesión", async () => {
    perfilService.obtenerPerfil.mockRejectedValue(new Error("No se pudo conectar con el servidor."));
    await abrir();

    expect(screen.getByLabelText("Nombre*")).toHaveValue("Camila");
    expect(screen.getByLabelText("Apellidos*")).toHaveValue("Rojas Díaz");
    expect(screen.getByLabelText("Correo*")).toHaveValue("camila@example.cl");
  });

  it("con sesión parte con el nombre y el correo de la cuenta", async () => {
    await abrir();

    expect(screen.getByLabelText("Nombre*")).toHaveValue("Camila");
    expect(screen.getByLabelText("Apellidos*")).toHaveValue("Rojas Díaz");
    expect(screen.getByLabelText("Correo*")).toHaveValue("camila@example.cl");
  });

  it("paga, crea el pedido con código y cantidad, muestra el número y vacía el carrito", async () => {
    const usuario = userEvent.setup();
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    await abrir();

    await completarFormulario(usuario);

    expect(await screen.findByRole("heading", { name: /Se ha realizado la compra/ })).toBeInTheDocument();
    expect(pedidoService.crearPedido).toHaveBeenCalledTimes(1);
    const [datos, items] = pedidoService.crearPedido.mock.calls[0];
    expect(items).toEqual([{ codigo: "MED-001", cantidad: 3 }]); // el precio nunca viaja
    expect(datos).toMatchObject({ nombre: "Camila", correo: "camila@example.cl", region: "rm", comuna: "Santiago" });
    expect(screen.getByText(/nro #00000100/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver mis pedidos" })).toHaveAttribute("href", "/mis-pedidos");
    expect(guardado()).toEqual([]);
  });

  it("el personal ve el enlace a los pedidos de la tienda tras pagar", async () => {
    const usuario = userEvent.setup();
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    guardarSesion({ token: "t", nombre: "Recepción San Marcos", correo: "recepcion@veterinariasanmarcos.cl", rol: "RECEPCIONISTA" });
    await abrir();

    await completarFormulario(usuario);

    expect(await screen.findByRole("link", { name: "Ver pedidos" })).toHaveAttribute("href", "/recepcion/pedidos");
  });

  it("muestra el pago rechazado sin crear pedido y conserva los datos y el carrito al reintentar", async () => {
    const usuario = userEvent.setup();
    vi.spyOn(Math, "random").mockReturnValue(0.9);
    await abrir();

    await completarFormulario(usuario);
    expect(screen.getByRole("heading", { name: /No se pudo realizar el pago/ })).toBeInTheDocument();
    expect(pedidoService.crearPedido).not.toHaveBeenCalled();

    await usuario.click(screen.getByRole("button", { name: "Volver a realizar el pago" }));

    expect(screen.getByLabelText("Calle*")).toHaveValue("Los Crisantemos 123");
    expect(screen.getByText("Total a pagar: $12.600")).toBeInTheDocument();
    expect(guardado()).toEqual([{ codigo: "MED-001", cantidad: 3 }]);
  });

  it("muestra el motivo si la API rechaza el pedido y no vacía el carrito", async () => {
    const usuario = userEvent.setup();
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    pedidoService.crearPedido.mockRejectedValueOnce(new Error("No hay stock suficiente de Amoxibay 250mg"));
    await abrir();

    await completarFormulario(usuario);

    expect(await screen.findByText("No hay stock suficiente de Amoxibay 250mg")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pagar ahora/ })).toBeInTheDocument();
    expect(guardado()).toEqual([{ codigo: "MED-001", cantidad: 3 }]);
  });

  it("lleva a la página de sesión requerida si el token venció al pagar", async () => {
    const usuario = userEvent.setup();
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    pedidoService.crearPedido.mockRejectedValueOnce(Object.assign(new Error("Sesión vencida"), { estado: 401 }));
    await abrir();

    await completarFormulario(usuario);

    expect(await screen.findByText("Sesión requerida")).toBeInTheDocument();
  });

  it("explica el error y permite reintentar cuando el catálogo no carga", async () => {
    const usuario = userEvent.setup();
    productoService.listarProductos.mockRejectedValueOnce(new Error("No se pudo conectar con el servidor"));
    await abrir();

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo conectar con el servidor");

    await usuario.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("Total a pagar: $12.600")).toBeInTheDocument();
  });
});
