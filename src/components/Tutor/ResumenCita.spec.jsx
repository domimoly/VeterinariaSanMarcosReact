// Pruebas adicionales para la cobertura
import { render, screen } from "@testing-library/react";
import ResumenCita from "./ResumenCita";

describe("ResumenCita", () => {
  it("marca como pendientes los datos que aún no se eligen", () => {
    const cita = { mascota: null, servicio: null, fecha: "", hora: "", tutor: null };
    render(<ResumenCita cita={cita} />);

    expect(screen.getAllByText("Pendiente").length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("muestra mascota, servicio, tutor y valor cuando ya fueron elegidos", () => {
    const cita = {
      mascota: { nombre: "Max", especie: "Perro" },
      servicio: { nombre: "Consulta General", duracion: "30 min", precio: "$15.000" },
      fecha: "2026-10-12",
      hora: "10:30",
      tutor: { nombre: "Camila", apellidos: "Rojas Soto" },
    };
    render(<ResumenCita cita={cita} />);

    expect(screen.getByText("Max (Perro)")).toBeInTheDocument();
    expect(screen.getByText("Consulta General")).toBeInTheDocument();
    expect(screen.getByText("Camila Rojas Soto")).toBeInTheDocument();
    expect(screen.getByText("$15.000")).toBeInTheDocument();
    expect(screen.getByText(/a las 10:30/)).toBeInTheDocument();
  });
});
