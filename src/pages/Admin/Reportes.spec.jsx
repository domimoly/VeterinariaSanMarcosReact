import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import * as citaService from "../../services/citaService";
import * as mascotaService from "../../services/mascotaService";
import * as usuarioService from "../../services/usuarioService";
import { instalarCitasEnMemoria } from "../../test/citasEnMemoria";
import { instalarMascotasEnMemoria } from "../../test/mascotasEnMemoria";
import { instalarUsuariosEnMemoria } from "../../test/usuariosEnMemoria";
import Reportes from "./Reportes";

vi.mock("../../services/citaService");
vi.mock("../../services/mascotaService");
vi.mock("../../services/usuarioService", async (importarOriginal) => ({
  ...(await importarOriginal()),
  listarUsuarios: vi.fn(),
  crearUsuario: vi.fn(),
  actualizarUsuario: vi.fn(),
  cambiarEstadoUsuario: vi.fn(),
}));

const abrir = async () => {
  render(
    <MemoryRouter initialEntries={["/admin/reportes"]}>
      <Routes>
        <Route path="/admin/reportes" element={<Reportes />} />
        <Route path="/sesion-requerida" element={<p>Sesión requerida</p>} />
      </Routes>
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.queryByText("Cargando reportes...")).not.toBeInTheDocument());
};
const caja = (titulo) => screen.getByRole("heading", { name: new RegExp(titulo) }).closest("section");

describe("Reportes (administración)", () => {
  beforeEach(() => {
    instalarUsuariosEnMemoria(usuarioService);
    instalarMascotasEnMemoria(mascotaService);
    instalarCitasEnMemoria(citaService, [
      { id: 1, estado: "Pendiente", servicioNombre: "Consulta General" },
      { id: 2, estado: "Confirmada", servicioNombre: "Consulta General" },
      { id: 3, estado: "Cancelada", servicioNombre: "Vacuna Triple Felina" },
    ]);
  });

  it("junta lo que entregan ms-auth, ms-citas y ms-mascotas", async () => {
    await abrir();

    expect(usuarioService.listarUsuarios).toHaveBeenCalledTimes(1);
    expect(citaService.listarCitas).toHaveBeenCalledTimes(1);
    expect(mascotaService.listarMascotas).toHaveBeenCalledTimes(1);
  });

  it("muestra los totales", async () => {
    await abrir();
    const totales = screen.getByRole("region", { name: "Totales" });

    expect(within(totales).getByText("Usuarios").nextSibling).toHaveTextContent("4");
    expect(within(totales).getByText("Usuarios activos").nextSibling).toHaveTextContent("3");
    expect(within(totales).getByText("Citas").nextSibling).toHaveTextContent("3");
    expect(within(totales).getByText("Citas pendientes").nextSibling).toHaveTextContent("1");
  });

  it("muestra las citas por estado y los servicios más solicitados sin contar las canceladas", async () => {
    await abrir();

    const estados = within(caja("Citas por estado"));
    expect(estados.getByText("Pendiente").parentElement).toHaveTextContent("1");
    expect(estados.getByText("Reagendada").parentElement).toHaveTextContent("0");

    const servicios = within(caja("Servicios más solicitados"));
    expect(servicios.getByText("Consulta General").parentElement).toHaveTextContent("2");
    expect(servicios.queryByText("Vacuna Triple Felina")).not.toBeInTheDocument();
  });

  it("muestra los usuarios por rol con su etiqueta y las mascotas por especie", async () => {
    await abrir();

    expect(within(caja("Usuarios por rol")).getByText("Tutor").parentElement).toHaveTextContent("2");
    expect(within(caja("Mascotas por especie")).getByText("Perro")).toBeInTheDocument();
    expect(within(caja("Mascotas por especie")).getByText(/en total/)).toBeInTheDocument();
  });

  it("indica cuando todavía no hay datos", async () => {
    instalarCitasEnMemoria(citaService, []);
    instalarMascotasEnMemoria(mascotaService, []);
    await abrir();

    expect(screen.getByText("Todavía no hay citas vigentes.")).toBeInTheDocument();
    expect(screen.getByText("Todavía no hay mascotas registradas.")).toBeInTheDocument();
  });

  it("muestra el error de carga y permite reintentar", async () => {
    const usuario = userEvent.setup();
    citaService.listarCitas.mockRejectedValueOnce(new Error("No se pudo conectar con el servidor."));
    await abrir();

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo conectar con el servidor.");

    await usuario.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByRole("region", { name: "Totales" })).toBeInTheDocument();
  });

  it("si la sesión venció, lleva a la página de sesión requerida", async () => {
    usuarioService.listarUsuarios.mockRejectedValueOnce(Object.assign(new Error("Tu sesión venció"), { estado: 401 }));
    await abrir();

    expect(await screen.findByText("Sesión requerida")).toBeInTheDocument();
  });
});
