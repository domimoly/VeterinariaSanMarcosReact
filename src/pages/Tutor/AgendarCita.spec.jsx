// Pruebas adicionales para la cobertura (flujo completo de agendamiento)
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import * as citaService from "../../services/citaService";
import * as mascotaService from "../../services/mascotaService";
import { esperarHoras, instalarCitasEnMemoria } from "../../test/citasEnMemoria";
import { instalarMascotasEnMemoria } from "../../test/mascotasEnMemoria";
import AgendarCita from "./AgendarCita";

// Los días y las horas son radios ocultos por CSS: el usuario hace clic en su etiqueta
vi.mock("../../services/mascotaService");
vi.mock("../../services/citaService");

const primeroHabilitado = (nombre) =>
  screen.getAllByRole("radio").filter((radio) => radio.name === nombre && !radio.disabled)[0].closest("label");

const abrir = async (ruta = "/agendar-cita") => {
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/agendar-cita" element={<AgendarCita />} />
        <Route path="/sesion-requerida" element={<p>Sesión requerida</p>} />
      </Routes>
    </MemoryRouter>
  );
  // Espera a que terminen de cargar las mascotas (vienen de ms-mascotas)
  await waitFor(() => expect(screen.queryByText("Cargando tus mascotas...")).not.toBeInTheDocument());
};

// Recorre los pasos 1 al 3 y deja la pantalla lista para confirmar (paso 4)
const llegarAConfirmar = async (usuario) => {
  await usuario.selectOptions(screen.getByLabelText("Mascota"), "2"); // Luna
  await usuario.click(screen.getByLabelText(/Consulta General/));
  await usuario.click(screen.getByRole("button", { name: "Continuar" }));
  await usuario.selectOptions(screen.getByLabelText("Semana"), "1");
  await esperarHoras();
  await usuario.click(primeroHabilitado("fecha"));
  await usuario.click(primeroHabilitado("hora"));
  await usuario.click(screen.getByRole("button", { name: "Continuar" }));
  await usuario.click(screen.getByRole("button", { name: "Continuar" }));
  await usuario.click(screen.getByLabelText(/Confirmo que los datos/));
};

describe("AgendarCita", () => {
  beforeEach(() => {
    localStorage.clear();
    instalarMascotasEnMemoria(mascotaService);
    instalarCitasEnMemoria(citaService, []); // sin citas previas: resultado predecible
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-05T08:00:00")); // lunes
  });
  afterEach(() => vi.useRealTimers());

  it("empieza en el paso 1 y no avanza sin elegir mascota y servicio", async () => {
    const usuario = userEvent.setup();
    await abrir();

    expect(screen.getByRole("heading", { name: "Cuéntanos de tu mascota" })).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByText("Selecciona una mascota")).toBeInTheDocument();
  });

  it("llega con el servicio elegido cuando viene desde Servicios", async () => {
    await abrir("/agendar-cita?servicio=vacuna-triple-felina");

    expect(screen.getByText(/Elegiste "Vacuna Triple Felina"/)).toBeInTheDocument();
  });

  it("recorre los cuatro pasos, envía la solicitud a ms-citas y muestra el éxito", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await llegarAConfirmar(usuario);
    await usuario.click(screen.getByRole("button", { name: "Solicitar cita" }));

    expect(await screen.findByRole("heading", { name: "¡Solicitud enviada!" })).toBeInTheDocument();
    expect(citaService.crearCita).toHaveBeenCalledTimes(1);
    expect(citaService.crearCita).toHaveBeenCalledWith(
      expect.objectContaining({
        mascota: expect.objectContaining({ nombre: "Luna" }),
        servicio: expect.objectContaining({ id: "consulta-general" }),
        fecha: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        hora: expect.stringMatching(/^\d{2}:\d{2}$/),
      })
    );
    expect(screen.getByText(/Código de solicitud: SM-000100/)).toBeInTheDocument();
  });

  it("ya no guarda las citas en el navegador", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await llegarAConfirmar(usuario);
    await usuario.click(screen.getByRole("button", { name: "Solicitar cita" }));
    await screen.findByRole("heading", { name: "¡Solicitud enviada!" });

    expect(localStorage.getItem("citasVeterinariaSanMarcos")).toBeNull();
  });

  it("muestra el motivo si ms-citas rechaza la hora y deja elegir otra", async () => {
    citaService.crearCita.mockRejectedValue(
      Object.assign(new Error("No quedan cupos a las 09:00"), { estado: 409 })
    );
    const usuario = userEvent.setup();
    await abrir();

    await llegarAConfirmar(usuario);
    await usuario.click(screen.getByRole("button", { name: "Solicitar cita" }));

    expect(await screen.findByText(/No quedan cupos a las 09:00/)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "¡Solicitud enviada!" })).not.toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Elegir otra hora" }));
    expect(screen.getByRole("heading", { name: "Elige una hora para visitarnos" })).toBeInTheDocument();
  });

  it("lleva a iniciar sesión si el token venció al enviar la solicitud", async () => {
    citaService.crearCita.mockRejectedValue(Object.assign(new Error("Tu sesión venció."), { estado: 401 }));
    const usuario = userEvent.setup();
    await abrir();

    await llegarAConfirmar(usuario);
    await usuario.click(screen.getByRole("button", { name: "Solicitar cita" }));

    expect(await screen.findByText("Sesión requerida")).toBeInTheDocument();
  });

  it("permite volver atrás sin perder lo elegido", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.selectOptions(screen.getByLabelText("Mascota"), "2");
    await usuario.click(screen.getByLabelText(/Consulta General/));
    await usuario.click(screen.getByRole("button", { name: "Continuar" }));
    await usuario.click(screen.getByRole("button", { name: "Atrás" }));

    expect(screen.getByLabelText(/Consulta General/)).toBeChecked();
  });

  it("después de enviar permite empezar otra solicitud desde el paso 1", async () => {
    const usuario = userEvent.setup();
    await abrir();

    await usuario.selectOptions(screen.getByLabelText("Mascota"), "2");
    await usuario.click(screen.getByLabelText(/Consulta General/));
    await usuario.click(screen.getByRole("button", { name: "Continuar" }));
    await usuario.selectOptions(screen.getByLabelText("Semana"), "1");
    await esperarHoras();
    await usuario.click(primeroHabilitado("fecha"));
    await usuario.click(primeroHabilitado("hora"));
    await usuario.click(screen.getByRole("button", { name: "Continuar" }));
    await usuario.click(screen.getByRole("button", { name: "Continuar" }));
    await usuario.click(screen.getByLabelText(/Confirmo que los datos/));
    await usuario.click(screen.getByRole("button", { name: "Solicitar cita" }));
    await usuario.click(await screen.findByRole("button", { name: "Agendar otra cita" }));

    expect(screen.getByRole("heading", { name: "Cuéntanos de tu mascota" })).toBeInTheDocument();
  });
});
