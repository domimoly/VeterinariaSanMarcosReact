// Pruebas de la vista de Recepcionista
import { fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import * as fichaService from "../../services/fichaService";
import * as mascotaService from "../../services/mascotaService";
import { instalarFichasEnMemoria } from "../../test/fichasEnMemoria";
import { instalarMascotasEnMemoria } from "../../test/mascotasEnMemoria";
import FichasPacientes from "./FichasPacientes";

vi.mock("../../services/mascotaService");
vi.mock("../../services/fichaService");

let memoria;
const abrir = async () => {
  render(
    <MemoryRouter initialEntries={["/recepcion/fichas"]}>
      <Routes>
        <Route path="/recepcion/fichas" element={<FichasPacientes />} />
        <Route path="/sesion-requerida" element={<p>Sesión requerida</p>} />
      </Routes>
    </MemoryRouter>
  );
  // Espera a que lleguen los pacientes (ms-mascotas) y su ficha (ms-fichas)
  await waitFor(() => expect(screen.queryByText("Cargando pacientes...")).not.toBeInTheDocument());
  await waitFor(() => expect(screen.queryByText("Cargando la ficha...")).not.toBeInTheDocument());
};
const seccion = (titulo) => screen.getByRole("heading", { name: titulo }).closest("div.mb-4");

describe("FichasPacientes", () => {
  beforeEach(() => {
    localStorage.clear();
    instalarMascotasEnMemoria(mascotaService);
    memoria = instalarFichasEnMemoria(fichaService);
  });
  afterEach(() => vi.restoreAllMocks());

  it("muestra la ficha del primer paciente junto a su tutor", async () => {
    await abrir();

    expect(screen.getByRole("option", { name: /Max \(Perro\) · tutor: camila.rojas@example.cl/ })).toBeInTheDocument();
    expect(screen.getByText("Séxtuple canina")).toBeInTheDocument();
  });

  it("no guarda nada solo por abrir la página", async () => {
    await abrir();

    expect(fichaService.crearRegistro).not.toHaveBeenCalled();
    expect(fichaService.actualizarRegistro).not.toHaveBeenCalled();
    expect(localStorage.getItem("fichasClinicasVeterinariaSanMarcos")).toBeNull();
  });

  it("cambia la ficha mostrada al elegir otro paciente", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.selectOptions(screen.getByLabelText("Paciente"), "2");

    expect(await screen.findByText("Triple felina")).toBeInTheDocument();
    expect(screen.queryByText("Séxtuple canina")).not.toBeInTheDocument();
    expect(fichaService.listarFicha).toHaveBeenCalledWith(2);
  });

  it("registra una vacuna nueva en ms-fichas para el paciente elegido", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.click(screen.getByRole("button", { name: "Agregar vacuna" }));
    await usuario.type(screen.getByLabelText("Vacuna"), "Rabia");
    fireEvent.change(screen.getByLabelText("Fecha de aplicación"), { target: { value: "2025-05-10" } });
    fireEvent.change(screen.getByLabelText("Próxima dosis"), { target: { value: "2099-05-10" } });
    await usuario.click(screen.getByRole("button", { name: "Guardar registro" }));

    expect(await within(seccion("Vacunas")).findByText("Rabia")).toBeInTheDocument();
    expect(fichaService.crearRegistro).toHaveBeenCalledWith(1, "vacunas", {
      nombre: "Rabia",
      fecha: "2025-05-10",
      proximaDosis: "2099-05-10",
    });
    expect(memoria.fichas()[1].vacunas.map((v) => v.nombre)).toContain("Rabia");
  });

  it("edita un registro existente", async () => {
    const usuario = userEvent.setup();
    await abrir();
    const fila = screen.getByText("Antirrábica").closest("tr");

    await usuario.click(within(fila).getByRole("button", { name: "Editar" }));
    await usuario.clear(screen.getByLabelText("Vacuna"));
    await usuario.type(screen.getByLabelText("Vacuna"), "Antirrábica canina");
    await usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(await screen.findByText("Antirrábica canina")).toBeInTheDocument();
    expect(screen.queryByText("Antirrábica")).not.toBeInTheDocument();
    expect(fichaService.actualizarRegistro).toHaveBeenCalledWith(2, 1, "vacunas", expect.objectContaining({ nombre: "Antirrábica canina" }));
  });

  it("registra una consulta con su diagnóstico", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.click(screen.getByRole("button", { name: "Agregar consulta" }));
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2025-06-01" } });
    await usuario.type(screen.getByLabelText("Motivo"), "Cojera");
    await usuario.type(screen.getByLabelText("Diagnóstico"), "Esguince leve");
    await usuario.type(screen.getByLabelText("Veterinario"), "Dr. Soto");
    await usuario.click(screen.getByRole("button", { name: "Guardar registro" }));

    expect(await within(seccion("Consultas y tratamientos")).findByText("Cojera")).toBeInTheDocument();
    expect(screen.getByText(/Esguince leve/)).toBeInTheDocument();
  });

  it("elimina un registro solo si se confirma", async () => {
    const usuario = userEvent.setup();
    const confirmar = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    await abrir();
    const fila = () => screen.getByText("Antirrábica").closest("tr");

    await usuario.click(within(fila()).getByRole("button", { name: "Eliminar" }));
    expect(screen.getByText("Antirrábica")).toBeInTheDocument();

    await usuario.click(within(fila()).getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(screen.queryByText("Antirrábica")).not.toBeInTheDocument());
    expect(fichaService.eliminarRegistro).toHaveBeenCalledWith(2);
    expect(confirmar).toHaveBeenCalledTimes(2);
  });

  it("cierra el formulario al cancelar y al cambiar de paciente", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.click(screen.getByRole("button", { name: "Agregar vacuna" }));
    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByLabelText("Vacuna")).not.toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Agregar vacuna" }));
    await usuario.selectOptions(screen.getByLabelText("Paciente"), "2");
    expect(screen.queryByLabelText("Vacuna")).not.toBeInTheDocument();
    await screen.findByText("Triple felina");
  });

  it("indica que no hay pacientes cuando no hay mascotas registradas", async () => {
    instalarMascotasEnMemoria(mascotaService, []);
    await abrir();

    expect(screen.getByText("Todavía no hay pacientes registrados.")).toBeInTheDocument();
  });

  it("muestra 'Sin registros' en un paciente que todavía no tiene ficha", async () => {
    const nueva = { id: 99, nombre: "Coco", especie: "Conejo", raza: "", sexo: "Macho", fechaNacimiento: "2024-01-10", peso: 1.5, esterilizado: false, observaciones: "" };
    instalarMascotasEnMemoria(mascotaService, [nueva]);
    await abrir();

    expect(screen.getAllByText("Sin registros.")).toHaveLength(3);
  });

  describe("errores del servicio de fichas", () => {
    it("si falla al guardar, muestra el motivo y deja el formulario abierto", async () => {
      const usuario = userEvent.setup();
      fichaService.crearRegistro.mockRejectedValueOnce(new Error("La próxima dosis debe ser posterior a la fecha de aplicación"));
      await abrir();

      await usuario.click(screen.getByRole("button", { name: "Agregar vacuna" }));
      await usuario.type(screen.getByLabelText("Vacuna"), "Rabia");
      fireEvent.change(screen.getByLabelText("Fecha de aplicación"), { target: { value: "2025-05-10" } });
      fireEvent.change(screen.getByLabelText("Próxima dosis"), { target: { value: "2099-05-10" } });
      await usuario.click(screen.getByRole("button", { name: "Guardar registro" }));

      expect(await screen.findByText("La próxima dosis debe ser posterior a la fecha de aplicación")).toBeInTheDocument();
      expect(screen.getByLabelText("Vacuna")).toBeInTheDocument();
    });

    it("muestra el error de carga de la ficha y permite reintentar", async () => {
      const usuario = userEvent.setup();
      await abrir();
      fichaService.listarFicha.mockRejectedValueOnce(new Error("No se pudo conectar con el servidor."));

      await usuario.selectOptions(screen.getByLabelText("Paciente"), "2");
      expect(await screen.findByText(/No se pudo conectar con el servidor/)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Agregar vacuna" })).not.toBeInTheDocument();

      await usuario.click(screen.getByRole("button", { name: "Reintentar" }));
      expect(await screen.findByText("Triple felina")).toBeInTheDocument();
    });

    it("si la sesión venció, lleva a la página de sesión requerida", async () => {
      fichaService.listarFicha.mockRejectedValueOnce(Object.assign(new Error("Tu sesión venció"), { estado: 401 }));
      render(
        <MemoryRouter initialEntries={["/recepcion/fichas"]}>
          <Routes>
            <Route path="/recepcion/fichas" element={<FichasPacientes />} />
            <Route path="/sesion-requerida" element={<p>Sesión requerida</p>} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText("Sesión requerida")).toBeInTheDocument();
    });
  });
});
