import { Button } from "react-bootstrap";
import { formatearPrecio } from "../utils/precios";

function ItemCarrito({ producto, cantidad, onCambiarCantidad, onEliminar }) {
  return (
    <div className="card shadow-sm p-3 mb-3">
      <div className="row g-3 align-items-center">
        <div className="col-4 col-md-3 text-center">
          <img src={producto.imagen} alt={producto.nombre} className="carrito-imagen" />
        </div>
        <div className="col-8 col-md-9">
          <p className="etiqueta-producto mb-1">{producto.categoria}</p>
          <h2 className="h5">{producto.nombre}</h2>
          <p className="text-secondary small mb-2">{producto.descripcion}</p>
          <p className="fw-bold mb-2">
            {formatearPrecio(producto.precio * cantidad)}{" "}
            <small className="text-secondary fw-normal">({formatearPrecio(producto.precio)} c/u)</small>
          </p>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              disabled={cantidad <= 1}
              aria-label={`Quitar una unidad de ${producto.nombre}`}
              onClick={() => onCambiarCantidad(producto.codigo, -1)}
            >
              −
            </Button>
            <span>{cantidad}</span>
            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              disabled={cantidad >= producto.stock}
              aria-label={`Agregar una unidad de ${producto.nombre}`}
              onClick={() => onCambiarCantidad(producto.codigo, 1)}
            >
              +
            </Button>
            <Button
              type="button"
              variant="outline-danger"
              size="sm"
              className="ms-auto"
              onClick={() => onEliminar(producto.codigo)}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemCarrito;
