// Pruebas de la vista de Recepcionista
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import FichasPacientes from "./FichasPacientes";

const CLAVE = "fichasClinicasVeterinariaSanMarcos";
const abrir = () => render(<MemoryRouter initialEntries={["/recepcion/fichas"]}><FichasPacientes /></MemoryRouter>);
const seccion = (titulo) => screen.getByRole("heading", { name: titulo }).closest("div.mb-4");

describe("FichasPacientes", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("muestra la ficha del primer paciente junto a su tutor", () => {
    abrir();

    expect(screen.getByRole("option", { name: /Max \(Perro\) · tutor: Camila Rojas Soto/ })).toBeInTheDocument();
    expect(screen.getByText("Séxtuple canina")).toBeInTheDocument();
  });

  it("no guarda nada solo por abrir la página", () => {
    abrir();

    expect(localStorage.getItem(CLAVE)).toBeNull();
  });

  it("cambia la ficha mostrada al elegir otro paciente", async () => {
    const usuario = userEvent.setup();
    abrir();

    await usuario.selectOptions(screen.getByLabelText("Paciente"), "2");

    expect(screen.getByText("Triple felina")).toBeInTheDocument();
    expect(screen.queryByText("Séxtuple canina")).not.toBeInTheDocument();
  });

  it("registra una vacuna nueva y la guarda en el paciente elegido", async () => {
    const usuario = userEvent.setup();
    abrir();

    await usuario.click(screen.getByRole("button", { name: "Agregar vacuna" }));
    await usuario.type(screen.getByLabelText("Vacuna"), "Rabia");
    fireEvent.change(screen.getByLabelText("Fecha de aplicación"), { target: { value: "2025-05-10" } });
    fireEvent.change(screen.getByLabelText("Próxima dosis"), { target: { value: "2099-05-10" } });
    await usuario.click(screen.getByRole("button", { name: "Guardar registro" }));

    expect(within(seccion("Vacunas")).getByText("Rabia")).toBeInTheDocument();
    const guardadas = JSON.parse(localStorage.getItem(CLAVE));
    expect(guardadas["1"].vacunas.map((v) => v.nombre)).toContain("Rabia");
  });

  it("edita un registro existente", async () => {
    const usuario = userEvent.setup();
    abrir();
    const fila = screen.getByText("Antirrábica").closest("tr");

    await usuario.click(within(fila).getByRole("button", { name: "Editar" }));
    await usuario.clear(screen.getByLabelText("Vacuna"));
    await usuario.type(screen.getByLabelText("Vacuna"), "Antirrábica canina");
    await usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(screen.getByText("Antirrábica canina")).toBeInTheDocument();
    expect(screen.queryByText("Antirrábica")).not.toBeInTheDocument();
  });

  it("registra una consulta con su diagnóstico", async () => {
    const usuario = userEvent.setup();
    abrir();

    await usuario.click(screen.getByRole("button", { name: "Agregar consulta" }));
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2025-06-01" } });
    await usuario.type(screen.getByLabelText("Motivo"), "Cojera");
    await usuario.type(screen.getByLabelText("Diagnóstico"), "Esguince leve");
    await usuario.type(screen.getByLabelText("Veterinario"), "Dr. Soto");
    await usuario.click(screen.getByRole("button", { name: "Guardar registro" }));

    expect(within(seccion("Consultas y tratamientos")).getByText("Cojera")).toBeInTheDocument();
    expect(screen.getByText(/Esguince leve/)).toBeInTheDocument();
  });

  it("elimina un registro solo si se confirma", async () => {
    const usuario = userEvent.setup();
    const confirmar = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    abrir();
    const fila = () => screen.getByText("Antirrábica").closest("tr");

    await usuario.click(within(fila()).getByRole("button", { name: "Eliminar" }));
    expect(screen.getByText("Antirrábica")).toBeInTheDocument();

    await usuario.click(within(fila()).getByRole("button", { name: "Eliminar" }));
    expect(screen.queryByText("Antirrábica")).not.toBeInTheDocument();
    expect(confirmar).toHaveBeenCalledTimes(2);
  });

  it("cierra el formulario al cancelar y al cambiar de paciente", async () => {
    const usuario = userEvent.setup();
    abrir();

    await usuario.click(screen.getByRole("button", { name: "Agregar vacuna" }));
    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByLabelText("Vacuna")).not.toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Agregar vacuna" }));
    await usuario.selectOptions(screen.getByLabelText("Paciente"), "2");
    expect(screen.queryByLabelText("Vacuna")).not.toBeInTheDocument();
  });

  it("indica que no hay pacientes cuando no hay mascotas registradas", () => {
    localStorage.setItem("mascotasVeterinariaSanMarcos", "[]");
    abrir();

    expect(screen.getByText("Todavía no hay pacientes registrados.")).toBeInTheDocument();
  });

  it("muestra 'Sin registros' en un paciente que todavía no tiene ficha", () => {
    const nueva = { id: 99, nombre: "Coco", especie: "Conejo", raza: "", sexo: "Macho", fechaNacimiento: "2024-01-10", peso: 1.5, esterilizado: false, observaciones: "" };
    localStorage.setItem("mascotasVeterinariaSanMarcos", JSON.stringify([nueva]));
    abrir();

    expect(screen.getAllByText("Sin registros.")).toHaveLength(3);
  });
});
