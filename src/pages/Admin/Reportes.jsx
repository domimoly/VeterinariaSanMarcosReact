import { useMemo, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import MenuAdmin from "../../components/Admin/MenuAdmin";
import { useReportes } from "../../hooks/useReportes";
import { ETIQUETAS_ROL } from "../../services/usuarioService";
import { fechaIsoLocal, hoyIso } from "../../utils/fechas";
import { citasACsv, nombreMes, resumirReportes } from "../../utils/reportes";
import "./Usuarios.css";

// Lista de barras: cada fila muestra su total y se dibuja en proporción al mayor
function Barras({ filas, etiqueta = (nombre) => nombre, vacio }) {
  if (filas.length === 0) return <p className="text-secondary mb-0">{vacio}</p>;
  const maximo = Math.max(...filas.map((fila) => fila.total), 1);

  return (
    <div>
      {filas.map((fila) => (
        <div className="admin-barra-fila" key={fila.nombre}>
          <span>{etiqueta(fila.nombre)}</span>
          <span className="admin-barra-pista" aria-hidden="true">
            <span className="admin-barra-relleno" style={{ width: `${(fila.total / maximo) * 100}%` }} />
          </span>
          <strong>{fila.total}</strong>
        </div>
      ))}
    </div>
  );
}

function Tarjeta({ icono, color, titulo, valor }) {
  return (
    <article className="admin-resumen">
      <span className={`admin-resumen-icono ${color}`}>
        <i className={`bi ${icono}`} aria-hidden="true" />
      </span>
      <div>
        <span>{titulo}</span>
        <strong>{valor}</strong>
      </div>
    </article>
  );
}

// Atajos del selector de período
function periodoPreset(clave) {
  const hoy = new Date();
  if (clave === "mes") return { desde: fechaIsoLocal(new Date(hoy.getFullYear(), hoy.getMonth(), 1)), hasta: hoyIso() };
  if (clave === "30") return { desde: fechaIsoLocal(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 30)), hasta: hoyIso() };
  if (clave === "anio") return { desde: `${hoy.getFullYear()}-01-01`, hasta: hoyIso() };
  return { desde: "", hasta: "" };
}

