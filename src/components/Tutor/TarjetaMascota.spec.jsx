// Pruebas adicionales para la cobertura
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import TarjetaMascota from "./TarjetaMascota";

describe("TarjetaMascota", () => {
  const mascota = {
    id: 1,
    nombre: "Max",
    especie: "Perro",
    raza: "Labrador",
    sexo: "Macho",
    fechaNacimiento: "2024-10-05",
    peso: 28,
    esterilizado: true,
    observaciones: "",
  };

  beforeEach(() => {
    // Reloj fijo: la edad se calcula con la fecha de hoy
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-05T10:00:00"));
  });
  afterEach(() => vi.useRealTimers());

  it("muestra sus datos y calcula la edad desde la fecha de nacimiento", () => {
    render(<TarjetaMascota mascota={mascota} onEditar={vi.fn()} onEliminar={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Max" })).toBeInTheDocument();
    expect(screen.getByText("Perro · Labrador")).toBeInTheDocument();
    expect(screen.getByText(/2 años/)).toBeInTheDocument();
    expect(screen.getByText(/28 kg/)).toBeInTheDocument();
  });

  it("indica 'Sin raza definida' y 'Ninguna' cuando faltan raza y observaciones", () => {
    render(<TarjetaMascota mascota={{ ...mascota, raza: "" }} onEditar={vi.fn()} onEliminar={vi.fn()} />);

    expect(screen.getByText("Perro · Sin raza definida")).toBeInTheDocument();
    expect(screen.getByText(/Ninguna/)).toBeInTheDocument();
  });

  it("avisa al padre qué mascota se quiere editar o eliminar", async () => {
    const usuario = userEvent.setup();
    const onEditar = vi.fn();
    const onEliminar = vi.fn();
    render(<TarjetaMascota mascota={mascota} onEditar={onEditar} onEliminar={onEliminar} />);

    await usuario.click(screen.getByRole("button", { name: "Editar" }));
    await usuario.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(onEditar).toHaveBeenCalledWith(mascota);
    expect(onEliminar).toHaveBeenCalledWith(1);
  });
});
