// src/components/HistorialMascota.spec.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import * as fichaService from "../../services/fichaService";
import { instalarFichasEnMemoria } from "../../test/fichasEnMemoria";
import HistorialMascota from "./HistorialMascota";

vi.mock("../../services/fichaService");

describe("HistorialMascota", () => {
  const mascotas = [
    { id: 1, nombre: "Max", especie: "Perro" },
    { id: 2, nombre: "Luna", especie: "Gato" },
  ];

  // Fechas lejanas: las vacunas quedan "al día" sin importar cuándo se ejecute la prueba
  const fichas = {
    1: {
      vacunas: [{ id: 1, nombre: "Séxtuple canina", fecha: "2098-01-01", proximaDosis: "2099-01-01" }],
      desparasitaciones: [],
      consultas: [],
    },
    2: {
      vacunas: [{ id: 1, nombre: "Triple felina", fecha: "2098-01-01", proximaDosis: "2099-01-01" }],
      desparasitaciones: [],
      consultas: [],
    },
  };

  const mostrar = (lista = mascotas) =>
    render(
      <MemoryRouter initialEntries={["/mi-perfil"]}>
        <Routes>
          <Route path="/mi-perfil" element={<HistorialMascota mascotas={lista} />} />
          <Route path="/sesion-requerida" element={<p>Sesión requerida</p>} />
        </Routes>
      </MemoryRouter>
    );

  beforeEach(() => instalarFichasEnMemoria(fichaService, fichas));

  it("pide a ms-fichas la ficha de la mascota elegida y la muestra", async () => {
    mostrar();

    expect(await screen.findByText("Séxtuple canina")).toBeInTheDocument();
    expect(fichaService.listarFicha).toHaveBeenCalledWith(1);
  });

  it("cambia la ficha mostrada al elegir otra mascota", async () => {
    const usuario = userEvent.setup();
    mostrar();
    await screen.findByText("Séxtuple canina");

    await usuario.selectOptions(screen.getByLabelText("Mascota"), "2");

    expect(await screen.findByText("Triple felina")).toBeInTheDocument();
    expect(screen.queryByText("Séxtuple canina")).not.toBeInTheDocument();
    expect(fichaService.listarFicha).toHaveBeenCalledWith(2);
  });

  it("invita a registrar una mascota y no consulta nada cuando no hay ninguna", () => {
    mostrar([]);

    expect(screen.getByText("Registra una mascota para ver su ficha clínica.")).toBeInTheDocument();
    expect(fichaService.listarFicha).not.toHaveBeenCalled();
  });

  it("avisa de los controles vencidos o por vencer", async () => {
    fichaService.listarFicha.mockResolvedValue({
      vacunas: [{ id: 1, nombre: "Antirrábica", fecha: "2000-01-01", proximaDosis: "2001-01-01" }],
      desparasitaciones: [],
      consultas: [],
    });
    mostrar();

    expect(await screen.findByText(/Max tiene controles pendientes/)).toBeInTheDocument();
  });

  it("muestra el error de carga y permite reintentar", async () => {
    const usuario = userEvent.setup();
    fichaService.listarFicha.mockRejectedValueOnce(new Error("No se pudo conectar con el servidor."));
    mostrar();

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo conectar con el servidor.");

    await usuario.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByText("Séxtuple canina")).toBeInTheDocument();
  });

  it("lleva a iniciar sesión si el token venció", async () => {
    fichaService.listarFicha.mockRejectedValueOnce(Object.assign(new Error("Tu sesión venció"), { estado: 401 }));
    mostrar();

    expect(await screen.findByText("Sesión requerida")).toBeInTheDocument();
  });
});
