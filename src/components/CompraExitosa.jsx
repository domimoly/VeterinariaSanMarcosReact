import { Button } from "react-bootstrap";
import { formatearPrecio } from "../utils/precios";
import DatosCliente from "./DatosCliente";
import TablaCarrito from "./TablaCarrito";

function CompraExitosa({ compra }) {
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

      <div className="d-flex justify-content-center gap-2">
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
