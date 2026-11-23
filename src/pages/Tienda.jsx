import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import TarjetaProducto from "../components/TarjetaProducto";
import { useProductos } from "../hooks/useProductos";
import { agregarProducto, contarUnidades, guardarCarrito, leerCarrito } from "../utils/carrito";

function Tienda() {
  const { productos, cargando, error, recargar } = useProductos();
  const [carrito, setCarrito] = useState(() => leerCarrito());
  const [ultimoAgregado, setUltimoAgregado] = useState("");

  useEffect(() => {
    guardarCarrito(carrito);
  }, [carrito]);

  function agregarAlCarrito(codigo) {
    const producto = productos.find((p) => p.codigo === codigo);
    if (!producto) return;
    setCarrito(agregarProducto(carrito, codigo, producto.stock));
    setUltimoAgregado(producto.nombre);
  }

  return (
    <main className="container py-4">
      <header className="encabezado-pagina text-center mb-4">
        <h1>Productos</h1>
        <p className="text-secondary mb-0">Medicamentos, antiparasitarios y accesorios para tu mascota.</p>
      </header>

      {ultimoAgregado && (
        <Alert variant="success" dismissible onClose={() => setUltimoAgregado("")} role="status" className="d-flex align-items-center gap-2 flex-wrap">
          <span>
            <strong>{ultimoAgregado}</strong> se añadió al carrito.
          </span>
          <Link to="/carrito" className="ms-sm-auto me-sm-4 fw-bold">
            Ver carrito ({contarUnidades(carrito)})
          </Link>
        </Alert>
      )}

      {cargando && (
        <p className="text-center text-secondary" role="status">
          Cargando productos...
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

      {!cargando && !error && productos.length === 0 && (
        <p className="text-center text-secondary">Por ahora no hay productos disponibles.</p>
      )}

      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
        {productos.map((producto) => {
          const itemEnCarrito = carrito.find((item) => item.codigo === producto.codigo);

          return (
            <div className="col" key={producto.codigo}>
              <TarjetaProducto
                producto={producto}
                cantidadEnCarrito={itemEnCarrito?.cantidad ?? 0}
                onAgregar={agregarAlCarrito}
              />
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default Tienda;
