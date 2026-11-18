import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import Registro from "./Registro";
import * as authService from "../services/authService";
import { obtenerToken } from "../utils/sesion";

vi.mock("../services/authService");

function mostrar() {
  return render(
    <MemoryRouter initialEntries={["/registro"]}>
      <Routes>
        <Route path="/registro" element={<Registro />} />
        <Route path="/mi-perfil" element={<p>Vista del tutor</p>} />
      </Routes>
    </MemoryRouter>
  );
}

async function completar({ nombre = "Ana Pérez", correo = "ana@correo.cl", password = "secreto1", repetir = "secreto1" } = {}) {
  if (nombre) await userEvent.type(screen.getByLabelText("Nombre completo"), nombre);
  if (correo) await userEvent.type(screen.getByLabelText("Correo electrónico"), correo);
  if (password) await userEvent.type(screen.getByLabelText("Contraseña"), password);
  if (repetir) await userEvent.type(screen.getByLabelText("Repetir contraseña"), repetir);
  await userEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));
}

describe("Registro", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.resetAllMocks();
  });

  it("muestra los errores de los campos vacíos y no llama al servidor", async () => {
    mostrar();
    await userEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));
    expect(screen.getByText("El nombre es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("El correo es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("La contraseña es obligatoria.")).toBeInTheDocument();
    expect(authService.registrarTutor).not.toHaveBeenCalled();
  });

  it("valida el formato del correo y el largo de la contraseña", async () => {
    mostrar();
    await completar({ correo: "correo-malo", password: "123", repetir: "123" });
    expect(screen.getByText("El correo no tiene un formato válido.")).toBeInTheDocument();
    expect(screen.getByText("La contraseña debe tener entre 6 y 64 caracteres.")).toBeInTheDocument();
  });

  it("exige que las contraseñas coincidan", async () => {
    mostrar();
    await completar({ repetir: "otra-clave" });
    expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
    expect(authService.registrarTutor).not.toHaveBeenCalled();
  });

  it("crea la cuenta, guarda la sesión y entra al perfil", async () => {
    authService.registrarTutor.mockResolvedValue({ token: "tok", nombre: "Ana Pérez", correo: "ana@correo.cl", rol: "TUTOR" });
    mostrar();
    await completar();
    expect(await screen.findByText("Vista del tutor")).toBeInTheDocument();
    expect(authService.registrarTutor).toHaveBeenCalledWith({ nombre: "Ana Pérez", correo: "ana@correo.cl", password: "secreto1" });
    expect(obtenerToken()).toBe("tok");
  });

  it("marca el correo cuando ya existe una cuenta", async () => {
    authService.registrarTutor.mockRejectedValue(Object.assign(new Error("Ya existe una cuenta con ese correo"), { estado: 409 }));
    mostrar();
    await completar();
    expect(await screen.findByText("Ya existe una cuenta con ese correo")).toBeInTheDocument();
    expect(obtenerToken()).toBeNull();
  });

  it("muestra un error general si el servidor falla", async () => {
    authService.registrarTutor.mockRejectedValue(new Error("No se pudo conectar con el servidor."));
    mostrar();
    await completar();
    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo conectar con el servidor.");
  });
});
