import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RutaProtegida from "./RutaProtegida";
import { guardarSesion } from "../utils/sesion";

function mostrar(rutaInicial = "/privada") {
  return render(
    <MemoryRouter initialEntries={[rutaInicial]}>
      <Routes>
        <Route path="/login" element={<p>Pantalla de login</p>} />
        <Route path="/acceso-denegado" element={<p>Acceso denegado</p>} />
        <Route element={<RutaProtegida roles={["RECEPCIONISTA"]} />}>
          <Route path="/privada" element={<p>Contenido privado</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("RutaProtegida", () => {
  beforeEach(() => sessionStorage.clear());

  it("sin sesión lleva al login", () => {
    mostrar();
    expect(screen.getByText("Pantalla de login")).toBeInTheDocument();
  });

  it("con un rol que no corresponde lleva a acceso denegado", () => {
    guardarSesion({ token: "t", nombre: "Ana", correo: "ana@correo.cl", rol: "TUTOR" });
    mostrar();
    expect(screen.getByText("Acceso denegado")).toBeInTheDocument();
  });

  it("con el rol correcto muestra el contenido", () => {
    guardarSesion({ token: "t", nombre: "Rec", correo: "rec@correo.cl", rol: "RECEPCIONISTA" });
    mostrar();
    expect(screen.getByText("Contenido privado")).toBeInTheDocument();
  });
});
