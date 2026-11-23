// Pruebas adicionales para la cobertura
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import FormularioPerfil from "./FormularioPerfil";
import { usuarioDemo } from "../../test/perfilDemo";

describe("FormularioPerfil", () => {
  it("no permite guardar si se borra el nombre", async () => {
    const usuario = userEvent.setup();
    const onGuardar = vi.fn();
    render(<FormularioPerfil usuario={usuarioDemo} onGuardar={onGuardar} />);

    await usuario.clear(screen.getByLabelText("Nombre"));
    await usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(screen.getByText("El nombre es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("Revisa los campos marcados")).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it("rechaza un teléfono con letras", async () => {
    const usuario = userEvent.setup();
    render(<FormularioPerfil usuario={usuarioDemo} onGuardar={vi.fn()} />);

    await usuario.clear(screen.getByLabelText("Teléfono (opcional)"));
    await usuario.type(screen.getByLabelText("Teléfono (opcional)"), "abc");
    await usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(screen.getByText(/Ingresa solo números/)).toBeInTheDocument();
  });

  it("limpia la comuna y ofrece las de la nueva región al cambiar de región", async () => {
    const usuario = userEvent.setup();
    render(<FormularioPerfil usuario={usuarioDemo} onGuardar={vi.fn()} />);

    await usuario.selectOptions(screen.getByLabelText("Región"), "valpo");

    expect(screen.getByLabelText("Comuna")).toHaveValue("");
    expect(screen.getByRole("option", { name: "Viña del Mar" })).toBeInTheDocument();
  });

  it("guarda los datos y confirma cuando todo es válido", async () => {
    const usuario = userEvent.setup();
    const onGuardar = vi.fn().mockResolvedValue(true);
    render(<FormularioPerfil usuario={usuarioDemo} onGuardar={onGuardar} />);

    await usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ nombre: "Camila", run: usuarioDemo.run }));
    expect(await screen.findByText("Tus datos se guardaron correctamente.")).toBeInTheDocument();
  });

  it("no confirma el guardado si el servidor lo rechazó", async () => {
    const usuario = userEvent.setup();
    const onGuardar = vi.fn().mockResolvedValue(false);
    render(<FormularioPerfil usuario={usuarioDemo} onGuardar={onGuardar} />);

    await usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeEnabled());
    expect(screen.queryByText("Tus datos se guardaron correctamente.")).not.toBeInTheDocument();
  });

  it("valida el dígito verificador del RUN", async () => {
    const usuario = userEvent.setup();
    const onGuardar = vi.fn();
    render(<FormularioPerfil usuario={usuarioDemo} onGuardar={onGuardar} />);

    await usuario.clear(screen.getByLabelText("RUN (opcional)"));
    await usuario.type(screen.getByLabelText("RUN (opcional)"), "12345678-K");
    await usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(screen.getByText(/Ingresa un RUN válido/)).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it("permite dejar el RUN vacío", async () => {
    const usuario = userEvent.setup();
    const onGuardar = vi.fn().mockResolvedValue(true);
    render(<FormularioPerfil usuario={usuarioDemo} onGuardar={onGuardar} />);

    await usuario.clear(screen.getByLabelText("RUN (opcional)"));
    await usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ run: "" }));
  });

  it("deja el correo bloqueado porque es la cuenta con la que se inicia sesión", () => {
    render(<FormularioPerfil usuario={usuarioDemo} onGuardar={vi.fn()} />);

    expect(screen.getByLabelText("Correo")).toBeDisabled();
  });
});
