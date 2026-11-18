import { Alert } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import MenuAdmin from "../../components/Admin/MenuAdmin";
import { useReportes } from "../../hooks/useReportes";
import { ETIQUETAS_ROL } from "../../services/usuarioService";
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

// Reportes del sistema completo para el administrador: cuentas, citas y mascotas de todos los tutores.
function Reportes() {
  const { reporte, cargando, error, sesionVencida, recargar } = useReportes();

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
          <section className="row g-3 mb-4" aria-label="Totales">
            <div className="col-12 col-sm-6 col-lg-3">
              <Tarjeta icono="bi-people" color="azul" titulo="Usuarios" valor={reporte.totales.usuarios} />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <Tarjeta icono="bi-person-check" color="verde" titulo="Usuarios activos" valor={reporte.totales.usuariosActivos} />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <Tarjeta icono="bi-calendar-check" color="azul" titulo="Citas" valor={reporte.totales.citas} />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <Tarjeta icono="bi-hourglass-split" color="rosa" titulo="Citas pendientes" valor={reporte.totales.citasPendientes} />
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
