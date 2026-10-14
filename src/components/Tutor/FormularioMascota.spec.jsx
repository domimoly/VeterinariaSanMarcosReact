// Pruebas adicionales para la cobertura
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import FormularioMascota from "./FormularioMascota";

describe("FormularioMascota", () => {
  it("muestra un error por cada campo obligatorio vacío y no guarda", async () => {
    const usuario = userEvent.setup();
    const onGuardar = vi.fn();
    render(<FormularioMascota mascota={null} onGuardar={onGuardar} onCancelar={vi.fn()} />);

    await usuario.click(screen.getByRole("button", { name: "Agregar mascota" }));

    expect(screen.getByText("El nombre es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("Selecciona una especie")).toBeInTheDocument();
    expect(screen.getByText("Selecciona el sexo")).toBeInTheDocument();
    expect(screen.getByText("La fecha de nacimiento es obligatoria")).toBeInTheDocument();
    expect(screen.getByText("El peso es obligatorio")).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it("rechaza un peso mayor a 100 kg", async () => {
    const usuario = userEvent.setup();
    render(<FormularioMascota mascota={null} onGuardar={vi.fn()} onCancelar={vi.fn()} />);

    await usuario.type(screen.getByLabelText("Peso (kg)"), "150");
    await usuario.click(screen.getByRole("button", { name: "Agregar mascota" }));

    expect(screen.getByText("El peso no puede superar los 100 kg")).toBeInTheDocument();
  });

  it("guarda la mascota con el peso como número cuando los datos son válidos", async () => {
    const usuario = userEvent.setup();
    const onGuardar = vi.fn();
    render(<FormularioMascota mascota={null} onGuardar={onGuardar} onCancelar={vi.fn()} />);

    await usuario.type(screen.getByLabelText("Nombre"), "Rocky");
    await usuario.selectOptions(screen.getByLabelText("Especie"), "Perro");
    await usuario.selectOptions(screen.getByLabelText("Sexo"), "Macho");
    fireEvent.change(screen.getByLabelText("Fecha de nacimiento"), { target: { value: "2022-03-10" } });
    await usuario.type(screen.getByLabelText("Peso (kg)"), "12.5");
    await usuario.click(screen.getByRole("button", { name: "Agregar mascota" }));

    expect(onGuardar).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: "Rocky", especie: "Perro", sexo: "Macho", peso: 12.5 })
    );
  });

  it("en modo edición muestra los datos de la mascota y cambia el texto del botón", () => {
    const mascota = {
      id: 1, nombre: "Max", especie: "Perro", raza: "Labrador", sexo: "Macho",
      fechaNacimiento: "2021-03-10", peso: 28, esterilizado: true, observaciones: "",
    };
    render(<FormularioMascota mascota={mascota} onGuardar={vi.fn()} onCancelar={vi.fn()} />);

    expect(screen.getByDisplayValue("Max")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();
  });

  it("avisa al padre cuando se cancela", async () => {
    const usuario = userEvent.setup();
    const onCancelar = vi.fn();
    render(<FormularioMascota mascota={null} onGuardar={vi.fn()} onCancelar={onCancelar} />);

    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancelar).toHaveBeenCalled();
  });
});
