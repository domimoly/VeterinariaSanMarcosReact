import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Blog from "./Blog";
import { publicacionesBlog } from "../data/blog";

describe("Blog", () => {
  it("lista todos los artículos, cada uno con su enlace al detalle", () => {
    render(<MemoryRouter><Blog /></MemoryRouter>);

    publicacionesBlog.forEach((publicacion) =>
      expect(screen.getByRole("link", { name: publicacion.titulo })).toHaveAttribute("href", `/blog/${publicacion.slug}`)
    );
  });
});
