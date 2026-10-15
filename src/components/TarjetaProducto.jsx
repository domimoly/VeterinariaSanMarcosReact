import { Button } from "react-bootstrap";
import { formatearPrecio } from "../utils/precios";

function TarjetaProducto({ producto, cantidadEnCarrito, onAgregar }) {
  const disponibles = producto.stock - cantidadEnCarrito;
  const sinStock = disponibles <= 0;

  return (
    <div className="card h-100 shadow-sm text-center p-3">
      <div className="producto-imagen mb-3">
        <img src={producto.imagen} alt={producto.nombre} />
      </div>
      <div className="card-body d-flex flex-column p-0">
        <h3 className="h5">{producto.nombre}</h3>
        <p className="text-secondary small flex-grow-1">{producto.descripcion}</p>
        <p className="producto-precio mb-1">{formatearPrecio(producto.precio)}</p>
        <p className={`small mb-1 ${disponibles <= 5 ? "text-danger fw-bold" : "text-secondary"}`}>
          {sinStock ? "Sin unidades disponibles" : `Stock disponible: ${disponibles}`}
        </p>
        {cantidadEnCarrito > 0 && <p className="small text-secondary mb-1">En tu carrito: {cantidadEnCarrito}</p>}
        <Button
          type="button"
          className="btn-servicio w-100 mt-2"
          disabled={sinStock}
          onClick={() => onAgregar(producto.codigo)}
        >
          {sinStock ? "Sin más stock" : "Añadir"}
        </Button>
      </div>
    </div>
  );
}

export default TarjetaProducto;