function descargarCsv(citas, desde, hasta) {
  // El BOM al inicio hace que Excel respete las tildes
  const archivo = new Blob(["\uFEFF", citasACsv(citas)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `atenciones_${desde || "inicio"}_${hasta || "hoy"}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
}

// Reportes del sistema completo para el administrador: cuentas, citas y mascotas de todos los tutores.
function Reportes() {
  const { datos, cargando, error, sesionVencida, recargar } = useReportes();
  const [periodo, setPeriodo] = useState({ desde: "", hasta: "" });
  const periodoInvalido = Boolean(periodo.desde && periodo.hasta && periodo.desde > periodo.hasta);
  // Con fechas cruzadas se muestra el aviso y se calcula sin límites, para no mostrar un reporte vacío engañoso
  const reporte = useMemo(
    () => (datos ? resumirReportes({ ...datos, ...(periodoInvalido ? {} : periodo) }) : null),
    [datos, periodo, periodoInvalido]
  );

  // El token venció mientras se usaba la página
  if (sesionVencida) return <Navigate to="/sesion-requerida" replace />;

  return (
    <main className="container admin-usuarios py-4 py-lg-5">
      <div className="admin-migas mb-3">
        <Link to="/">Inicio</Link>
        <span>/</span>
        <span>Administración</span>
      </div>
      <header className="admin-encabezado mb-4">
        <div>
          <span className="admin-etiqueta">
            <i className="bi bi-bar-chart" aria-hidden="true" /> Administración
          </span>
          <h1>Reportes del sistema</h1>
          <p className="mb-0">Un resumen de las cuentas, las citas y las mascotas de toda la clínica.</p>
        </div>
      </header>

      <MenuAdmin />

      {cargando ? (
        <p className="text-secondary" role="status">
          Cargando reportes...
        </p>
      ) : error ? (
        <Alert variant="danger" role="alert">
          {error}{" "}
          <Alert.Link as="button" type="button" onClick={recargar}>
            Reintentar
          </Alert.Link>
        </Alert>
      ) : (
        <>
          <section className="admin-reporte-caja mb-4" aria-label="Período">
            <h2>Período</h2>
            <div className="row g-3 align-items-end">
              <div className="col-6 col-md-3">
                <Form.Group controlId="reporte-desde">
                  <Form.Label>Desde</Form.Label>
                  <Form.Control type="date" value={periodo.desde} max={periodo.hasta || undefined} onChange={(e) => setPeriodo({ ...periodo, desde: e.target.value })} />
                </Form.Group>
              </div>
              <div className="col-6 col-md-3">
                <Form.Group controlId="reporte-hasta">
                  <Form.Label>Hasta</Form.Label>
                  <Form.Control type="date" value={periodo.hasta} min={periodo.desde || undefined} onChange={(e) => setPeriodo({ ...periodo, hasta: e.target.value })} />
                </Form.Group>
              </div>
              <div className="col-12 col-md-6 d-flex flex-wrap gap-2">
                <Button variant="outline-primary" size="sm" onClick={() => setPeriodo(periodoPreset("mes"))}>Este mes</Button>
                <Button variant="outline-primary" size="sm" onClick={() => setPeriodo(periodoPreset("30"))}>Últimos 30 días</Button>
                <Button variant="outline-primary" size="sm" onClick={() => setPeriodo(periodoPreset("anio"))}>Este año</Button>
                <Button variant="outline-secondary" size="sm" onClick={() => setPeriodo(periodoPreset("todo"))}>Todo el historial</Button>
              </div>
            </div>
            {periodoInvalido && (
              <Alert variant="warning" className="mt-3 mb-0" role="alert">
                La fecha "Desde" no puede ser posterior a "Hasta". Se muestra todo el historial.
              </Alert>
            )}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3">
              <span className="text-secondary">
                {reporte.citasPeriodo.length} {reporte.citasPeriodo.length === 1 ? "atención" : "atenciones"} en el período
              </span>
              <Button
                variant="outline-primary"
                size="sm"
                disabled={reporte.citasPeriodo.length === 0}
                onClick={() => descargarCsv(reporte.citasPeriodo, periodo.desde, periodo.hasta)}
              >
                <i className="bi bi-download" aria-hidden="true" /> Descargar atenciones (CSV)
              </Button>
            </div>
          </section>

          <section className="row g-3 mb-4" aria-label="Totales">
            <div className="col-12 col-sm-6 col-lg">
              <Tarjeta icono="bi-people" color="azul" titulo="Usuarios" valor={reporte.totales.usuarios} />
            </div>
            <div className="col-12 col-sm-6 col-lg">
              <Tarjeta icono="bi-person-check" color="verde" titulo="Usuarios activos" valor={reporte.totales.usuariosActivos} />
            </div>
            <div className="col-12 col-sm-6 col-lg">
              <Tarjeta icono="bi-calendar-check" color="azul" titulo="Citas" valor={reporte.totales.citas} />
            </div>
            <div className="col-12 col-sm-6 col-lg">
              <Tarjeta icono="bi-hourglass-split" color="rosa" titulo="Citas pendientes" valor={reporte.totales.citasPendientes} />
            </div>
            <div className="col-12 col-sm-6 col-lg">
              <Tarjeta icono="bi-person-plus" color="verde" titulo="Pacientes nuevos" valor={reporte.totales.pacientesNuevos} />
            </div>
          </section>

          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <section className="admin-reporte-caja">
                <h2>Citas por estado</h2>
                <Barras filas={reporte.citasPorEstado} vacio="Todavía no hay citas." />
              </section>
            </div>
            <div className="col-12 col-lg-6">
              <section className="admin-reporte-caja">
                <h2>Atenciones por mes</h2>
                <Barras filas={reporte.citasPorMes} etiqueta={nombreMes} vacio="No hay atenciones en el período." />
              </section>
            </div>
            <div className="col-12 col-lg-6">
              <section className="admin-reporte-caja">
                <h2>Pacientes nuevos por mes</h2>
                <Barras filas={reporte.pacientesNuevosPorMes} etiqueta={nombreMes} vacio="No hay mascotas registradas en el período." />
              </section>
            </div>
            <div className="col-12 col-lg-6">
              <section className="admin-reporte-caja">
                <h2>Servicios más solicitados</h2>
                <Barras filas={reporte.serviciosMasSolicitados} vacio="Todavía no hay citas vigentes." />
              </section>
            </div>
            <div className="col-12 col-lg-6">
              <section className="admin-reporte-caja">
                <h2>Usuarios por rol</h2>
                <Barras
                  filas={reporte.usuariosPorRol}
                  etiqueta={(rol) => ETIQUETAS_ROL[rol] ?? rol}
                  vacio="Todavía no hay usuarios."
                />
              </section>
            </div>
            <div className="col-12 col-lg-6">
              <section className="admin-reporte-caja">
                <h2>
                  Mascotas por especie <small className="text-secondary fw-normal">({reporte.totales.mascotas} en total)</small>
                </h2>
                <Barras filas={reporte.mascotasPorEspecie} vacio="Todavía no hay mascotas registradas." />
              </section>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default Reportes;
