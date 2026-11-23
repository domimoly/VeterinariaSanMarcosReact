import { useState } from "react";
import { Alert, Button, Form, Table } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import MenuRecepcion from "../../components/Recepcionista/MenuRecepcion";
import EstadoPedido from "../../components/Tienda/EstadoPedido";
import LineasPedido from "../../components/Tienda/LineasPedido";
import { usePedidos } from "../../hooks/usePedidos";
import { ETIQUETAS_ESTADO } from "../../services/pedidoService";
import { formatearPrecio } from "../../utils/precios";
import "./Recepcionista.css";

// Pedidos de la tienda (ms-pedidos): la recepción y el administrador ven los de todos los clientes,
// marcan los entregados y cancelan los que no corresponden (la cancelación devuelve el stock).
function GestionPedidos() {
  const { pedidos, cargando, error, errorAccion, sesionVencida, recargar, entregar, cancelar } = usePedidos();
  const [filtroEstado, setFiltroEstado] = useState("");
  const [abierto, setAbierto] = useState(null); // id del pedido con el detalle desplegado

  if (sesionVencida) return <Navigate to="/sesion-requerida" replace />;

  const visibles = pedidos.filter((p) => !filtroEstado || p.estado === filtroEstado);

  async function cancelarConConfirmacion(pedido) {
    if (!window.confirm(`¿Cancelar el pedido #${pedido.numero}? Se devolverá el stock de sus productos.`)) return;
    await cancelar(pedido.id);
  }

  return (
    <main className="container py-4">
      <header className="encabezado-pagina mb-3">
        <h1>Pedidos de la tienda</h1>
        <p className="text-secondary mb-0">Revisa las compras de los clientes y su estado de entrega.</p>
      </header>

      <MenuRecepcion />

      {errorAccion && (
        <Alert variant="danger" role="alert">
          {errorAccion}
        </Alert>
      )}

      {cargando && (
        <p className="text-secondary" role="status">
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

      {!cargando && !error && (
        <>
          <Form.Select
            aria-label="Filtrar por estado"
            className="mb-3 w-auto"
            value={filtroEstado}
            onChange={(evento) => setFiltroEstado(evento.target.value)}
          >
            <option value="">Todos los estados</option>
            {Object.entries(ETIQUETAS_ESTADO).map(([codigo, etiqueta]) => (
              <option key={codigo} value={codigo}>
                {etiqueta}
              </option>
            ))}
          </Form.Select>

          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Comuna</th>
                  <th className="text-end">Total</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((pedido) => (
                  <FilaPedido
                    key={pedido.id}
                    pedido={pedido}
                    abierto={abierto === pedido.id}
                    onAlternar={() => setAbierto(abierto === pedido.id ? null : pedido.id)}
                    onEntregar={() => entregar(pedido.id)}
                    onCancelar={() => cancelarConConfirmacion(pedido)}
                  />
                ))}
                {visibles.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-secondary py-4">
                      No hay pedidos para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </main>
  );
}

function FilaPedido({ pedido, abierto, onAlternar, onEntregar, onCancelar }) {
  return (
    <>
      <tr>
        <td>#{pedido.numero}</td>
        <td className="text-nowrap">{new Date(`${pedido.fecha}T12:00:00`).toLocaleDateString("es-CL")}</td>
        <td>
          {pedido.nombre} {pedido.apellidos}
          <br />
          <small className="text-secondary">{pedido.correo}</small>
        </td>
        <td>{pedido.comuna}</td>
        <td className="text-end">{formatearPrecio(pedido.total)}</td>
        <td>
          <EstadoPedido estado={pedido.estado} />
        </td>
        <td className="text-end text-nowrap">
          <Button variant="outline-secondary" size="sm" className="me-2" onClick={onAlternar} aria-expanded={abierto}>
            {abierto ? "Ocultar" : "Ver detalle"}
          </Button>
          {pedido.estado === "PAGADO" && (
            <>
              <Button variant="outline-success" size="sm" className="me-2" onClick={onEntregar}>
                Marcar entregado
              </Button>
              <Button variant="outline-danger" size="sm" onClick={onCancelar}>
                Cancelar
              </Button>
            </>
          )}
        </td>
      </tr>
      {abierto && (
        <tr>
          <td colSpan="7" className="bg-light">
            <LineasPedido lineas={pedido.lineas} />
            <p className="small mt-2 mb-0">
              <strong>Despacho:</strong> {pedido.calle}
              {pedido.departamento ? `, depto. ${pedido.departamento}` : ""}, {pedido.comuna}, {pedido.region}
              {pedido.indicaciones ? ` · ${pedido.indicaciones}` : ""}
            </p>
          </td>
        </tr>
      )}
    </>
  );
}

export default GestionPedidos;
