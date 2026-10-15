import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { productos } from "../data/productos";
import { formatearPrecio } from "../utils/precios";
import {
  agregarProducto,
  cambiarCantidadProducto,
  guardarCarrito,
  leerCarrito,
  quitarProducto,
} from "../utils/carrito";
import ItemCarrito from "../components/ItemCarrito";
import TarjetaProducto from "../components/TarjetaProducto";

function Carrito() {
  const [carrito, setCarrito] = useState(leerCarrito);
  const [compraRealizada, setCompraRealizada] = useState(false);

  useEffect(() => {
    guardarCarrito(carrito);
  }, [carrito]);

  function agregarAlCarrito(codigo) {
    setCarrito(agregarProducto(carrito, codigo));
  }

  function cambiarCantidad(codigo, cambio) {
    setCarrito(cambiarCantidadProducto(carrito, codigo, cambio));
  }

  function eliminarDelCarrito(codigo) {
    setCarrito(quitarProducto(carrito, codigo));
  }

  // Une cada item guardado (codigo + cantidad) con los datos del catálogo
  const lineas = carrito
    .map((item) => ({ producto: productos.find((p) => p.codigo === item.codigo), cantidad: item.cantidad }))
    .filter((linea) => linea.producto);

  let unidades = 0;
  let subtotal = 0;
  lineas.forEach((linea) => {
    unidades += linea.cantidad;
    subtotal += linea.producto.precio * linea.cantidad;
  });

  // Todavía no hay reglas de descuento
  const descuentos = 0;
  const total = subtotal - descuentos;

  const sugeridos = productos
    .filter((producto) => !carrito.some((item) => item.codigo === producto.codigo))
    .slice(0, 2);

  function continuarCompra() {
    setCarrito([]);
    setCompraRealizada(true);
  }

  return (
    <main className="container py-4">
      <header className="encabezado-pagina text-center mb-4">
        <h1>Carrito</h1>
      </header>

      <section aria-label="Carrito y resumen de compra" className="row g-4">
        <div className="col-12 col-lg-8">
          {lineas.length > 0 ? (
            lineas.map((linea) => (
              <ItemCarrito
                key={linea.producto.codigo}
                producto={linea.producto}
                cantidad={linea.cantidad}
                onCambiarCantidad={cambiarCantidad}
                onEliminar={eliminarDelCarrito}
              />
            ))
          ) : (
            <div className="card shadow-sm p-4 text-center" role="status">
              {compraRealizada ? (
                <p className="mb-3">¡Gracias por tu compra! (hehe)</p>
              ) : (
                <p className="mb-3">Tu carrito está vacío.</p>
              )}
              <div>
                <Link to="/tienda" className="btn btn-servicio">
                  Ir a la tienda
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="col-12 col-lg-4">
          <div className="card shadow-sm p-4">
            <h2 className="h4">Resumen de la compra</h2>
            <p className="mb-1">
              Productos ({unidades}): <strong>{formatearPrecio(subtotal)}</strong>
            </p>
            <p className="mb-1">
              Descuentos (0): <strong>{formatearPrecio(descuentos)}</strong>
            </p>
            <p className="mb-3">
              Total: <strong>{formatearPrecio(total)}</strong>
            </p>
            <Button type="button" className="btn-contacto" disabled={lineas.length === 0} onClick={continuarCompra}>
              Continuar compra
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="titulo-sugeridos" className="mt-5">
        <h2 id="titulo-sugeridos" className="text-center mb-4">
          ¿Y si le sumas algo más?
        </h2>
        <div className="row row-cols-1 row-cols-sm-2 g-4">
          {sugeridos.map((producto) => (
            <div className="col" key={producto.codigo}>
              <TarjetaProducto producto={producto} cantidadEnCarrito={0} onAgregar={agregarAlCarrito} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Carrito;
