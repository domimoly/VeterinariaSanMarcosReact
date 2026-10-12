// src/components/TarjetaServicio.spec.jsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TarjetaServicio from "./TarjetaServicio";

describe("TarjetaServicio", () => {
  const urgencia = {
    id: "consulta-urgencia",
    icono: "fa-solid fa-truck-medical",
    nombre: "Consulta Urgencia",
    descripcion: "Atención prioritaria para perros y gatos.",
    duracion: "30 min",
    precio: "$25.000",
    categoriaSlug: "consultas",
    agendable: false,
  };

  it("ofrece llamar a la clínica, y no agendar, cuando el servicio es una urgencia", () => {
    render(
      <MemoryRouter>
        <TarjetaServicio servicio={urgencia} claseIcono="icono-secundario" />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Llamar a la clínica" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Agendar cita" })).not.toBeInTheDocument();
  });
});
