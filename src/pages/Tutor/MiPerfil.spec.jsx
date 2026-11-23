import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import * as citaService from "../../services/citaService";
import * as fichaService from "../../services/fichaService";
import * as mascotaService from "../../services/mascotaService";
import * as perfilService from "../../services/perfilService";
import { instalarCitasEnMemoria } from "../../test/citasEnMemoria";
import { instalarFichasEnMemoria } from "../../test/fichasEnMemoria";
import { instalarMascotasEnMemoria } from "../../test/mascotasEnMemoria";
import { instalarPerfilEnMemoria } from "../../test/perfilEnMemoria";
import MiPerfil from "./MiPerfil";

vi.mock("../../services/mascotaService");
vi.mock("../../services/citaService");
vi.mock("../../services/fichaService");
vi.mock("../../services/perfilService");

const abrir = async (ruta = "/mi-perfil") => {
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <MiPerfil />
    </MemoryRouter>
  );
  // Espera a que terminen de cargar las mascotas (ms-mascotas) y las citas (ms-citas)
  await waitFor(() => expect(screen.queryByText("Cargando tus mascotas...")).not.toBeInTheDocument());
  await waitFor(() => expect(screen.queryByText("Cargando tus citas...")).not.toBeInTheDocument());
  await waitFor(() => expect(screen.queryByText("Cargando la ficha...")).not.toBeInTheDocument());
  await waitFor(() => expect(screen.queryByText("Cargando tus datos...")).not.toBeInTheDocument());
};

