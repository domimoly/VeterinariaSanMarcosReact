import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import MiPerfil from "./MiPerfil";

const abrir = (ruta = "/mi-perfil") =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <MiPerfil />
    </MemoryRouter>
  );

describe("MiPerfil", () => {
  beforeEach(() => {
    localStorage.clear();
    Element.prototype.scrollIntoView = vi.fn(); // jsdom no la implementa
  });
  afterEach(() => vi.restoreAllMocks());

  it("muestra las cuatro secciones del perfil", () => {
    abrir();

    expect(screen.getByRole("heading", { name: "Mis datos personales" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mis mascotas" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mis citas" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ficha clínica" })).toBeInTheDocument();
  });

  it("guarda en localStorage los cambios de los datos personales", async () => {
    const usuario = userEvent.setup();
    abrir();
    const seccion = screen.getByRole("heading", { name: "Mis datos personales" }).closest("section");

    await usuario.clear(within(seccion).getByLabelText("Nombre"));
    await usuario.type(within(seccion).getByLabelText("Nombre"), "Camila Andrea");
    await usuario.click(within(seccion).getByRole("button", { name: "Guardar cambios" }));

    expect(JSON.parse(localStorage.getItem("usuarioVeterinariaSanMarcos")).nombre).toBe("Camila Andrea");
  });

  it("agrega una mascota nueva y la guarda", async () => {
    const usuario = userEvent.setup();
    abrir();

    await usuario.click(screen.getByRole("button", { name: "Agregar mascota" }));
    const formulario = screen.getByRole("heading", { name: "Nueva mascota" }).closest(".mascota-formulario-caja");
    await usuario.type(within(formulario).getByLabelText("Nombre"), "Coco");
    await usuario.selectOptions(within(formulario).getByLabelText("Especie"), "Conejo");
    await usuario.selectOptions(within(formulario).getByLabelText("Sexo"), "Macho");
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.change(within(formulario).getByLabelText("Fecha de nacimiento"), { target: { value: "2024-01-10" } });
    await usuario.type(within(formulario).getByLabelText("Peso (kg)"), "1.5");
    await usuario.click(within(formulario).getByRole("button", { name: "Agregar mascota" }));

    expect(screen.getByRole("heading", { name: "Coco" })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("mascotasVeterinariaSanMarcos"))).toHaveLength(3);
  });

  it("elimina una mascota solo si el usuario lo confirma", async () => {
    const usuario = userEvent.setup();
    const confirmar = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    abrir();
    const tarjeta = () => screen.getByRole("heading", { name: "Max" }).closest(".tarjeta-mascota");

    await usuario.click(within(tarjeta()).getByRole("button", { name: "Eliminar" }));
    expect(screen.getByRole("heading", { name: "Max" })).toBeInTheDocument(); // dijo que no

    await usuario.click(within(tarjeta()).getByRole("button", { name: "Eliminar" }));
    expect(screen.queryByRole("heading", { name: "Max" })).not.toBeInTheDocument();
    expect(confirmar).toHaveBeenCalledTimes(2);
  });

  it("cancela una cita y la guarda como Cancelada", async () => {
    const usuario = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    abrir();
    const tarjeta = () => screen.getByText("Código SM-100001").closest(".tarjeta-cita");

    await usuario.click(within(tarjeta()).getByRole("button", { name: "Cancelar cita" }));

    // La cita pasa de "Próximas" a "Historial": se vuelve a buscar la tarjeta
    expect(within(tarjeta()).getByText("Cancelada")).toBeInTheDocument();
    const guardadas = JSON.parse(localStorage.getItem("citasVeterinariaSanMarcos"));
    expect(guardadas.find((cita) => cita.id === 1).estado).toBe("Cancelada");
  });

  it("invita a agendar cuando no hay citas", () => {
    localStorage.setItem("citasVeterinariaSanMarcos", "[]");
    abrir();

    expect(screen.getByText("Aún no has solicitado citas.")).toBeInTheDocument();
  });

  it("hace scroll a la sección indicada en la dirección (#mis-citas)", () => {
    abrir("/mi-perfil#mis-citas");

    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("no se rompe con un fragmento inválido en la dirección", () => {
    abrir("/mi-perfil#123");

    expect(screen.getByRole("heading", { name: "Mis citas" })).toBeInTheDocument();
  });
});
