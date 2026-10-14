// Pruebas adicionales para la cobertura
import { render, screen } from "@testing-library/react";
import TarjetaConsulta from "./TarjetaConsulta";

describe("TarjetaConsulta", () => {
  const consulta = {
    fecha: "2026-08-12",
    motivo: "Control anual",
    diagnostico: "Paciente sano.",
    medicamentos: "Ninguno",
    veterinario: "Dra. Paula Muñoz",
    proximoControl: "",
  };

  it("muestra motivo, diagnóstico, medicamentos y veterinario", () => {
    render(<TarjetaConsulta consulta={consulta} />);

    expect(screen.getByText("Control anual")).toBeInTheDocument();
    expect(screen.getByText(/Paciente sano\./)).toBeInTheDocument();
    expect(screen.getByText(/Dra\. Paula Muñoz/)).toBeInTheDocument();
  });

  it("muestra el próximo control solo si la consulta lo tiene", () => {
    const { rerender } = render(<TarjetaConsulta consulta={consulta} />);
    expect(screen.queryByText(/Próximo control/)).not.toBeInTheDocument();

    rerender(<TarjetaConsulta consulta={{ ...consulta, proximoControl: "2027-08-12" }} />);
    expect(screen.getByText(/Próximo control/)).toBeInTheDocument();
  });
});
