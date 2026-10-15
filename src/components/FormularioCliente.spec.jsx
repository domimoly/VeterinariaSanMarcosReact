// src/components/FormularioCliente.spec.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import FormularioCliente from "./FormularioCliente";

const datosVacios = {
  nombre: "",
  apellidos: "",
  correo: "",
  calle: "",
  departamento: "",
  region: "",
  comuna: "",
  indicaciones: "",
};

const mostrar = (onPagar = vi.fn()) =>
  render(<FormularioCliente datosIniciales={datosVacios} total={12600} onPagar={onPagar} />);

describe("FormularioCliente", () => {
  it("muestra un error por cada campo obligatorio vacío y no paga", async () => {
    const usuario = userEvent.setup();
    const onPagar = vi.fn();
    mostrar(onPagar);

    await usuario.click(screen.getByRole("button", { name: "Pagar ahora $12.600" }));

    expect(screen.getByText("El nombre es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("La calle es obligatoria")).toBeInTheDocument();
    expect(screen.getByText("Selecciona una región")).toBeInTheDocument();
    expect(onPagar).not.toHaveBeenCalled();
  });

  it("rechaza un correo sin @", async () => {
    const usuario = userEvent.setup();
    mostrar();

    await usuario.type(screen.getByLabelText("Correo*"), "pedro.correo.cl");
    await usuario.click(screen.getByRole("button", { name: "Pagar ahora $12.600" }));

    expect(screen.getByText("El correo debe contener @")).toBeInTheDocument();
  });

  it("entrega los datos al pagar cuando todo es válido", async () => {
    const usuario = userEvent.setup();
    const onPagar = vi.fn();
    mostrar(onPagar);

    await usuario.type(screen.getByLabelText("Nombre*"), "Pedro");
    await usuario.type(screen.getByLabelText("Apellidos*"), "Soto");
    await usuario.type(screen.getByLabelText("Correo*"), "pedro@correo.cl");
    await usuario.type(screen.getByLabelText("Calle*"), "Los Crisantemos 123");
    await usuario.selectOptions(screen.getByLabelText("Región*"), "rm");
    await usuario.selectOptions(screen.getByLabelText("Comuna*"), "Santiago");
    await usuario.click(screen.getByRole("button", { name: "Pagar ahora $12.600" }));

    expect(onPagar).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: "Pedro", correo: "pedro@correo.cl", region: "rm", comuna: "Santiago" })
    );
  });
});
