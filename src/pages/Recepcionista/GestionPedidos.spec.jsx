import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import * as pedidoService from "../../services/pedidoService";
import { instalarPedidosEnMemoria } from "../../test/pedidosEnMemoria";
import { guardarSesion } from "../../utils/sesion";
import GestionPedidos from "./GestionPedidos";

vi.mock("../../services/pedidoService", async (importarOriginal) => ({
  ...(await importarOriginal()),
  crearPedido: vi.fn(),
  listarPedidos: vi.fn(),
  entregarPedido: vi.fn(),
  cancelarPedido: vi.fn(),
}));

const abrir = async () => {
  render(
    <MemoryRouter initialEntries={["/recepcion/pedidos"]}>
      <Routes>
        <Route path="/recepcion/pedidos" element={<GestionPedidos />} />
        <Route path="/sesion-requerida" element={<p>Sesión requerida</p>} />
      </Routes>
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.queryByText("Cargando pedidos...")).not.toBeInTheDocument());
};
const fila = (texto) => screen.getByText(texto).closest("tr");

describe("GestionPedidos", () => {
  beforeEach(() => {
    sessionStorage.clear();
    guardarSesion({ token: "t", nombre: "Recepción San Marcos", correo: "recepcion@veterinariasanmarcos.cl", rol: "RECEPCIONISTA" });
    instalarPedidosEnMemoria(pedidoService);
  });
  afterEach(() => vi.restoreAllMocks());

  it("lista los pedidos de todos los clientes con su estado", async () => {
    await abrir();

    expect(within(fila("#00000001")).getByText("Camila Rojas", { exact: false })).toBeInTheDocument();
    expect(within(fila("#00000001")).getByText("Pagado")).toBeInTheDocument();
    expect(within(fila("#00000002")).getByText("Entregado")).toBeInTheDocument();
  });

  it("filtra por estado", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.selectOptions(screen.getByLabelText("Filtrar por estado"), "ENTREGADO");

    expect(screen.queryByText("#00000001")).not.toBeInTheDocument();
    expect(screen.getByText("#00000002")).toBeInTheDocument();
  });

  it("avisa cuando ningún pedido coincide", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.selectOptions(screen.getByLabelText("Filtrar por estado"), "CANCELADO");

    expect(screen.getByText("No hay pedidos para mostrar.")).toBeInTheDocument();
  });

  it("despliega el detalle con los productos y la dirección de despacho", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.click(within(fila("#00000002")).getByRole("button", { name: "Ver detalle" }));

    expect(screen.getByText("Enrox 50mg")).toBeInTheDocument();
    expect(screen.getByText(/Av\. Siempre Viva 742, depto\. 12B, Viña del Mar/)).toBeInTheDocument();
    expect(screen.getByText(/Dejar con conserje/)).toBeInTheDocument();

    await usuario.click(within(fila("#00000002")).getByRole("button", { name: "Ocultar" }));
    expect(screen.queryByText("Enrox 50mg")).not.toBeInTheDocument();
  });

  it("marca un pedido pagado como entregado", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.click(within(fila("#00000001")).getByRole("button", { name: "Marcar entregado" }));

    await waitFor(() => expect(within(fila("#00000001")).getByText("Entregado")).toBeInTheDocument());
    expect(pedidoService.entregarPedido).toHaveBeenCalledWith(1);
    expect(within(fila("#00000001")).queryByRole("button", { name: "Marcar entregado" })).not.toBeInTheDocument();
  });

  it("cancela un pedido solo si se confirma", async () => {
    const usuario = userEvent.setup();
    const confirmar = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    await abrir();

    await usuario.click(within(fila("#00000001")).getByRole("button", { name: "Cancelar" }));
    expect(pedidoService.cancelarPedido).not.toHaveBeenCalled();

    await usuario.click(within(fila("#00000001")).getByRole("button", { name: "Cancelar" }));

    await waitFor(() => expect(within(fila("#00000001")).getByText("Cancelado")).toBeInTheDocument());
    expect(confirmar).toHaveBeenLastCalledWith(expect.stringContaining("#00000001"));
    expect(pedidoService.cancelarPedido).toHaveBeenCalledWith(1);
  });

  it("los pedidos ya entregados no ofrecen acciones", async () => {
    await abrir();

    expect(within(fila("#00000002")).queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument();
  });

  it("muestra el motivo si la acción falla", async () => {
    const usuario = userEvent.setup();
    pedidoService.entregarPedido.mockRejectedValueOnce(new Error("El pedido ya fue cancelado"));
    await abrir();

    await usuario.click(within(fila("#00000001")).getByRole("button", { name: "Marcar entregado" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("El pedido ya fue cancelado");
  });

  it("lleva a la página de sesión requerida si el token venció", async () => {
    pedidoService.listarPedidos.mockRejectedValueOnce(Object.assign(new Error("Sesión vencida"), { estado: 401 }));
    await abrir().catch(() => {});

    expect(await screen.findByText("Sesión requerida")).toBeInTheDocument();
  });

  it("incluye el menú de recepción", async () => {
    await abrir();

    expect(screen.getByRole("link", { name: "Pedidos" })).toHaveClass("active");
  });
});
