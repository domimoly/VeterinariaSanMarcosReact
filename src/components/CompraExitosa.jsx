import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { formatearPrecio } from "../utils/precios";
import { obtenerUsuarioSesion, ROLES } from "../utils/sesion";
import DatosCliente from "./DatosCliente";
import TablaCarrito from "./TablaCarrito";

function CompraExitosa({ compra }) {
  // El personal ve todos los pedidos en su módulo; el tutor, solo los suyos
  const esPersonal = [ROLES.recepcionista, ROLES.administrador].includes(obtenerUsuarioSesion()?.rol);
  const rutaPedidos = esPersonal ? "/recepcion/pedidos" : "/mis-pedidos";

  return (
    <div className="card shadow-sm p-4">
      <p className="text-end small text-secondary mb-1">Código orden: ORDER{compra.numero}</p>
      <h1 className="h3">✅ Se ha realizado la compra. nro #{compra.numero}</h1>
      <p className="text-secondary small">Estos son los datos de tu compra</p>

      <DatosCliente datos={compra.datos} />
      <TablaCarrito lineas={compra.lineas} />

      <div className="card shadow-sm p-3 text-center mb-3">
        <p className="h4 mb-0">Total pagado: {formatearPrecio(compra.total)}</p>
      </div>

      <div className="d-flex justify-content-center gap-2 flex-wrap">
        <Link to={rutaPedidos} className="btn btn-sm btn-contacto">
          {esPersonal ? "Ver pedidos" : "Ver mis pedidos"}
        </Link>
        <Link to="/tienda" className="btn btn-sm btn-outline-secondary">
          Seguir comprando
        </Link>
        <Button type="button" variant="danger" size="sm" disabled>
          Imprimir boleta en PDF
        </Button>
        <Button type="button" variant="success" size="sm" disabled>
          Enviar boleta por email
        </Button>
      </div>
    </div>
  );
}

export default CompraExitosa;
