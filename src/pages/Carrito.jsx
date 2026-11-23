import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import CompraExitosa from "../components/CompraExitosa";
import CompraFallida from "../components/CompraFallida";
import FormularioCliente from "../components/FormularioCliente";
import ItemCarrito from "../components/ItemCarrito";
import { usePerfil } from "../hooks/usePerfil";
import { useProductos } from "../hooks/useProductos";
import { crearPedido } from "../services/pedidoService";
import {
  ajustarAlCatalogo,
  cambiarCantidad,
  guardarCarrito,
  leerCarrito,
  pagoAprobado,
  quitarProducto,
} from "../utils/carrito";
import { formatearPrecio } from "../utils/precios";
import { obtenerUsuarioSesion } from "../utils/sesion";

// El formulario parte con los datos del perfil (ms-auth); si no se pueden leer, con el nombre y el correo de la sesión
function datosIniciales(perfil, sesion) {
  const [nombreSesion = "", ...resto] = (sesion?.nombre ?? "").trim().split(/\s+/);
  return {
    nombre: perfil?.nombre ?? nombreSesion,
    apellidos: perfil ? perfil.apellidos : resto.join(" "),
    correo: perfil?.correo ?? sesion?.correo ?? "",
    calle: perfil?.direccion ?? "",
    departamento: "",
    region: perfil?.region ?? "",
    comuna: perfil?.comuna ?? "",
    indicaciones: "",
  };
}

function Carrito() {
  const usuario = obtenerUsuarioSesion();
  const { productos, cargando, error, recargar } = useProductos();
  const [carrito, setCarrito] = useState(() => leerCarrito());
  const [estado, setEstado] = useState("carrito"); // "carrito", "exito" o "error"
  const { perfil, cargando: cargandoPerfil } = usePerfil();
  // Lo que el cliente escribió al pagar (para conservarlo si el pago se rechaza); hasta entonces, el perfil
  const [datosPagados, setDatosPagados] = useState(null);
  const datosCliente = datosPagados ?? datosIniciales(perfil, usuario);
  const [compra, setCompra] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [errorCompra, setErrorCompra] = useState("");
  const [sesionVencida, setSesionVencida] = useState(false);

  useEffect(() => {
    guardarCarrito(carrito);
  }, [carrito]);

  // Cuando llega el catálogo, el carrito se ajusta a él (productos retirados o con menos stock)
  if (!cargando && !error) {
    const ajustado = ajustarAlCatalogo(carrito, productos);
    if (ajustado !== carrito) setCarrito(ajustado);
  }

  // Une cada item guardado (codigo + cantidad) con los datos actuales del catálogo
  const lineas = carrito
    .map((item) => ({ producto: productos.find((p) => p.codigo === item.codigo), cantidad: item.cantidad }))
    .filter((linea) => linea.producto);

  let total = 0;
  lineas.forEach((linea) => {
    total += linea.producto.precio * linea.cantidad;
  });

  function cambiar(codigo, cambio) {
    const producto = productos.find((p) => p.codigo === codigo);
    setCarrito(cambiarCantidad(carrito, codigo, cambio, producto?.stock));
  }

  async function pagar(datos) {
    setDatosPagados(datos);
    setErrorCompra("");

    if (!pagoAprobado()) {
      setCompra({ datos, lineas, total });
      setEstado("error");
      return;
    }

    setProcesando(true);
    try {
      const pedido = await crearPedido(
        datos,
        lineas.map((linea) => ({ codigo: linea.producto.codigo, cantidad: linea.cantidad }))
      );
      setCompra({ numero: pedido.numero, datos, lineas, total: pedido.total });
      setCarrito([]);
      setEstado("exito");
    } catch (e) {
      if (e.estado === 401) setSesionVencida(true);
      else {
        // Por ejemplo, otro cliente se llevó el último producto: se muestra el motivo y se actualiza el stock
        setErrorCompra(e.message);
        recargar();
      }
    } finally {
      setProcesando(false);
    }
  }

  if (sesionVencida) return <Navigate to="/sesion-requerida" replace />;

  return (
    <main className="container py-4">
      {estado === "exito" && <CompraExitosa compra={compra} />}

      {estado === "error" && <CompraFallida compra={compra} onReintentar={() => setEstado("carrito")} />}

      {estado === "carrito" && cargando && (
        <p className="text-center text-secondary" role="status">
          Cargando carrito...
        </p>
      )}

      {estado === "carrito" && !cargando && error && (
        <Alert variant="danger" role="alert">
          {error}{" "}
          <Alert.Link as="button" type="button" onClick={recargar}>
            Reintentar
          </Alert.Link>
        </Alert>
      )}

      {estado === "carrito" && !cargando && !error && lineas.length === 0 && (
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

      {estado === "carrito" && !cargando && !error && lineas.length > 0 && (
        <div className="card shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
            <div>
              <h1 className="h3">Carrito de compra</h1>
              <p className="text-secondary small mb-0">Revisa tus productos antes de pagar</p>
            </div>
            <div className="total-destacado">Total a pagar: {formatearPrecio(total)}</div>
          </div>

          {lineas.map((linea) => (
            <ItemCarrito
              key={linea.producto.codigo}
              producto={linea.producto}
              cantidad={linea.cantidad}
              onCambiarCantidad={cambiar}
              onEliminar={(codigo) => setCarrito(quitarProducto(carrito, codigo))}
            />
          ))}

          {cargandoPerfil ? (
            <p className="text-secondary mb-0" role="status">
              Cargando tus datos...
            </p>
          ) : (
            <FormularioCliente
              datosIniciales={datosCliente}
              total={total}
              onPagar={pagar}
              enviando={procesando}
              error={errorCompra}
            />
          )}
        </div>
      )}
    </main>
  );
}

export default Carrito;
