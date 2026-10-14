// Pruebas adicionales para la cobertura
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import PasoMascota from "./PasoMascota";
import { mascotasDemo } from "../../data/Tutor/mascotas";
import { categoriasServicios } from "../../data/servicios";

const citaVacia = { mascota: null, servicio: null, observaciones: "" };

const mostrar = (props = {}) =>
  render(
    <MemoryRouter>
      <PasoMascota mascotas={mascotasDemo} cita={citaVacia} servicioInicial="" onContinuar={vi.fn()} {...props} />
    </MemoryRouter>
  );

describe("PasoMascota", () => {
  it("pide registrar una mascota cuando no hay ninguna", () => {
    mostrar({ mascotas: [] });

    expect(screen.getByRole("link", { name: "Registrar mascota" })).toHaveAttribute("href", "/mi-perfil");
  });

  it("exige elegir mascota y servicio", async () => {
    const usuario = userEvent.setup();
    mostrar();

    await usuario.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByText("Selecciona una mascota")).toBeInTheDocument();
    expect(screen.getByText("Selecciona un servicio")).toBeInTheDocument();
  });

  it("ofrece solo los servicios que corresponden a la especie de la mascota", async () => {
    const usuario = userEvent.setup();
    mostrar();

    await usuario.selectOptions(screen.getByLabelText("Mascota"), "2"); // Luna, gata

    expect(screen.getByText("Vacuna Triple Felina")).toBeInTheDocument();
    expect(screen.queryByText("Vacuna Séxtuple Canina")).not.toBeInTheDocument();
  });

  it("filtra los servicios por categoría", async () => {
    const usuario = userEvent.setup();
    mostrar();
    const vacunas = categoriasServicios.find((c) => c.id === "titulo-vacunas");

    await usuario.selectOptions(screen.getByLabelText("Mascota"), "1"); // Max, perro
    await usuario.selectOptions(screen.getByLabelText("Categoría"), vacunas.titulo);

    expect(screen.getByText("Vacuna Séxtuple Canina")).toBeInTheDocument();
    expect(screen.queryByText("Consulta General")).not.toBeInTheDocument();
  });

  it("entrega mascota, servicio y antecedentes al continuar", async () => {
    const usuario = userEvent.setup();
    const onContinuar = vi.fn();
    mostrar({ onContinuar });

    await usuario.selectOptions(screen.getByLabelText("Mascota"), "2");
    await usuario.click(screen.getByLabelText(/Consulta General/));
    await usuario.type(screen.getByLabelText("Otros antecedentes (opcional)"), "Come poco");
    await usuario.click(screen.getByRole("button", { name: "Continuar" }));

    expect(onContinuar).toHaveBeenCalledWith(
      expect.objectContaining({
        mascota: expect.objectContaining({ nombre: "Luna" }),
        servicio: expect.objectContaining({ id: "consulta-general" }),
        observaciones: "Come poco",
      })
    );
  });

  it("conserva el servicio de la dirección solo si corresponde a la mascota elegida", async () => {
    const usuario = userEvent.setup();
    mostrar({ servicioInicial: "vacuna-triple-felina" });

    expect(screen.getByText(/Elegiste "Vacuna Triple Felina"/)).toBeInTheDocument();
    await usuario.selectOptions(screen.getByLabelText("Mascota"), "2"); // gata: corresponde
    expect(screen.getByLabelText(/Vacuna Triple Felina/)).toBeChecked();

    await usuario.selectOptions(screen.getByLabelText("Mascota"), "1"); // perro: no corresponde
    expect(screen.getByText(/no corresponde a Max/)).toBeInTheDocument();
  });

  it("ofrece las urgencias bloqueadas, con el aviso de llamar a la clínica", async () => {
    const usuario = userEvent.setup();
    mostrar();

    await usuario.selectOptions(screen.getByLabelText("Mascota"), "1");

    expect(screen.getByLabelText(/Consulta Urgencia/)).toBeDisabled();
  });
});
