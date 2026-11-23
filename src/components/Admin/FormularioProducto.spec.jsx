import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import FormularioProducto from "./FormularioProducto";

const existente = {
  id: 3,
  codigo: "MED-003",
  nombre: "Metrobay 250mg",
  categoria: "Medicamento",
  descripcion: "Antimicrobiano de uso veterinario.",
  precio: 3900,
  stock: 20,
  imagen: "/img/METROBAY.jpg",
  activo: true,
};

const mostrar = (props = {}) => {
  const onGuardar = vi.fn();
  const onCancelar = vi.fn();
  render(<FormularioProducto onGuardar={onGuardar} onCancelar={onCancelar} {...props} />);
  return { onGuardar, onCancelar };
};

describe("FormularioProducto", () => {
  it("al crear exige código, nombre, precio y stock", async () => {
    const usuario = userEvent.setup();
    const { onGuardar } = mostrar();

    await usuario.click(screen.getByRole("button", { name: "Crear producto" }));

    expect(screen.getByText("El código es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("El nombre es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("Ingresa un precio entero mayor a 0")).toBeInTheDocument();
    expect(screen.getByText("Ingresa un stock entero desde 0")).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it("rechaza un código con caracteres no permitidos, un precio en cero y un stock negativo", async () => {
    const usuario = userEvent.setup();
    mostrar();

    await usuario.type(screen.getByLabelText("Código"), "MED 016!");
    await usuario.type(screen.getByLabelText("Nombre"), "Producto de prueba");
    await usuario.type(screen.getByLabelText("Precio (CLP)"), "0");
    await usuario.type(screen.getByLabelText("Stock"), "-1");
    await usuario.click(screen.getByRole("button", { name: "Crear producto" }));

    expect(screen.getByText("Solo letras, números y guiones")).toBeInTheDocument();
    expect(screen.getByText("Ingresa un precio entero mayor a 0")).toBeInTheDocument();
    expect(screen.getByText("Ingresa un stock entero desde 0")).toBeInTheDocument();
  });

  it("entrega los datos con el código en mayúsculas y los números como números", async () => {
    const usuario = userEvent.setup();
    const { onGuardar } = mostrar();

    await usuario.type(screen.getByLabelText("Código"), "med-016");
    await usuario.type(screen.getByLabelText("Nombre"), "  Producto nuevo ");
    await usuario.selectOptions(screen.getByLabelText("Categoría"), "Accesorio");
    await usuario.type(screen.getByLabelText("Precio (CLP)"), "5990");
    await usuario.type(screen.getByLabelText("Stock"), "12");
    await usuario.click(screen.getByRole("button", { name: "Crear producto" }));

    expect(onGuardar).toHaveBeenCalledWith({
      codigo: "MED-016",
      nombre: "Producto nuevo",
      categoria: "Accesorio",
      descripcion: "",
      precio: 5990,
      stock: 12,
      imagen: "",
      activo: true,
    });
  });

  it("al editar muestra los datos actuales y no deja cambiar el código", async () => {
    const usuario = userEvent.setup();
    const { onGuardar } = mostrar({ producto: existente });

    expect(screen.getByLabelText("Código")).toHaveValue("MED-003");
    expect(screen.getByLabelText("Código")).toHaveAttribute("readonly");

    await usuario.clear(screen.getByLabelText("Precio (CLP)"));
    await usuario.type(screen.getByLabelText("Precio (CLP)"), "4100");
    await usuario.click(screen.getByLabelText("Visible en la tienda"));
    await usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ codigo: "MED-003", precio: 4100, stock: 20, activo: false }));
  });

  it("muestra el error del servidor y bloquea el botón mientras guarda", () => {
    mostrar({ producto: existente, error: "Ya existe un producto con ese código", guardando: true });

    expect(screen.getByRole("alert")).toHaveTextContent("Ya existe un producto con ese código");
    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
  });

  it("cancela sin guardar", async () => {
    const usuario = userEvent.setup();
    const { onCancelar, onGuardar } = mostrar();

    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancelar).toHaveBeenCalled();
    expect(onGuardar).not.toHaveBeenCalled();
  });
});
