import { render, screen } from "@testing-library/react";
import EstadoPedido from "./EstadoPedido";

describe("EstadoPedido", () => {
  it.each([
    ["PAGADO", "Pagado", "bg-primary"],
    ["ENTREGADO", "Entregado", "bg-success"],
    ["CANCELADO", "Cancelado", "bg-secondary"],
  ])("muestra %s como «%s»", (estado, etiqueta, clase) => {
    render(<EstadoPedido estado={estado} />);

    expect(screen.getByText(etiqueta)).toHaveClass(clase);
  });

  it("muestra tal cual un estado desconocido", () => {
    render(<EstadoPedido estado="EN_CAMINO" />);

    expect(screen.getByText("EN_CAMINO")).toBeInTheDocument();
  });
});
