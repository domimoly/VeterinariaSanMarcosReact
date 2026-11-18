import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import * as usuarioService from "../../services/usuarioService";
import { instalarUsuariosEnMemoria } from "../../test/usuariosEnMemoria";
import { guardarSesion } from "../../utils/sesion";
import Usuarios from "./Usuarios";

// Solo se simulan las llamadas a la API; las etiquetas de rol son las reales
vi.mock("../../services/usuarioService", async (importarOriginal) => ({
  ...(await importarOriginal()),
  listarUsuarios: vi.fn(),
  crearUsuario: vi.fn(),
  actualizarUsuario: vi.fn(),
  cambiarEstadoUsuario: vi.fn(),
}));

let memoria;
const abrir = async () => {
  render(
    <MemoryRouter initialEntries={["/admin/usuarios"]}>
      <Routes>
        <Route path="/admin/usuarios" element={<Usuarios />} />
        <Route path="/sesion-requerida" element={<p>Sesión requerida</p>} />
      </Routes>
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.queryByText("Cargando usuarios...")).not.toBeInTheDocument());
};
const fila = (texto) => screen.getByText(texto).closest("tr");

describe("Usuarios (administración)", () => {
  beforeEach(() => {
    sessionStorage.clear();
    guardarSesion({ token: "t", nombre: "Administrador San Marcos", correo: "admin@veterinariasanmarcos.cl", rol: "ADMINISTRADOR" });
    memoria = instalarUsuariosEnMemoria(usuarioService);
  });
  afterEach(() => vi.restoreAllMocks());

  it("lista las cuentas que entrega ms-auth con su rol y estado", async () => {
    await abrir();

    expect(within(fila("camila@example.cl")).getByText("Tutor")).toBeInTheDocument();
    expect(within(fila("recepcion@veterinariasanmarcos.cl")).getByText("Recepcionista")).toBeInTheDocument();
    expect(within(fila("valentina@example.cl")).getByText("Inactivo")).toBeInTheDocument();
    expect(within(fila("valentina@example.cl")).getByText("—")).toBeInTheDocument(); // sin fecha de registro
  });

  it("resume el total, los activos y los administradores", async () => {
    await abrir();
    const resumen = screen.getByRole("region", { name: "Resumen de usuarios" });

    expect(within(resumen).getByText("Total de usuarios").nextSibling).toHaveTextContent("4");
    expect(within(resumen).getByText("Usuarios activos").nextSibling).toHaveTextContent("3");
    expect(within(resumen).getByText("Administradores").nextSibling).toHaveTextContent("1");
  });

  it("filtra por texto, por rol y por estado", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.type(screen.getByLabelText("Buscar usuarios"), "camila");
    expect(screen.getByText("camila@example.cl")).toBeInTheDocument();
    expect(screen.queryByText("valentina@example.cl")).not.toBeInTheDocument();

    await usuario.clear(screen.getByLabelText("Buscar usuarios"));
    await usuario.selectOptions(screen.getByLabelText("Filtrar por rol"), "RECEPCIONISTA");
    expect(screen.getByText("recepcion@veterinariasanmarcos.cl")).toBeInTheDocument();
    expect(screen.queryByText("camila@example.cl")).not.toBeInTheDocument();

    await usuario.selectOptions(screen.getByLabelText("Filtrar por rol"), "Todos");
    await usuario.selectOptions(screen.getByLabelText("Filtrar por estado"), "Inactivo");
    expect(screen.getByText("valentina@example.cl")).toBeInTheDocument();
    expect(screen.queryByText("camila@example.cl")).not.toBeInTheDocument();
  });

  it("avisa cuando ningún usuario coincide con los filtros", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.type(screen.getByLabelText("Buscar usuarios"), "zzz");

    expect(screen.getByText("No se encontraron usuarios")).toBeInTheDocument();
  });

  it("crea una cuenta nueva con el rol elegido", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.click(screen.getByRole("button", { name: /Nuevo usuario/ }));
    await usuario.type(screen.getByLabelText("Nombre"), "Pedro Vet");
    await usuario.type(screen.getByLabelText("Correo electrónico"), "pedro@veterinariasanmarcos.cl");
    await usuario.type(screen.getByLabelText("Contraseña"), "secreta1");
    await usuario.selectOptions(screen.getByLabelText("Rol"), "RECEPCIONISTA");
    await usuario.click(screen.getByRole("button", { name: "Crear usuario" }));

    expect(await screen.findByText("pedro@veterinariasanmarcos.cl")).toBeInTheDocument();
    expect(usuarioService.crearUsuario).toHaveBeenCalledWith({
      nombre: "Pedro Vet",
      correo: "pedro@veterinariasanmarcos.cl",
      password: "secreta1",
      rol: "RECEPCIONISTA",
    });
    expect(screen.queryByRole("heading", { name: "Crear usuario" })).not.toBeInTheDocument();
  });

  it("si ms-auth rechaza la cuenta (correo repetido), muestra el motivo y deja el formulario abierto", async () => {
    const usuario = userEvent.setup();
    usuarioService.crearUsuario.mockRejectedValueOnce(new Error("Ya existe una cuenta con ese correo"));
    await abrir();

    await usuario.click(screen.getByRole("button", { name: /Nuevo usuario/ }));
    await usuario.type(screen.getByLabelText("Nombre"), "Camila Dos");
    await usuario.type(screen.getByLabelText("Correo electrónico"), "camila@example.cl");
    await usuario.type(screen.getByLabelText("Contraseña"), "secreta1");
    await usuario.click(screen.getByRole("button", { name: "Crear usuario" }));

    expect(await screen.findByText("Ya existe una cuenta con ese correo")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Crear usuario" })).toBeInTheDocument();
  });

  it("edita el nombre y asigna otro rol", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.click(within(fila("camila@example.cl")).getByRole("button", { name: /Editar/ }));
    await usuario.clear(screen.getByLabelText("Nombre"));
    await usuario.type(screen.getByLabelText("Nombre"), "Camila R.");
    await usuario.selectOptions(screen.getByLabelText("Rol"), "RECEPCIONISTA");
    await usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => expect(within(fila("camila@example.cl")).getByText("Recepcionista")).toBeInTheDocument());
    expect(within(fila("camila@example.cl")).getByText("Camila R.")).toBeInTheDocument();
    expect(usuarioService.actualizarUsuario).toHaveBeenCalledWith(3, { nombre: "Camila R.", correo: "camila@example.cl", password: "", rol: "RECEPCIONISTA" });
    expect(memoria.usuarios().find((u) => u.id === 3).rol).toBe("RECEPCIONISTA");
  });

  it("desactiva una cuenta solo si se confirma y la puede reactivar", async () => {
    const usuario = userEvent.setup();
    const confirmar = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    await abrir();

    await usuario.click(within(fila("camila@example.cl")).getByRole("button", { name: "Desactivar a Camila Rojas" }));
    expect(usuarioService.cambiarEstadoUsuario).not.toHaveBeenCalled();

    await usuario.click(within(fila("camila@example.cl")).getByRole("button", { name: "Desactivar a Camila Rojas" }));
    expect(await within(fila("camila@example.cl")).findByText("Inactivo")).toBeInTheDocument();
    expect(usuarioService.cambiarEstadoUsuario).toHaveBeenCalledWith(3, false);
    expect(confirmar).toHaveBeenCalledTimes(2);

    await usuario.click(within(fila("camila@example.cl")).getByRole("button", { name: "Activar a Camila Rojas" }));
    expect(await within(fila("camila@example.cl")).findByText("Activo")).toBeInTheDocument();
    expect(usuarioService.cambiarEstadoUsuario).toHaveBeenLastCalledWith(3, true);
  });

  it("no deja que el administrador desactive su propia cuenta", async () => {
    await abrir();

    expect(
      within(fila("admin@veterinariasanmarcos.cl")).getByRole("button", { name: "Desactivar a Administrador San Marcos" })
    ).toBeDisabled();
  });

  it("no deja cambiar el rol de la propia cuenta al editarla", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.click(within(fila("admin@veterinariasanmarcos.cl")).getByRole("button", { name: /Editar/ }));

    expect(screen.getByLabelText("Rol")).toBeDisabled();
  });

  it("muestra el error si falla un cambio de estado", async () => {
    const usuario = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    usuarioService.cambiarEstadoUsuario.mockRejectedValueOnce(new Error("Usuario no encontrado: 3"));
    await abrir();

    await usuario.click(within(fila("camila@example.cl")).getByRole("button", { name: "Desactivar a Camila Rojas" }));

    expect(await screen.findByText("Usuario no encontrado: 3")).toBeInTheDocument();
    expect(within(fila("camila@example.cl")).getByText("Activo")).toBeInTheDocument();
  });

  it("muestra el error de carga y permite reintentar", async () => {
    const usuario = userEvent.setup();
    usuarioService.listarUsuarios.mockRejectedValueOnce(new Error("No se pudo conectar con el servidor."));
    await abrir();

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo conectar con el servidor.");

    await usuario.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByText("camila@example.cl")).toBeInTheDocument();
  });

  it("si la sesión venció, lleva a la página de sesión requerida", async () => {
    usuarioService.listarUsuarios.mockRejectedValueOnce(Object.assign(new Error("Tu sesión venció"), { estado: 401 }));
    await abrir();

    expect(await screen.findByText("Sesión requerida")).toBeInTheDocument();
  });
});
