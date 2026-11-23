import { Alert } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import EstadoPedido from "../../components/Tienda/EstadoPedido";
import LineasPedido from "../../components/Tienda/LineasPedido";
import { usePedidos } from "../../hooks/usePedidos";
import { formatearPrecio } from "../../utils/precios";

function fechaLarga(fecha) {
  return fecha ? new Date(`${fecha}T12:00:00`).toLocaleDateString("es-CL") : "";
}

// Historial de compras de la tienda de quien tiene la sesión iniciada (ms-pedidos entrega solo las suyas)
function MisPedidos() {
  const { pedidos, cargando, error, sesionVencida, recargar } = usePedidos();

  if (sesionVencida) return <Navigate to="/sesion-requerida" replace />;

  return (
    <main className="container py-4">
      <header className="encabezado-pagina text-center mb-4">
        <h1>Mis pedidos</h1>
        <p className="text-secondary mb-0">Las compras que hiciste en la tienda de Veterinaria San Marcos.</p>
      </header>

      {cargando && (
        <p className="text-center text-secondary" role="status">
          Cargando pedidos...
        </p>
      )}

      {error && (
        <Alert variant="danger" role="alert">
          {error}{" "}
          <Alert.Link as="button" type="button" onClick={recargar}>
            Reintentar
          </Alert.Link>
        </Alert>
      )}

      {!cargando && !error && pedidos.length === 0 && (
        <div className="card shadow-sm p-4 text-center" role="status">
          <p>Aún no has hecho compras.</p>
          <div>
            <Link to="/tienda" className="btn btn-servicio">
              Ir a la tienda
            </Link>
          </div>
        </div>
      )}

      {pedidos.map((pedido) => (
        <article key={pedido.id} className="card shadow-sm p-3 mb-3" aria-label={`Pedido ${pedido.numero}`}>
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
            <div>
              <h2 className="h5 mb-0">Pedido #{pedido.numero}</h2>
              <small className="text-secondary">{fechaLarga(pedido.fecha)}</small>
            </div>
            <EstadoPedido estado={pedido.estado} />
          </div>
          <LineasPedido lineas={pedido.lineas} />
          <p className="small text-secondary mt-2 mb-1">
            Entrega en {pedido.calle}
            {pedido.departamento ? `, depto. ${pedido.departamento}` : ""}, {pedido.comuna}, {pedido.region}
          </p>
          <p className="fw-bold text-end mb-0">Total: {formatearPrecio(pedido.total)}</p>
        </article>
      ))}
    </main>
  );
}

export default MisPedidos;
