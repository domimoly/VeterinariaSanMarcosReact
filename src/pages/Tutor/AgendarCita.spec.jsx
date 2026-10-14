// Pruebas adicionales para la cobertura (flujo completo de agendamiento)
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import AgendarCita from "./AgendarCita";

// Los días y las horas son radios ocultos por CSS: el usuario hace clic en su etiqueta
const primeroHabilitado = (nombre) =>
  screen.getAllByRole("radio").filter((radio) => radio.name === nombre && !radio.disabled)[0].closest("label");

const abrir = (ruta = "/agendar-cita") =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <AgendarCita />
    </MemoryRouter>
  );

describe("AgendarCita", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("citasVeterinariaSanMarcos", "[]"); // sin citas previas: resultado predecible
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-05T08:00:00")); // lunes
  });
  afterEach(() => vi.useRealTimers());

  it("empieza en el paso 1 y no avanza sin elegir mascota y servicio", async () => {
    const usuario = userEvent.setup();
    abrir();

    expect(screen.getByRole("heading", { name: "Cuéntanos de tu mascota" })).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByText("Selecciona una mascota")).toBeInTheDocument();
  });

  it("llega con el servicio elegido cuando viene desde Servicios", () => {
    abrir("/agendar-cita?servicio=vacuna-triple-felina");

    expect(screen.getByText(/Elegiste "Vacuna Triple Felina"/)).toBeInTheDocument();
  });

  it("recorre los cuatro pasos, guarda la solicitud como Pendiente y muestra el éxito", async () => {
    const usuario = userEvent.setup();
    abrir();

    // Paso 1: mascota y servicio
    await usuario.selectOptions(screen.getByLabelText("Mascota"), "2"); // Luna
    await usuario.click(screen.getByLabelText(/Consulta General/));
    await usuario.click(screen.getByRole("button", { name: "Continuar" }));

    // Paso 2: fecha y hora (la semana siguiente, para tener días completos)
    await usuario.selectOptions(screen.getByLabelText("Semana"), "1");
    await usuario.click(primeroHabilitado("fecha"));
    await usuario.click(primeroHabilitado("hora"));
    await usuario.click(screen.getByRole("button", { name: "Continuar" }));

    // Paso 3: tutor (datos precargados desde el perfil)
    await usuario.click(screen.getByRole("button", { name: "Continuar" }));

    // Paso 4: confirmar
    await usuario.click(screen.getByLabelText(/Confirmo que los datos/));
    await usuario.click(screen.getByRole("button", { name: "Solicitar cita" }));

    expect(screen.getByRole("heading", { name: "¡Solicitud enviada!" })).toBeInTheDocument();
    const guardadas = JSON.parse(localStorage.getItem("citasVeterinariaSanMarcos"));
    expect(guardadas).toHaveLength(1);
    expect(guardadas[0]).toMatchObject({ mascotaNombre: "Luna", servicioNombre: "Consulta General", estado: "Pendiente" });
  });

  it("permite volver atrás sin perder lo elegido", async () => {
    const usuario = userEvent.setup();
    abrir();

    await usuario.selectOptions(screen.getByLabelText("Mascota"), "2");
    await usuario.click(screen.getByLabelText(/Consulta General/));
    await usuario.click(screen.getByRole("button", { name: "Continuar" }));
    await usuario.click(screen.getByRole("button", { name: "Atrás" }));

    expect(screen.getByLabelText(/Consulta General/)).toBeChecked();
  });

  it("después de enviar permite empezar otra solicitud desde el paso 1", async () => {
    const usuario = userEvent.setup();
    abrir();

    await usuario.selectOptions(screen.getByLabelText("Mascota"), "2");
    await usuario.click(screen.getByLabelText(/Consulta General/));
    await usuario.click(screen.getByRole("button", { name: "Continuar" }));
    await usuario.selectOptions(screen.getByLabelText("Semana"), "1");
    await usuario.click(primeroHabilitado("fecha"));
    await usuario.click(primeroHabilitado("hora"));
    await usuario.click(screen.getByRole("button", { name: "Continuar" }));
    await usuario.click(screen.getByRole("button", { name: "Continuar" }));
    await usuario.click(screen.getByLabelText(/Confirmo que los datos/));
    await usuario.click(screen.getByRole("button", { name: "Solicitar cita" }));
    await usuario.click(screen.getByRole("button", { name: "Agendar otra cita" }));

    expect(screen.getByRole("heading", { name: "Cuéntanos de tu mascota" })).toBeInTheDocument();
  });
});
