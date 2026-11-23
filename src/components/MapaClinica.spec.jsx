import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

// Leaflet necesita medidas reales del navegador; en la prueba se reemplaza por un doble.
const mapa = { setView: vi.fn(), remove: vi.fn(), fitBounds: vi.fn() };
mapa.setView.mockReturnValue(mapa);
const capa = { addTo: vi.fn(() => capa), bindPopup: vi.fn(() => capa), openPopup: vi.fn(() => capa), remove: vi.fn() };

vi.mock("leaflet", () => ({
  default: {
    map: vi.fn(() => mapa),
    tileLayer: vi.fn(() => capa),
    marker: vi.fn(() => capa),
    circleMarker: vi.fn(() => capa),
    icon: vi.fn(() => ({})),
  },
}));
vi.mock("leaflet/dist/leaflet.css", () => ({}));

import MapaClinica from "./MapaClinica";
import { CLINICA, urlComoLlegar } from "../utils/clinica";

describe("MapaClinica", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("muestra la dirección y crea el mapa centrado en la clínica", () => {
    render(<MapaClinica />);
    expect(screen.getByText(new RegExp(CLINICA.direccion))).toBeInTheDocument();
    expect(mapa.setView).toHaveBeenCalledWith([CLINICA.latitud, CLINICA.longitud], 16);
  });

  it("el enlace Cómo llegar apunta a la clínica", () => {
    render(<MapaClinica />);
    const enlace = screen.getByRole("link", { name: "Cómo llegar" });
    expect(enlace.getAttribute("href")).toContain(`destination=${CLINICA.latitud},${CLINICA.longitud}`);
    expect(enlace.getAttribute("href")).not.toContain("origin=");
  });

  it("al usar la ubicación del usuario agrega el origen a la ruta", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal("navigator", {
      geolocation: {
        getCurrentPosition: (ok) => ok({ coords: { latitude: -33.45, longitude: -70.66 } }),
      },
    });
    render(<MapaClinica />);
    await usuario.click(screen.getByRole("button", { name: "Usar mi ubicación" }));
    expect(screen.getByRole("link", { name: "Cómo llegar" }).getAttribute("href")).toContain(
      "origin=-33.45,-70.66"
    );
    expect(mapa.fitBounds).toHaveBeenCalled();
  });

  it("avisa cuando el navegador rechaza el permiso", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal("navigator", {
      geolocation: { getCurrentPosition: (_ok, error) => error(new Error("denegado")) },
    });
    render(<MapaClinica />);
    await usuario.click(screen.getByRole("button", { name: "Usar mi ubicación" }));
    expect(screen.getByRole("status")).toHaveTextContent("No pudimos obtener tu ubicación");
  });

  it("urlComoLlegar sin origen no incluye origin", () => {
    expect(urlComoLlegar(null)).not.toContain("origin");
  });
});
