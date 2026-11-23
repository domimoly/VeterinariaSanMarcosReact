import { useState } from "react";
import { Alert, Button, Form, InputGroup, Table } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import FormularioProducto from "../../components/Admin/FormularioProducto";
import MenuAdmin from "../../components/Admin/MenuAdmin";
import { useProductos } from "../../hooks/useProductos";
import { CATEGORIAS } from "../../services/productoService";
import { formatearPrecio } from "../../utils/precios";
import "./Usuarios.css";

const STOCK_BAJO = 5;

// Mantenedor del catálogo de la tienda (ms-productos): crear, editar precio y stock, ocultar y eliminar.
function Productos() {
  const { productos, cargando, error, errorAccion, sesionVencida, recargar, limpiarError, crear, actualizar, eliminar } =
    useProductos({ incluirInactivos: true });

  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [formulario, setFormulario] = useState(null); // { producto } con el formulario abierto (producto = null: nuevo)
  const [guardando, setGuardando] = useState(false);

  const texto = busqueda.trim().toLowerCase();
  const filtrados = productos.filter(
    (p) =>
      `${p.codigo} ${p.nombre}`.toLowerCase().includes(texto) &&
      (filtroCategoria === "Todas" || p.categoria === filtroCategoria)
  );
  const visibles = productos.filter((p) => p.activo).length;
  const pocoStock = productos.filter((p) => p.activo && p.stock <= STOCK_BAJO).length;

  function abrirFormulario(producto = null) {
    limpiarError();
    setFormulario({ producto });
  }

  async function guardar(datos) {
    const { producto } = formulario;
    setGuardando(true);
    const guardado = producto ? await actualizar(producto.id, datos) : await crear(datos);
    setGuardando(false);
    if (guardado) setFormulario(null);
  }

  const alternarVisibilidad = (producto) => actualizar(producto.id, { ...producto, activo: !producto.activo });

  async function eliminarConConfirmacion(producto) {
    if (!window.confirm(`¿Eliminar ${producto.nombre}? Los pedidos anteriores conservan su registro.`)) return;
    await eliminar(producto.id);
  }

  if (sesionVencida) return <Navigate to="/sesion-requerida" replace />;

  return (
    <main className="container admin-usuarios py-4 py-lg-5">
      <div className="admin-migas mb-3">
        <Link to="/">Inicio</Link>
        <span>/</span>
        <span>Administración</span>
      </div>
      <header className="admin-encabezado mb-4">
        <div>
          <span className="admin-etiqueta">Administración</span>
          <h1>Productos de la tienda</h1>
          <p className="mb-0">Actualiza precios y stock, y decide qué productos se muestran a los clientes.</p>
        </div>
        <div className="admin-encabezado-acciones">
          <Button className="admin-btn-guardar" onClick={() => abrirFormulario()}>
            Nuevo producto
          </Button>
        </div>
      </header>

      <MenuAdmin />

      {errorAccion && !formulario && (
        <Alert variant="danger" role="alert">
          {errorAccion}
        </Alert>
      )}

      {cargando ? (
        <p className="text-secondary" role="status">
          Cargando productos...
        </p>
      ) : error ? (
        <Alert variant="danger" role="alert">
          {error}{" "}
          <Alert.Link as="button" type="button" onClick={recargar}>
            Reintentar
          </Alert.Link>
        </Alert>
      ) : (
        <>
          <section className="row g-3 mb-4" aria-label="Resumen de productos">
            <div className="col-12 col-sm-4">
              <article className="admin-resumen">
                <div>
                  <span>Total de productos</span>
                  <strong>{productos.length}</strong>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-4">
              <article className="admin-resumen">
                <div>
                  <span>Visibles en la tienda</span>
                  <strong>{visibles}</strong>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-4">
              <article className="admin-resumen">
                <div>
                  <span>Con poco stock (≤ {STOCK_BAJO})</span>
                  <strong>{pocoStock}</strong>
                </div>
              </article>
            </div>
          </section>

          <section className="admin-tabla-caja">
            <div className="admin-tabla-titulo">
              <div>
                <h2>Catálogo</h2>
                <p>Un producto oculto no aparece en la tienda, pero conserva su historial de ventas.</p>
              </div>
              <span className="admin-conteo">
                {filtrados.length} resultado{filtrados.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="admin-filtros">
              <InputGroup className="admin-busqueda">
                <Form.Control
                  aria-label="Buscar productos"
                  placeholder="Buscar por código o nombre..."
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                />
              </InputGroup>
              <Form.Select
                aria-label="Filtrar por categoría"
                value={filtroCategoria}
                onChange={(evento) => setFiltroCategoria(evento.target.value)}
              >
                <option value="Todas">Todas las categorías</option>
                {CATEGORIAS.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </Form.Select>
            </div>

            <div className="table-responsive">
              <Table hover className="admin-tabla align-middle mb-0">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th className="text-end">Precio</th>
                    <th className="text-end">Stock</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((producto) => (
                    <tr key={producto.id}>
                      <td>
                        <div className="admin-usuario-celda">
                          {producto.imagen && (
                            <img src={producto.imagen} alt="" width={40} height={40} className="object-fit-contain" />
                          )}
                          <div>
                            <strong>{producto.nombre}</strong>
                            <small>{producto.codigo}</small>
                          </div>
                        </div>
                      </td>
                      <td>{producto.categoria}</td>
                      <td className="text-end">{formatearPrecio(producto.precio)}</td>
                      <td className={`text-end ${producto.stock <= STOCK_BAJO ? "text-danger fw-bold" : ""}`}>
                        {producto.stock}
                      </td>
                      <td>
                        <span className={`admin-estado ${producto.activo ? "activo" : "inactivo"}`}>
                          <span />
                          {producto.activo ? "Visible" : "Oculto"}
                        </span>
                      </td>
                      <td className="text-end text-nowrap">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="admin-btn-editar me-2"
                          onClick={() => abrirFormulario(producto)}
                          aria-label={`Editar ${producto.nombre}`}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                          onClick={() => alternarVisibilidad(producto)}
                          aria-label={`${producto.activo ? "Ocultar" : "Mostrar"} ${producto.nombre}`}
                        >
                          {producto.activo ? "Ocultar" : "Mostrar"}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => eliminarConConfirmacion(producto)}
                          aria-label={`Eliminar ${producto.nombre}`}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan="6">
                        <div className="admin-vacio">
                          <strong>No se encontraron productos</strong>
                          <span>Prueba con otro término o cambia el filtro.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </section>
        </>
      )}

      {formulario && (
        <FormularioProducto
          producto={formulario.producto}
          guardando={guardando}
          error={errorAccion}
          onGuardar={guardar}
          onCancelar={() => setFormulario(null)}
        />
      )}
    </main>
  );
}

export default Productos;
