// Pruebas de la vista de Recepcionista
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import FormularioRegistroClinico from "./FormularioRegistroClinico";

const fecha = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });

describe("FormularioRegistroClinico (vacunas y desparasitaciones)", () => {
  it("exige nombre, fecha de aplicación y próxima dosis", async () => {
    const usuario = userEvent.setup();
    const onGuardar = vi.fn();
    render(<FormularioRegistroClinico tipo="vacunas" registro={null} onGuardar={onGuardar} onCancelar={vi.fn()} />);

    await usuario.click(screen.getByRole("button", { name: "Guardar registro" }));

    expect(screen.getByText("El nombre es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("La fecha de aplicación es obligatoria")).toBeInTheDocument();
    expect(screen.getByText("La próxima dosis es obligatoria")).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it("rechaza una fecha de aplicación futura", async () => {
    const usuario = userEvent.setup();
    render(<FormularioRegistroClinico tipo="vacunas" registro={null} onGuardar={vi.fn()} onCancelar={vi.fn()} />);

    await usuario.type(screen.getByLabelText("Vacuna"), "Antirrábica");
    fecha("Fecha de aplicación", "2099-01-01");
    fecha("Próxima dosis", "2100-01-01");
    await usuario.click(screen.getByRole("button", { name: "Guardar registro" }));

    expect(screen.getByText("La fecha no puede ser futura")).toBeInTheDocument();
  });

  it("rechaza una próxima dosis que no es posterior a la aplicación", async () => {
    const usuario = userEvent.setup();
    render(<FormularioRegistroClinico tipo="vacunas" registro={null} onGuardar={vi.fn()} onCancelar={vi.fn()} />);

    await usuario.type(screen.getByLabelText("Vacuna"), "Antirrábica");
    fecha("Fecha de aplicación", "2025-05-10");
    fecha("Próxima dosis", "2025-05-10");
    await usuario.click(screen.getByRole("button", { name: "Guardar registro" }));

    expect(screen.getByText("Debe ser posterior a la fecha de aplicación")).toBeInTheDocument();
  });

  it("entrega el registro cuando los datos son válidos", async () => {
    const usuario = userEvent.setup();
    const onGuardar = vi.fn();
    render(<FormularioRegistroClinico tipo="desparasitaciones" registro={null} onGuardar={onGuardar} onCancelar={vi.fn()} />);

    await usuario.type(screen.getByLabelText("Producto"), "Antipulgas");
    fecha("Fecha de aplicación", "2025-05-10");
    fecha("Próxima dosis", "2025-08-10");
    await usuario.click(screen.getByRole("button", { name: "Guardar registro" }));

    expect(onGuardar).toHaveBeenCalledWith({ nombre: "Antipulgas", fecha: "2025-05-10", proximaDosis: "2025-08-10" });
  });

  it("en modo edición muestra los datos y cambia el texto del botón", () => {
    const registro = { id: 1, nombre: "Antirrábica", fecha: "2025-05-10", proximaDosis: "2026-05-10" };
    render(<FormularioRegistroClinico tipo="vacunas" registro={registro} onGuardar={vi.fn()} onCancelar={vi.fn()} />);

    expect(screen.getByDisplayValue("Antirrábica")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();
  });

  it("avisa cuando se cancela", async () => {
    const usuario = userEvent.setup();
    const onCancelar = vi.fn();
    render(<FormularioRegistroClinico tipo="vacunas" registro={null} onGuardar={vi.fn()} onCancelar={onCancelar} />);

    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancelar).toHaveBeenCalled();
  });
});

describe("FormularioRegistroClinico (consultas)", () => {
  it("exige fecha, motivo, diagnóstico y veterinario", async () => {
    const usuario = userEvent.setup();
    render(<FormularioRegistroClinico tipo="consultas" registro={null} onGuardar={vi.fn()} onCancelar={vi.fn()} />);

    await usuario.click(screen.getByRole("button", { name: "Guardar registro" }));

    expect(screen.getByText("La fecha es obligatoria")).toBeInTheDocument();
    expect(screen.getByText("El motivo es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("El diagnóstico es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("El veterinario es obligatorio")).toBeInTheDocument();
  });

  it("rechaza un próximo control que no es posterior a la consulta", async () => {
    const usuario = userEvent.setup();
    render(<FormularioRegistroClinico tipo="consultas" registro={null} onGuardar={vi.fn()} onCancelar={vi.fn()} />);

    fecha("Fecha", "2025-05-10");
    await usuario.type(screen.getByLabelText("Motivo"), "Control");
    await usuario.type(screen.getByLabelText("Diagnóstico"), "Sano");
    await usuario.type(screen.getByLabelText("Veterinario"), "Dra. Muñoz");
    fecha("Próximo control (opcional)", "2025-05-01");
    await usuario.click(screen.getByRole("button", { name: "Guardar registro" }));

    expect(screen.getByText("Debe ser posterior a la fecha de la consulta")).toBeInTheDocument();
  });

  it("anota 'Ninguno' cuando no se indican medicamentos", async () => {
    const usuario = userEvent.setup();
    const onGuardar = vi.fn();
    render(<FormularioRegistroClinico tipo="consultas" registro={null} onGuardar={onGuardar} onCancelar={vi.fn()} />);

    fecha("Fecha", "2025-05-10");
    await usuario.type(screen.getByLabelText("Motivo"), "Control anual");
    await usuario.type(screen.getByLabelText("Diagnóstico"), "Paciente sano");
    await usuario.type(screen.getByLabelText("Veterinario"), "Dra. Muñoz");
    await usuario.click(screen.getByRole("button", { name: "Guardar registro" }));

    expect(onGuardar).toHaveBeenCalledWith(
      expect.objectContaining({ motivo: "Control anual", medicamentos: "Ninguno", veterinario: "Dra. Muñoz" })
    );
  });
});
