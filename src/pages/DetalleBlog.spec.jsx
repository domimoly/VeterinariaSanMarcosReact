import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DetalleBlog from "./DetalleBlog";
import { publicacionesBlog } from "../data/blog";

const abrir = (slug) =>
  render(
    <MemoryRouter initialEntries={[`/blog/${slug}`]}>
      <Routes>
        <Route path="/blog/:slug" element={<DetalleBlog />} />
      </Routes>
    </MemoryRouter>
  );

describe("DetalleBlog", () => {
  it("muestra el artículo completo con su autor cuando tiene contenido", () => {
    const completo = publicacionesBlog.find((p) => p.contenido);
    abrir(completo.slug);

    expect(screen.getByRole("heading", { level: 1, name: completo.titulo })).toBeInTheDocument();
    expect(screen.getByText(completo.contenido.especialidadAutor)).toBeInTheDocument();
  });

  it("avisa que el artículo está en preparación cuando todavía no tiene contenido", () => {
    const pendiente = publicacionesBlog.find((p) => !p.contenido);
    abrir(pendiente.slug);

    expect(screen.getByText(/Estamos redactando la versión completa/)).toBeInTheDocument();
  });

  it("muestra un mensaje cuando el artículo no existe", () => {
    abrir("zzz");

    expect(screen.getByRole("heading", { name: "Artículo no encontrado" })).toBeInTheDocument();
  });
});
