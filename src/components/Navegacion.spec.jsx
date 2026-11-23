import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { guardarCarrito } from "../utils/carrito";
import { guardarSesion, obtenerToken } from "../utils/sesion";
import Navegacion from "./Navegacion";

const mostrar = () =>
  render(
    <MemoryRouter>
      <Navegacion />
    </MemoryRouter>
  );

describe("Navegacion", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("la tienda y el carrito se ofrecen también a los visitantes", () => {
    mostrar();

    expect(screen.getByRole("link", { name: "Tienda" })).toHaveAttribute("href", "/tienda");
    expect(screen.getByRole("link", { name: /Carrito/ })).toHaveAttribute("href", "/carrito");
  });

  it("muestra el enlace al carrito sin contador cuando está vacío", () => {
    mostrar();

    const enlace = screen.getByRole("link", { name: "Carrito, 0 productos" });
    expect(enlace).toHaveAttribute("href", "/carrito");
  });

  it("muestra cuántas unidades hay en el carrito y se actualiza al agregar", () => {
    guardarCarrito([{ codigo: "MED-001", cantidad: 2 }, { codigo: "ANT-001", cantidad: 1 }]);
    mostrar();
    expect(screen.getByRole("link", { name: "Carrito, 3 productos" })).toBeInTheDocument();

    act(() => guardarCarrito([{ codigo: "MED-001", cantidad: 1 }]));

    expect(screen.getByRole("link", { name: "Carrito, 1 producto" })).toBeInTheDocument();
  });

  it("sin sesión ofrece iniciar sesión y registrarse", () => {
    mostrar();

    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Registrarse" })).toHaveAttribute("href", "/registro");
    expect(screen.queryByRole("link", { name: "Mi perfil" })).not.toBeInTheDocument();
  });

  it.each([
    ["TUTOR", "Mi perfil", "/mi-perfil"],
    ["RECEPCIONISTA", "Recepción", "/recepcion"],
    ["ADMINISTRADOR", "Administración", "/admin/usuarios"],
  ])("al rol %s le muestra su módulo", (rol, nombre, ruta) => {
    guardarSesion({ token: "t", nombre: "Alguien", correo: "a@correo.cl", rol });
    mostrar();

    expect(screen.getByRole("link", { name: nombre })).toHaveAttribute("href", ruta);
    expect(screen.queryByRole("link", { name: "Registrarse" })).not.toBeInTheDocument();
  });

  it("cierra la sesión y vuelve a ofrecer iniciar sesión", async () => {
    const usuario = userEvent.setup();
    guardarSesion({ token: "t", nombre: "Alguien", correo: "a@correo.cl", rol: "TUTOR" });
    mostrar();

    expect(obtenerToken()).toBe("t");

    await usuario.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(obtenerToken()).toBeFalsy();
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("al elegir una opción del menú lo pliega (para el celular)", async () => {
    const usuario = userEvent.setup();
    mostrar();
    const menu = document.getElementById("menu-principal");

    await usuario.click(screen.getByRole("button", { name: "Toggle navigation" }));
    await waitFor(() => expect(menu).toHaveClass("show")); // la animación pasa primero por "collapsing"

    await usuario.click(screen.getByRole("link", { name: "Contacto" }));
    await waitFor(() => expect(menu).not.toHaveClass("show"));
  });
});
