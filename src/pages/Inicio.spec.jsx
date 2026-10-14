import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Inicio from "./Inicio";
import { resenas } from "../data/resenas";

describe("Inicio", () => {
  const abrir = () => render(<MemoryRouter><Inicio /></MemoryRouter>);

  it("presenta la clínica con su título principal", () => {
    abrir();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Tu mascota sana y más feliz");
  });

  it("muestra todas las reseñas de los clientes", () => {
    abrir();

    resenas.forEach((resena) => expect(screen.getByText(resena.autor)).toBeInTheDocument());
  });

  it("lleva a agendar una cita desde la portada", () => {
    abrir();

    expect(screen.getByRole("link", { name: "Agendar cita" })).toHaveAttribute("href", "/agendar-cita");
  });
});
