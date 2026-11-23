import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { guardarSesion } from "../utils/sesion";
import CompraExitosa from "./CompraExitosa";

const compra = {
  numero: "00000100",
  datos: { nombre: "Camila", apellidos: "Rojas", correo: "camila@example.cl", calle: "Los Crisantemos 123", departamento: "", region: "rm", comuna: "Santiago", indicaciones: "" },
  lineas: [{ producto: { codigo: "MED-001", nombre: "Amoxibay 250mg", precio: 4200 }, cantidad: 3 }],
  total: 12600,
};

const mostrar = () =>
  render(
    <MemoryRouter>
      <CompraExitosa compra={compra} />
    </MemoryRouter>
  );

describe("CompraExitosa", () => {
  beforeEach(() => sessionStorage.clear());

  it("muestra el número de pedido que entregó la API y el total pagado", () => {
    guardarSesion({ token: "t", nombre: "Camila", correo: "camila@example.cl", rol: "TUTOR" });
    mostrar();

    expect(screen.getByRole("heading", { name: /nro #00000100/ })).toBeInTheDocument();
    expect(screen.getByText("Código orden: ORDER00000100")).toBeInTheDocument();
    expect(screen.getByText("Total pagado: $12.600")).toBeInTheDocument();
  });

  it("al tutor lo lleva a sus pedidos y deja seguir comprando", () => {
    guardarSesion({ token: "t", nombre: "Camila", correo: "camila@example.cl", rol: "TUTOR" });
    mostrar();

    expect(screen.getByRole("link", { name: "Ver mis pedidos" })).toHaveAttribute("href", "/mis-pedidos");
    expect(screen.getByRole("link", { name: "Seguir comprando" })).toHaveAttribute("href", "/tienda");
  });

  it.each(["RECEPCIONISTA", "ADMINISTRADOR"])("al rol %s lo lleva al módulo de pedidos", (rol) => {
    guardarSesion({ token: "t", nombre: "Personal", correo: "p@correo.cl", rol });
    mostrar();

    expect(screen.getByRole("link", { name: "Ver pedidos" })).toHaveAttribute("href", "/recepcion/pedidos");
  });
});
