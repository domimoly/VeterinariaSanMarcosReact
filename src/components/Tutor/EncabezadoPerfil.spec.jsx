// Pruebas adicionales para la cobertura
import { render, screen } from "@testing-library/react";
import EncabezadoPerfil from "./EncabezadoPerfil";

describe("EncabezadoPerfil", () => {
  const usuario = { nombre: "Camila", apellidos: "Rojas Soto", correo: "camila@correo.cl", rol: "Dueño de mascota" };

  it("muestra las iniciales, el nombre completo, el correo y el rol", () => {
    render(<EncabezadoPerfil usuario={usuario} />);

    expect(screen.getByText("CR")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Camila Rojas Soto" })).toBeInTheDocument();
    expect(screen.getByText("camila@correo.cl")).toBeInTheDocument();
    expect(screen.getByText("Dueño de mascota")).toHaveClass("badge-rol-dueno");
  });
});