describe("MiPerfil", () => {
  beforeEach(() => {
    localStorage.clear();
    instalarMascotasEnMemoria(mascotaService);
    instalarCitasEnMemoria(citaService);
    instalarFichasEnMemoria(fichaService);
    instalarPerfilEnMemoria(perfilService);
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

  it("ofrece ir a los pedidos de la tienda y a agendar una cita", async () => {
    await abrir();

    expect(screen.getByRole("link", { name: "Mis pedidos" })).toHaveAttribute("href", "/mis-pedidos");
    expect(screen.getByRole("link", { name: "Agendar cita" })).toHaveAttribute("href", "/agendar-cita");
  });

  it("guarda en ms-auth los cambios de los datos personales", async () => {
    const usuario = userEvent.setup();
    await abrir();
    const seccion = screen.getByRole("heading", { name: "Mis datos personales" }).closest("section");

    await usuario.clear(within(seccion).getByLabelText("Nombre"));
    await usuario.type(within(seccion).getByLabelText("Nombre"), "Camila Andrea");
    await usuario.click(within(seccion).getByRole("button", { name: "Guardar cambios" }));

    expect(await within(seccion).findByText("Tus datos se guardaron correctamente.")).toBeInTheDocument();
    expect(perfilService.guardarPerfil).toHaveBeenCalledWith(expect.objectContaining({ nombre: "Camila Andrea" }));
    // Nada de los datos personales queda en el navegador
    expect(localStorage.getItem("usuarioVeterinariaSanMarcos")).toBeNull();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Camila Andrea");
  });

  it("muestra el motivo si ms-auth rechaza los datos y no confirma el guardado", async () => {
    const usuario = userEvent.setup();
    perfilService.guardarPerfil.mockRejectedValueOnce(new Error("Ya existe una cuenta con ese RUN"));
    await abrir();
    const seccion = screen.getByRole("heading", { name: "Mis datos personales" }).closest("section");

    await usuario.click(within(seccion).getByRole("button", { name: "Guardar cambios" }));

    expect(await within(seccion).findByText("Ya existe una cuenta con ese RUN")).toBeInTheDocument();
    expect(within(seccion).queryByText("Tus datos se guardaron correctamente.")).not.toBeInTheDocument();
  });

  it("si no puede cargar los datos personales, lo avisa y permite reintentar", async () => {
    const usuario = userEvent.setup();
    perfilService.obtenerPerfil.mockRejectedValueOnce(new Error("No se pudo conectar con el servidor."));
    render(
      <MemoryRouter>
        <MiPerfil />
      </MemoryRouter>
    );
    const seccion = (await screen.findByRole("heading", { name: "Mis datos personales" })).closest("section");

    expect(await within(seccion).findByText(/No se pudo conectar con el servidor/)).toBeInTheDocument();
    await usuario.click(within(seccion).getByRole("button", { name: "Reintentar" }));

    expect(await within(seccion).findByLabelText("Nombre")).toHaveValue("Camila");
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

  it("cancela una cita en ms-citas y la pasa al historial como Cancelada", async () => {
    const usuario = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await abrir();
    const tarjeta = () => screen.getByText("Código SM-100001").closest(".tarjeta-cita");

    await usuario.click(within(tarjeta()).getByRole("button", { name: "Cancelar cita" }));

    // La cita pasa de "Próximas" a "Historial": se vuelve a buscar la tarjeta
    expect(within(tarjeta()).getByText("Cancelada")).toBeInTheDocument();
    expect(citaService.cancelarCita).toHaveBeenCalledWith(1);
  });

  it("no cancela la cita si el tutor no confirma", async () => {
    const usuario = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    await abrir();

    await usuario.click(
      within(screen.getByText("Código SM-100001").closest(".tarjeta-cita")).getByRole("button", { name: "Cancelar cita" })
    );

    expect(citaService.cancelarCita).not.toHaveBeenCalled();
  });

  it("invita a agendar cuando no hay citas", async () => {
    instalarCitasEnMemoria(citaService, []);
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
    instalarCitasEnMemoria(citaService);
    instalarFichasEnMemoria(fichaService);
    instalarPerfilEnMemoria(perfilService);
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

describe("MiPerfil: errores del servicio de citas", () => {
  beforeEach(() => {
    localStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();
    instalarMascotasEnMemoria(mascotaService);
    instalarCitasEnMemoria(citaService);
    instalarFichasEnMemoria(fichaService);
    instalarPerfilEnMemoria(perfilService);
  });
  afterEach(() => vi.restoreAllMocks());

  const mostrar = () =>
    render(
      <MemoryRouter initialEntries={["/mi-perfil"]}>
        <Routes>
          <Route path="/mi-perfil" element={<MiPerfil />} />
          <Route path="/sesion-requerida" element={<p>Sesión requerida</p>} />
        </Routes>
      </MemoryRouter>
    );

  it("muestra el error de carga de las citas y permite reintentar", async () => {
    const usuario = userEvent.setup();
    citaService.listarCitas.mockRejectedValueOnce(new Error("No se pudo conectar con el servidor."));
    mostrar();

    const seccion = (await screen.findByRole("heading", { name: "Mis citas" })).closest("section");
    expect(await within(seccion).findByText(/No se pudo conectar con el servidor/)).toBeInTheDocument();

    await usuario.click(within(seccion).getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByText("Código SM-100001")).toBeInTheDocument();
  });

  it("si falla al cancelar, muestra el motivo y la cita sigue vigente", async () => {
    const usuario = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    citaService.cancelarCita.mockRejectedValueOnce(new Error("No se puede cancelar una cita que ya comenzó"));
    mostrar();

    const tarjeta = (await screen.findByText("Código SM-100001")).closest(".tarjeta-cita");
    await usuario.click(within(tarjeta).getByRole("button", { name: "Cancelar cita" }));

    expect(await screen.findByText("No se puede cancelar una cita que ya comenzó")).toBeInTheDocument();
    expect(within(screen.getByText("Código SM-100001").closest(".tarjeta-cita")).queryByText("Cancelada")).not.toBeInTheDocument();
  });

  it("si la sesión venció al cargar las citas, lleva a la página de sesión requerida", async () => {
    citaService.listarCitas.mockRejectedValueOnce(Object.assign(new Error("Tu sesión venció"), { estado: 401 }));
    mostrar();

    expect(await screen.findByText("Sesión requerida")).toBeInTheDocument();
  });
});
