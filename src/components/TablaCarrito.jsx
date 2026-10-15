import { Table } from "react-bootstrap";
import { formatearPrecio } from "../utils/precios";

function TablaCarrito({ lineas }) {
  return (
    <Table responsive hover className="align-middle">
      <thead>
        <tr>
          <th>Imagen</th>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Cantidad</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {lineas.map((linea) => (
          <tr key={linea.producto.codigo}>
            <td>
              <img
                src={linea.producto.imagen}
                alt={linea.producto.nombre}
                width={48}
                height={48}
                className="object-fit-contain"
              />
            </td>
            <td>{linea.producto.nombre}</td>
            <td>{formatearPrecio(linea.producto.precio)}</td>
            <td>{linea.cantidad}</td>
            <td>{formatearPrecio(linea.producto.precio * linea.cantidad)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default TablaCarrito;
