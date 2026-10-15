import { render, screen } from "@testing-library/react";
import Nosotros from "./Nosotros";
import { resenas } from "../data/resenas";

describe("Nosotros", () => {
  it("muestra el título, los puntos importantes y una tarjeta por reseña", () => {
    render(<Nosotros />);

    expect(screen.getByRole("heading", { name: "Quiénes somos" })).toBeInTheDocument();
    expect(screen.getByText("Puntos importantes")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/de 5 estrellas/)).toHaveLength(resenas.length);
  });
});
