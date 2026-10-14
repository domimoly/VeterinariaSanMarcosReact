import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import FormularioContacto from "./FormularioContacto";

const llenar = async (usuario, datos) => {
  const campos = { Nombre: datos.nombre, Apellido: datos.apellido, Correo: datos.correo, Comentario: datos.comentario };
  for (const [etiqueta, valor] of Object.entries(campos)) {
    if (valor) await usuario.type(screen.getByLabelText(etiqueta), valor);
  }
};

const validos = { nombre: "Camila", apellido: "Rojas", correo: "camila@correo.cl", comentario: "Quisiera consultar por una vacuna." };

describe("FormularioContacto", () => {
  it("marca como obligatorios los cuatro campos vacíos", async () => {
    const usuario = userEvent.setup();
    render(<FormularioContacto onEnviar={vi.fn()} />);

    await usuario.click(screen.getByRole("button", { name: "Enviar" }));

    expect(screen.getByText("El nombre es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("El apellido es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("El correo es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("Cuéntanos brevemente tu duda o comentario")).toBeInTheDocument();
    expect(screen.getByText("Revisa los campos marcados")).toBeInTheDocument();
  });

  it("rechaza un nombre de una sola letra", async () => {
    const usuario = userEvent.setup();
    render(<FormularioContacto onEnviar={vi.fn()} />);

    await llenar(usuario, { ...validos, nombre: "C" });
    await usuario.click(screen.getByRole("button", { name: "Enviar" }));

    expect(screen.getByText("Mínimo 2 caracteres", { selector: ".invalid-feedback" })).toBeInTheDocument();
  });

  it("rechaza un correo sin punto en el dominio", async () => {
    const usuario = userEvent.setup();
    render(<FormularioContacto onEnviar={vi.fn()} />);

    await llenar(usuario, { ...validos, correo: "juan@gmail" });
    await usuario.click(screen.getByRole("button", { name: "Enviar" }));

    expect(screen.getByText(/Ingresa un correo válido/)).toBeInTheDocument();
  });

  it("rechaza un comentario demasiado corto", async () => {
    const usuario = userEvent.setup();
    render(<FormularioContacto onEnviar={vi.fn()} />);

    await llenar(usuario, { ...validos, comentario: "Hola" });
    await usuario.click(screen.getByRole("button", { name: "Enviar" }));

    expect(screen.getByText("Escribe al menos 10 caracteres")).toBeInTheDocument();
  });

  it("envía los datos, agradece y deja el formulario vacío cuando todo es válido", async () => {
    const usuario = userEvent.setup();
    const onEnviar = vi.fn();
    render(<FormularioContacto onEnviar={onEnviar} />);

    await llenar(usuario, validos);
    await usuario.click(screen.getByRole("button", { name: "Enviar" }));

    expect(onEnviar).toHaveBeenCalledWith(expect.objectContaining({ nombre: "Camila", correo: "camila@correo.cl" }));
    expect(screen.getByText(/¡Gracias, Camila!/)).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveValue("");
  });
});
