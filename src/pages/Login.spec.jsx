import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import Login from "./Login";
import * as authService from "../services/authService";
import { obtenerToken } from "../utils/sesion";

vi.mock("../services/authService");

function mostrar(estadoInicial) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: "/login", state: estadoInicial }]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/mi-perfil" element={<p>Vista del tutor</p>} />
        <Route path="/recepcion" element={<p>Vista de recepción</p>} />
        <Route path="/agendar-cita" element={<p>Agendar cita</p>} />
      </Routes>
    </MemoryRouter>
  );
}

async function ingresar(correo = "ana@correo.cl", password = "secreto1") {
  await userEvent.type(screen.getByLabelText("Correo electrónico"), correo);
  await userEvent.type(screen.getByLabelText("Contraseña"), password);
  await userEvent.click(screen.getByRole("button", { name: "Ingresar" }));
}

describe("Login", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.resetAllMocks();
  });

  it("exige correo y contraseña antes de llamar al servidor", async () => {
    mostrar();
    await userEvent.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Ingresa tu correo y tu contraseña.");
    expect(authService.login).not.toHaveBeenCalled();
  });

  it("un tutor entra a su perfil y se guarda la sesión", async () => {
    authService.login.mockResolvedValue({ token: "tok", nombre: "Ana", correo: "ana@correo.cl", rol: "TUTOR" });
    mostrar();
    await ingresar();
    expect(await screen.findByText("Vista del tutor")).toBeInTheDocument();
    expect(obtenerToken()).toBe("tok");
  });

  it("una recepcionista entra a la agenda", async () => {
    authService.login.mockResolvedValue({ token: "tok", nombre: "Rec", correo: "rec@correo.cl", rol: "RECEPCIONISTA" });
    mostrar();
    await ingresar("rec@correo.cl");
    expect(await screen.findByText("Vista de recepción")).toBeInTheDocument();
  });

  it("vuelve a la página protegida que se intentó abrir", async () => {
    authService.login.mockResolvedValue({ token: "tok", nombre: "Ana", correo: "ana@correo.cl", rol: "TUTOR" });
    mostrar({ desde: "/agendar-cita" });
    await ingresar();
    expect(await screen.findByText("Agendar cita")).toBeInTheDocument();
  });

  it("con credenciales incorrectas muestra el error y no guarda sesión", async () => {
    authService.login.mockRejectedValue(Object.assign(new Error("Credenciales inválidas"), { estado: 401 }));
    mostrar();
    await ingresar("ana@correo.cl", "mala");
    expect(await screen.findByRole("alert")).toHaveTextContent("Correo o contraseña incorrectos.");
    expect(obtenerToken()).toBeNull();
  });

  it("si el servidor no responde muestra su mensaje", async () => {
    authService.login.mockRejectedValue(new Error("No se pudo conectar con el servidor."));
    mostrar();
    await ingresar();
    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo conectar con el servidor.");
  });

  it("deshabilita el botón mientras espera la respuesta", async () => {
    let resolver;
    authService.login.mockReturnValue(new Promise((r) => (resolver = r)));
    mostrar();
    await ingresar();
    expect(screen.getByRole("button", { name: "Ingresando..." })).toBeDisabled();
    resolver({ token: "t", nombre: "Ana", correo: "ana@correo.cl", rol: "TUTOR" });
    await waitFor(() => expect(screen.getByText("Vista del tutor")).toBeInTheDocument());
  });
});
