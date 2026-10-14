// src/components/Tutor/PasosCita.spec.jsx
import { render, screen } from "@testing-library/react";
import PasosCita from "./PasosCita";

describe("PasosCita", () => {
  const pasos = ["Mascota", "Fecha", "Tutor", "Confirmar"];

  it("marca como activo el paso recibido por props", () => {
    render(<PasosCita pasos={pasos} pasoActual={2} />);

    expect(screen.getByText("Fecha").closest("li")).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("Mascota").closest("li")).not.toHaveAttribute("aria-current");
  });
});
