import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NoEncontrada from "../NoEncontrada";
import SinSesion from "./SinSesion";
import SinPermiso from "./SinPermiso";
import ErrorServidor from "./ErrorServidor";

const paginas = [
  { nombre: "NoEncontrada", Pagina: NoEncontrada, titulo: "Página no encontrada", enlace: ["Volver al inicio", "/"] },
  { nombre: "SinSesion", Pagina: SinSesion, titulo: "Inicia sesión para continuar", enlace: ["Iniciar sesión", "/login"] },
  { nombre: "SinPermiso", Pagina: SinPermiso, titulo: "No tienes permiso para ver esta página", enlace: ["Ir a mi perfil", "/mi-perfil"] },
  { nombre: "ErrorServidor", Pagina: ErrorServidor, titulo: "No pudimos completar la solicitud", enlace: ["Volver al inicio", "/"] },
];

describe("Páginas de error", () => {
  it.each(paginas)("$nombre muestra su título y una salida", ({ Pagina, titulo, enlace }) => {
    render(
      <MemoryRouter>
        <Pagina />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: titulo })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: enlace[0] })).toHaveAttribute("href", enlace[1]);
  });
});
