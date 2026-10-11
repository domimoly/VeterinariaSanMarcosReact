// src/components/TarjetaCita.spec.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import TarjetaCita from "./TarjetaCita";

describe("TarjetaCita", () => {
  // Fecha lejana para que la cita siempre cuente como "próxima" y la prueba no caduque
  const cita = {
    id: 7,
    codigo: "SM-000007",
    servicioNombre: "Consulta General",
    mascotaNombre: "Max",
    especie: "Perro",
    fecha: "2099-01-15",
    hora: "10:30",
    precio: "$15.000",
    estado: "Pendiente",
    nota: "",
  };

  it("ejecuta onCancelar con el id de la cita al presionar Cancelar cita", async () => {
    const usuario = userEvent.setup();
    const onCancelar = vi.fn();

    render(<TarjetaCita cita={cita} onCancelar={onCancelar} />);
    await usuario.click(screen.getByRole("button", { name: "Cancelar cita" }));

    expect(onCancelar).toHaveBeenCalledWith(7);
  });
});
