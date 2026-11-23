import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import * as pedidoService from "../../services/pedidoService";
import { instalarPedidosEnMemoria, pedidosDemo } from "../../test/pedidosEnMemoria";
import { guardarSesion } from "../../utils/sesion";
import MisPedidos from "./MisPedidos";

vi.mock("../../services/pedidoService", async (importarOriginal) => ({
  ...(await importarOriginal()),
  crearPedido: vi.fn(),
  listarPedidos: vi.fn(),
  entregarPedido: vi.fn(),
  cancelarPedido: vi.fn(),
}));

const abrir = async () => {
  render(
    <MemoryRouter initialEntries={["/mis-pedidos"]}>
      <Routes>
        <Route path="/mis-pedidos" element={<MisPedidos />} />
        <Route path="/sesion-requerida" element={<p>Sesión requerida</p>} />
      </Routes>
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.queryByText("Cargando pedidos...")).not.toBeInTheDocument());
};

describe("MisPedidos", () => {
  beforeEach(() => {
    sessionStorage.clear();
    guardarSesion({ token: "t", nombre: "Camila Rojas", correo: "camila@example.cl", rol: "TUTOR" });
    instalarPedidosEnMemoria(pedidoService);
  });
  afterEach(() => vi.restoreAllMocks());

  it("lista las compras con su número, estado, productos y total", async () => {
    await abrir();

    const pedido = screen.getByRole("article", { name: "Pedido 00000001" });
    expect(within(pedido).getByText("Pedido #00000001")).toBeInTheDocument();
    expect(within(pedido).getByText("Pagado")).toBeInTheDocument();
    expect(within(pedido).getByText("Amoxibay 250mg")).toBeInTheDocument();
    expect(within(pedido).getByText(/Total/)).toHaveTextContent("$12.600");
    expect(screen.getByRole("article", { name: "Pedido 00000002" })).toBeInTheDocument();
  });

  it("invita a la tienda cuando todavía no hay compras", async () => {
    instalarPedidosEnMemoria(pedidoService, []);
    await abrir();

    expect(screen.getByText("Aún no has hecho compras.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir a la tienda" })).toHaveAttribute("href", "/tienda");
  });

  it("explica el error y permite reintentar", async () => {
    pedidoService.listarPedidos.mockRejectedValueOnce(new Error("No se pudo conectar con el servidor"));
    await abrir();
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo conectar con el servidor");

    screen.getByRole("button", { name: "Reintentar" }).click();

    expect(await screen.findByRole("article", { name: `Pedido ${pedidosDemo[0].numero}` })).toBeInTheDocument();
  });

  it("lleva a la página de sesión requerida si el token venció", async () => {
    pedidoService.listarPedidos.mockRejectedValueOnce(Object.assign(new Error("Sesión vencida"), { estado: 401 }));
    render(
      <MemoryRouter initialEntries={["/mis-pedidos"]}>
        <Routes>
          <Route path="/mis-pedidos" element={<MisPedidos />} />
          <Route path="/sesion-requerida" element={<p>Sesión requerida</p>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Sesión requerida")).toBeInTheDocument();
  });
});
