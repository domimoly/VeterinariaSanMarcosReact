// Pruebas adicionales para la cobertura
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import CitaSolicitada from "./CitaSolicitada";

const crearSolicitud = (medio) => ({
  codigo: "SM-123456",
  mascotaNombre: "Max",
  especie: "Perro",
  servicioNombre: "Consulta General",
  fecha: "2026-10-12",
  hora: "10:30",
  precio: "$15.000",
  estado: "Pendiente",
  tutor: { medioRecordatorio: medio, correo: "camila@correo.cl", telefono: "+56912345678" },
});

describe("CitaSolicitada", () => {
  it("confirma el envío, muestra el código y avisa por correo cuando ese fue el medio elegido", () => {
    render(<MemoryRouter><CitaSolicitada solicitud={crearSolicitud("Correo")} onAgendarOtra={vi.fn()} /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: "¡Solicitud enviada!" })).toBeInTheDocument();
    expect(screen.getByText("Código de solicitud: SM-123456")).toBeInTheDocument();
    expect(screen.getByText(/por correo a/)).toBeInTheDocument();
    expect(screen.getByText("camila@correo.cl")).toBeInTheDocument();
  });

  it("avisa por teléfono cuando ese fue el medio elegido", () => {
    render(<MemoryRouter><CitaSolicitada solicitud={crearSolicitud("Teléfono")} onAgendarOtra={vi.fn()} /></MemoryRouter>);

    expect(screen.getByText(/por teléfono al/)).toBeInTheDocument();
    expect(screen.getByText("+56912345678")).toBeInTheDocument();
  });

  it("permite agendar otra cita y ver las citas", async () => {
    const usuario = userEvent.setup();
    const onAgendarOtra = vi.fn();
    render(<MemoryRouter><CitaSolicitada solicitud={crearSolicitud("Correo")} onAgendarOtra={onAgendarOtra} /></MemoryRouter>);

    await usuario.click(screen.getByRole("button", { name: "Agendar otra cita" }));

    expect(onAgendarOtra).toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "Ver mis citas" })).toHaveAttribute("href", "/mi-perfil#mis-citas");
  });
});
