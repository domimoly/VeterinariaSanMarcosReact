import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import LimiteError from "./LimiteError";

let debeFallar = true;

function ComponenteQueFalla() {
  if (debeFallar) throw new Error("fallo de prueba");
  return <p>Contenido normal</p>;
}

function mostrar() {
  return render(
    <MemoryRouter>
      <LimiteError>
        <ComponenteQueFalla />
      </LimiteError>
    </MemoryRouter>
  );
}

describe("LimiteError", () => {
  beforeEach(() => {
    debeFallar = true;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("muestra el contenido cuando no hay errores", () => {
    debeFallar = false;
    mostrar();
    expect(screen.getByText("Contenido normal")).toBeInTheDocument();
  });

  it("muestra la pantalla de error cuando un componente falla", () => {
    mostrar();
    expect(screen.getByRole("heading", { name: "Algo salió mal" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al inicio" })).toBeInTheDocument();
  });

  it("permite reintentar y recupera el contenido si el problema ya pasó", async () => {
    mostrar();
    debeFallar = false;
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(screen.getByText("Contenido normal")).toBeInTheDocument();
  });
});
