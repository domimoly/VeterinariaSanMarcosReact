import { Table } from "react-bootstrap";
import { formatearPrecio } from "../../utils/precios";

// Productos de un pedido, con el nombre y el precio del momento de la compra
function LineasPedido({ lineas }) {
  return (
    <Table size="sm" responsive className="align-middle mb-0">
      <thead>
        <tr>
          <th>Producto</th>
          <th className="text-end">Precio</th>
          <th className="text-end">Cantidad</th>
          <th className="text-end">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {lineas.map((linea) => (
          <tr key={linea.codigo}>
            <td>{linea.nombre}</td>
            <td className="text-end">{formatearPrecio(linea.precioUnitario)}</td>
            <td className="text-end">{linea.cantidad}</td>
            <td className="text-end">{formatearPrecio(linea.subtotal)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default LineasPedido;
