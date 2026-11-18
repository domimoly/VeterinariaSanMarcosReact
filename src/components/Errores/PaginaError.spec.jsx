import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import PaginaError from "./PaginaError";

function mostrar(propiedades) {
  return render(
    <MemoryRouter>
      <PaginaError {...propiedades} />
    </MemoryRouter>
  );
}

describe("PaginaError", () => {
  it("muestra el título y el mensaje", () => {
    mostrar({ codigo: "403", titulo: "Acceso denegado", mensaje: "No tienes permiso." });
    expect(screen.getByRole("heading", { name: "Acceso denegado" })).toBeInTheDocument();
    expect(screen.getByText("No tienes permiso.")).toBeInTheDocument();
  });

  it("muestra una acción como enlace cuando trae una ruta", () => {
    mostrar({ codigo: "404", titulo: "No existe", mensaje: "x", acciones: [{ texto: "Ir al inicio", to: "/" }] });
    expect(screen.getByRole("link", { name: "Ir al inicio" })).toHaveAttribute("href", "/");
  });

  it("muestra una acción como botón y ejecuta su función", async () => {
    const reintentar = vi.fn();
    mostrar({ codigo: "500", titulo: "Error", mensaje: "x", acciones: [{ texto: "Reintentar", onClick: reintentar }] });
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(reintentar).toHaveBeenCalledTimes(1);
  });
});
