import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productos } from "../data/productos";
import { formatearPrecio } from "../utils/precios";
import { crearNumeroOrden, guardarCarrito, leerCarrito, pagoAprobado } from "../utils/carrito";
import TablaCarrito from "../components/TablaCarrito";
import FormularioCliente from "../components/FormularioCliente";
import CompraExitosa from "../components/CompraExitosa";
import CompraFallida from "../components/CompraFallida";

const datosVacios = {
  nombre: "",
  apellidos: "",
  correo: "",
  calle: "",
  departamento: "",
  region: "",
  comuna: "",
  indicaciones: "",
};

function Carrito() {
  const [carrito, setCarrito] = useState(() => leerCarrito());
  const [estado, setEstado] = useState("carrito"); // "carrito", "exito" o "error"
  const [datosCliente, setDatosCliente] = useState(datosVacios);
  const [compra, setCompra] = useState(null);

  useEffect(() => {
    guardarCarrito(carrito);
  }, [carrito]);

  // Une cada item guardado (codigo + cantidad) con los datos del catálogo
  const lineas = carrito
    .map((item) => ({ producto: productos.find((p) => p.codigo === item.codigo), cantidad: item.cantidad }))
    .filter((linea) => linea.producto);

  let total = 0;
  lineas.forEach((linea) => {
    total += linea.producto.precio * linea.cantidad;
  });

  function pagar(datos) {
    const numero = crearNumeroOrden();
    setDatosCliente(datos);
    setCompra({ numero, datos, lineas, total });

    if (pagoAprobado()) {
      setCarrito([]);
      setEstado("exito");
    } else {
      setEstado("error");
    }
  }

  return (
    <main className="container py-4">
      {estado === "exito" && <CompraExitosa compra={compra} />}

      {estado === "error" && <CompraFallida compra={compra} onReintentar={() => setEstado("carrito")} />}

      {estado === "carrito" && lineas.length === 0 && (
        <div className="card shadow-sm p-4 text-center" role="status">
          <h1 className="h3">Carrito de compra</h1>
          <p>Tu carrito está vacío.</p>
          <div>
            <Link to="/tienda" className="btn btn-servicio">
              Ir a la tienda
            </Link>
          </div>
        </div>
      )}

      {estado === "carrito" && lineas.length > 0 && (
        <div className="card shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
            <div>
              <h1 className="h3">Carrito de compra</h1>
              <p className="text-secondary small mb-0">Completa la siguiente información</p>
            </div>
            <div className="total-destacado">Total a pagar: {formatearPrecio(total)}</div>
          </div>

          <TablaCarrito lineas={lineas} />
          <FormularioCliente datosIniciales={datosCliente} total={total} onPagar={pagar} />
        </div>
      )}
    </main>
  );
}

export default Carrito;
