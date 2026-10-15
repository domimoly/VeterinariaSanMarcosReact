import { useEffect, useState } from "react";
import { productos } from "../data/productos";
import { agregarProducto, guardarCarrito, leerCarrito } from "../utils/carrito";
import TarjetaProducto from "../components/TarjetaProducto";

function Tienda() {
  const [carrito, setCarrito] = useState(() => leerCarrito());

  useEffect(() => {
    guardarCarrito(carrito);
  }, [carrito]);

  function agregarAlCarrito(codigo) {
    setCarrito(agregarProducto(carrito, codigo));
  }

  return (
    <main className="container py-4">
      <header className="encabezado-pagina text-center mb-5">
        <h1>Productos</h1>
        <p className="text-secondary mb-0">Medicamentos, antiparasitarios y accesorios para tu mascota.</p>
      </header>

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
