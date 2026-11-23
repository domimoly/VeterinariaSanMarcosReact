import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { guardarSesion } from "./utils/sesion";

function abrir(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>
  );
}

const sesiones = {
  tutor: { token: "t", nombre: "Ana", correo: "ana@correo.cl", rol: "TUTOR" },
  recepcion: { token: "t", nombre: "Rec", correo: "rec@correo.cl", rol: "RECEPCIONISTA" },
  admin: { token: "t", nombre: "Admin", correo: "admin@correo.cl", rol: "ADMINISTRADOR" },
};

describe("App: acceso por rol", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it.each(["/mi-perfil", "/agendar-cita", "/carrito", "/mis-pedidos", "/recepcion", "/recepcion/fichas", "/admin/usuarios", "/admin/reportes"])(
    "sin sesión, %s lleva al login",
    (ruta) => {
      abrir(ruta);
      expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
    }
  );

  it("el catálogo de la tienda se ve sin sesión, pero el carrito exige iniciarla", () => {
    abrir("/tienda");
    expect(screen.getByRole("heading", { name: "Productos" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Iniciar sesión" })).not.toBeInTheDocument();
  });

  it.each([["tutor"], ["recepcion"], ["admin"]])("con sesión de %s se puede entrar al carrito", (quien) => {
    guardarSesion(sesiones[quien]);
    abrir("/carrito");
    expect(screen.queryByRole("heading", { name: "Iniciar sesión" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /No tienes permiso/i })).not.toBeInTheDocument();
  });

  it("las páginas informativas siguen abiertas sin sesión", () => {
    abrir("/servicios");
    expect(screen.queryByRole("heading", { name: "Iniciar sesión" })).not.toBeInTheDocument();
  });

  it("sin sesión se puede entrar al registro", () => {
    abrir("/registro");
    expect(screen.getByRole("heading", { name: "Crear cuenta de tutor" })).toBeInTheDocument();
  });

  it("un tutor no puede entrar a Recepción ni a Administración", () => {
    guardarSesion(sesiones.tutor);
    abrir("/recepcion");
    expect(screen.getByRole("heading", { name: /No tienes permiso/i })).toBeInTheDocument();
  });

  it("una recepcionista no puede entrar al perfil del tutor", () => {
    guardarSesion(sesiones.recepcion);
    abrir("/mi-perfil");
    expect(screen.getByRole("heading", { name: /No tienes permiso/i })).toBeInTheDocument();
  });

  it("un tutor entra a su perfil", () => {
    guardarSesion(sesiones.tutor);
    abrir("/mi-perfil");
    expect(screen.getByRole("heading", { name: /Mis mascotas/i })).toBeInTheDocument();
  });

  it("una recepcionista entra a la agenda", () => {
    guardarSesion(sesiones.recepcion);
    abrir("/recepcion");
    expect(screen.queryByRole("heading", { name: /No tienes permiso/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Iniciar sesión" })).not.toBeInTheDocument();
  });

  it("una recepcionista no puede entrar a Usuarios ni a Reportes", () => {
    guardarSesion(sesiones.recepcion);
    abrir("/admin/reportes");
    expect(screen.getByRole("heading", { name: /No tienes permiso/i })).toBeInTheDocument();
  });

  it("un administrador tiene acceso total: también entra a la agenda y a las fichas de recepción", () => {
    guardarSesion(sesiones.admin);
    abrir("/recepcion/fichas");
    expect(screen.queryByRole("heading", { name: /No tienes permiso/i })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recepción" })).toBeInTheDocument();
  });

  it("un administrador entra a los reportes", () => {
    guardarSesion(sesiones.admin);
    abrir("/admin/reportes");
    expect(screen.getByRole("heading", { name: "Reportes del sistema" })).toBeInTheDocument();
  });

  it("un administrador entra a la gestión de usuarios", () => {
    guardarSesion(sesiones.admin);
    abrir("/admin/usuarios");
    expect(screen.queryByRole("heading", { name: /No tienes permiso/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Iniciar sesión" })).not.toBeInTheDocument();
  });
});

describe("App: menú según la sesión", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("sin sesión ofrece iniciar sesión y oculta las vistas internas", () => {
    abrir("/");
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Mi perfil" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Recepción" })).not.toBeInTheDocument();
  });

  it("un tutor ve Mi perfil y puede cerrar sesión", async () => {
    guardarSesion(sesiones.tutor);
    abrir("/");
    expect(screen.getByRole("link", { name: "Mi perfil" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Recepción" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(sessionStorage.getItem("tokenVeterinariaSanMarcos")).toBeNull();
  });

  it("una recepcionista ve solo Recepción", () => {
    guardarSesion(sesiones.recepcion);
    abrir("/");
    expect(screen.getByRole("link", { name: "Recepción" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Mi perfil" })).not.toBeInTheDocument();
  });

  it("un administrador ve Administración", () => {
    guardarSesion(sesiones.admin);
    abrir("/");
    expect(screen.getByRole("link", { name: "Administración" })).toBeInTheDocument();
  });
});
