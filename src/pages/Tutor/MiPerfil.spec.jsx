import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import * as mascotaService from "../../services/mascotaService";
import { instalarMascotasEnMemoria } from "../../test/mascotasEnMemoria";
import MiPerfil from "./MiPerfil";

vi.mock("../../services/mascotaService");

const abrir = async (ruta = "/mi-perfil") => {
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <MiPerfil />
    </MemoryRouter>
  );
  // Espera a que terminen de cargar las mascotas (vienen de ms-mascotas)
  await waitFor(() => expect(screen.queryByText("Cargando tus mascotas...")).not.toBeInTheDocument());
};

describe("MiPerfil", () => {
  beforeEach(() => {
    localStorage.clear();
    instalarMascotasEnMemoria(mascotaService);
    Element.prototype.scrollIntoView = vi.fn(); // jsdom no la implementa
  });
  afterEach(() => vi.restoreAllMocks());

  it("muestra las cuatro secciones del perfil", async () => {
    await abrir();

    expect(screen.getByRole("heading", { name: "Mis datos personales" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mis mascotas" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mis citas" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ficha clínica" })).toBeInTheDocument();
  });

  it("guarda en localStorage los cambios de los datos personales", async () => {
    const usuario = userEvent.setup();
    await abrir();
    const seccion = screen.getByRole("heading", { name: "Mis datos personales" }).closest("section");

    await usuario.clear(within(seccion).getByLabelText("Nombre"));
    await usuario.type(within(seccion).getByLabelText("Nombre"), "Camila Andrea");
    await usuario.click(within(seccion).getByRole("button", { name: "Guardar cambios" }));

    expect(JSON.parse(localStorage.getItem("usuarioVeterinariaSanMarcos")).nombre).toBe("Camila Andrea");
  });

  it("agrega una mascota nueva y la envía al servicio de mascotas", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.click(screen.getByRole("button", { name: "Agregar mascota" }));
    const formulario = screen.getByRole("heading", { name: "Nueva mascota" }).closest(".mascota-formulario-caja");
    await usuario.type(within(formulario).getByLabelText("Nombre"), "Coco");
    await usuario.selectOptions(within(formulario).getByLabelText("Especie"), "Conejo");
    await usuario.selectOptions(within(formulario).getByLabelText("Sexo"), "Macho");
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.change(within(formulario).getByLabelText("Fecha de nacimiento"), { target: { value: "2024-01-10" } });
    await usuario.type(within(formulario).getByLabelText("Peso (kg)"), "1.5");
    await usuario.click(within(formulario).getByRole("button", { name: "Agregar mascota" }));

    expect(await screen.findByRole("heading", { name: "Coco" })).toBeInTheDocument();
    expect(mascotaService.crearMascota).toHaveBeenCalledWith(expect.objectContaining({ nombre: "Coco", especie: "Conejo", peso: 1.5 }));
  });

  it("elimina una mascota solo si el usuario lo confirma", async () => {
    const usuario = userEvent.setup();
    const confirmar = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    await abrir();
    const tarjeta = () => screen.getByRole("heading", { name: "Max" }).closest(".tarjeta-mascota");

    await usuario.click(within(tarjeta()).getByRole("button", { name: "Eliminar" }));
    expect(screen.getByRole("heading", { name: "Max" })).toBeInTheDocument(); // dijo que no

    await usuario.click(within(tarjeta()).getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Max" })).not.toBeInTheDocument());
    expect(mascotaService.eliminarMascota).toHaveBeenCalledTimes(1);
    expect(confirmar).toHaveBeenCalledTimes(2);
  });

  it("cancela una cita y la guarda como Cancelada", async () => {
    const usuario = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await abrir();
    const tarjeta = () => screen.getByText("Código SM-100001").closest(".tarjeta-cita");

    await usuario.click(within(tarjeta()).getByRole("button", { name: "Cancelar cita" }));

    // La cita pasa de "Próximas" a "Historial": se vuelve a buscar la tarjeta
    expect(within(tarjeta()).getByText("Cancelada")).toBeInTheDocument();
    const guardadas = JSON.parse(localStorage.getItem("citasVeterinariaSanMarcos"));
    expect(guardadas.find((cita) => cita.id === 1).estado).toBe("Cancelada");
  });

  it("invita a agendar cuando no hay citas", async () => {
    localStorage.setItem("citasVeterinariaSanMarcos", "[]");
    await abrir();

    expect(screen.getByText("Aún no has solicitado citas.")).toBeInTheDocument();
  });

  it("hace scroll a la sección indicada en la dirección (#mis-citas)", async () => {
    await abrir("/mi-perfil#mis-citas");

    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("no se rompe con un fragmento inválido en la dirección", async () => {
    await abrir("/mi-perfil#123");

    expect(screen.getByRole("heading", { name: "Mis citas" })).toBeInTheDocument();
  });
});

describe("MiPerfil: errores del servicio de mascotas", () => {
  beforeEach(() => {
    localStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();
    instalarMascotasEnMemoria(mascotaService);
  });
  afterEach(() => vi.restoreAllMocks());

  it("muestra el error de carga y permite reintentar", async () => {
    const usuario = userEvent.setup();
    mascotaService.listarMascotas.mockRejectedValueOnce(new Error("No se pudo conectar con el servidor."));
    render(
      <MemoryRouter>
        <MiPerfil />
      </MemoryRouter>
    );

    expect(await screen.findByText(/No se pudo conectar con el servidor/)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Max" })).not.toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByRole("heading", { name: "Max" })).toBeInTheDocument();
  });

  it("si falla al guardar, muestra el error y deja el formulario abierto", async () => {
    const usuario = userEvent.setup();
    mascotaService.actualizarMascota.mockRejectedValueOnce(new Error("Esta mascota pertenece a otro tutor"));
    await abrir();

    const tarjeta = screen.getByRole("heading", { name: "Max" }).closest(".tarjeta-mascota");
    await usuario.click(within(tarjeta).getByRole("button", { name: "Editar" }));
    const formulario = screen.getByRole("heading", { name: "Editar mascota" }).closest(".mascota-formulario-caja");
    await usuario.click(within(formulario).getByRole("button", { name: "Guardar cambios" }));

    expect(await screen.findByText("Esta mascota pertenece a otro tutor")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Editar mascota" })).toBeInTheDocument();
  });

  it("si la sesión venció, lleva a la página de sesión requerida", async () => {
    mascotaService.listarMascotas.mockRejectedValueOnce(Object.assign(new Error("Tu sesión venció"), { estado: 401 }));
    render(
      <MemoryRouter initialEntries={["/mi-perfil"]}>
        <Routes>
          <Route path="/mi-perfil" element={<MiPerfil />} />
          <Route path="/sesion-requerida" element={<p>Sesión requerida</p>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Sesión requerida")).toBeInTheDocument();
  });
});
