import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import FormularioUsuario from "./FormularioUsuario";

const existente = { id: 3, nombre: "Camila Rojas", correo: "camila@example.cl", rol: "TUTOR", activo: true };

const mostrar = (props = {}) =>
  render(<FormularioUsuario onGuardar={vi.fn()} onCancelar={vi.fn()} {...props} />);

describe("FormularioUsuario", () => {
  it("al crear exige nombre, correo y contraseña", async () => {
    const usuario = userEvent.setup();
    const onGuardar = vi.fn();
    mostrar({ onGuardar });

    await usuario.click(screen.getByRole("button", { name: "Crear usuario" }));

    expect(screen.getByText("El nombre es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("El correo es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("La contraseña es obligatoria")).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it("rechaza un correo mal escrito y una contraseña corta", async () => {
    const usuario = userEvent.setup();
    mostrar();

    await usuario.type(screen.getByLabelText("Nombre"), "Ana");
    await usuario.type(screen.getByLabelText("Correo electrónico"), "ana@correo");
    await usuario.type(screen.getByLabelText("Contraseña"), "123");
    await usuario.click(screen.getByRole("button", { name: "Crear usuario" }));

    expect(screen.getByText("El correo no tiene un formato válido")).toBeInTheDocument();
    expect(screen.getByText("La contraseña debe tener entre 6 y 64 caracteres")).toBeInTheDocument();
  });

  it("entrega los datos de la cuenta nueva, con el rol elegido", async () => {
    const usuario = userEvent.setup();
    const onGuardar = vi.fn();
    mostrar({ onGuardar });

    await usuario.type(screen.getByLabelText("Nombre"), "  Ana Pérez ");
    await usuario.type(screen.getByLabelText("Correo electrónico"), "ana@correo.cl");
    await usuario.type(screen.getByLabelText("Contraseña"), "secreta1");
    await usuario.selectOptions(screen.getByLabelText("Rol"), "RECEPCIONISTA");
    await usuario.click(screen.getByRole("button", { name: "Crear usuario" }));

    expect(onGuardar).toHaveBeenCalledWith({
      nombre: "Ana Pérez",
      correo: "ana@correo.cl",
      password: "secreta1",
      rol: "RECEPCIONISTA",
    });
  });

  it("al editar precarga los datos, deja el correo solo de lectura y la contraseña es opcional", async () => {
    const usuario = userEvent.setup();
    const onGuardar = vi.fn();
    mostrar({ usuario: existente, onGuardar });

    expect(screen.getByLabelText("Nombre")).toHaveValue("Camila Rojas");
    expect(screen.getByLabelText("Correo electrónico")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Rol")).toHaveValue("TUTOR");

    await usuario.selectOptions(screen.getByLabelText("Rol"), "RECEPCIONISTA");
    await usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ nombre: "Camila Rojas", rol: "RECEPCIONISTA", password: "" }));
  });

  it("al editar, si se escribe una contraseña nueva, debe tener al menos 6 caracteres", async () => {
    const usuario = userEvent.setup();
    const onGuardar = vi.fn();
    mostrar({ usuario: existente, onGuardar });

    await usuario.type(screen.getByLabelText("Nueva contraseña (opcional)"), "123");
    await usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(screen.getByText("La contraseña debe tener entre 6 y 64 caracteres")).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it("no deja cambiar el rol de la propia cuenta", () => {
    mostrar({ usuario: existente, esCuentaPropia: true });

    expect(screen.getByLabelText("Rol")).toBeDisabled();
    expect(screen.getByText("No puedes cambiar tu propio rol.")).toBeInTheDocument();
  });

  it("muestra el error de la API y bloquea el botón mientras guarda", () => {
    mostrar({ error: "Ya existe una cuenta con ese correo", guardando: true });

    expect(screen.getByRole("alert")).toHaveTextContent("Ya existe una cuenta con ese correo");
    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
  });

  it("avisa cuando se cancela", async () => {
    const usuario = userEvent.setup();
    const onCancelar = vi.fn();
    mostrar({ onCancelar });

    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancelar).toHaveBeenCalled();
  });
});
