import { Button } from "react-bootstrap";
import { formatearPrecio } from "../utils/precios";
import DatosCliente from "./DatosCliente";
import TablaCarrito from "./TablaCarrito";

function CompraFallida({ compra, onReintentar }) {
  return (
    <div className="card shadow-sm p-4">
      <h1 className="h3">❌ No se pudo realizar el pago. nro #{compra.numero}</h1>
      <p className="text-secondary small">Detalle de compra</p>

      <div className="text-center mb-3">
        <Button type="button" className="btn-contacto text-uppercase" onClick={onReintentar}>
          Volver a realizar el pago
        </Button>
      </div>

      <DatosCliente datos={compra.datos} />
      <TablaCarrito lineas={compra.lineas} />

      <div className="card shadow-sm p-3 text-center">
        <p className="h4 mb-0">Total a pagar: {formatearPrecio(compra.total)}</p>
      </div>
    </div>
  );
}

export default CompraFallida;
