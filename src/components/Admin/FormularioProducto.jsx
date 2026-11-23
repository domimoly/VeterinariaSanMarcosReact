import { useState } from "react";
import { Alert, Button, Col, Form, Modal, Row } from "react-bootstrap";
import { CATEGORIAS } from "../../services/productoService";

// Crear (producto = null) o editar un producto de la tienda. El código solo se escribe al crear.
function FormularioProducto({ producto, guardando = false, error = "", onGuardar, onCancelar }) {
  const editando = Boolean(producto);
  const [datos, setDatos] = useState({
    codigo: producto?.codigo ?? "",
    nombre: producto?.nombre ?? "",
    categoria: producto?.categoria ?? CATEGORIAS[0],
    descripcion: producto?.descripcion ?? "",
    precio: producto?.precio ?? "",
    stock: producto?.stock ?? "",
    imagen: producto?.imagen ?? "",
    activo: producto?.activo ?? true,
  });
  const [errores, setErrores] = useState({});

  function cambiar(evento) {
    const { name, value, type, checked } = evento.target;
    setDatos((actuales) => ({ ...actuales, [name]: type === "checkbox" ? checked : value }));
    setErrores((actuales) => ({ ...actuales, [name]: "" }));
  }

  function validar() {
    const nuevos = {};
    const codigo = datos.codigo.trim();
    const nombre = datos.nombre.trim();
    const precio = Number(datos.precio);
    const stock = Number(datos.stock);

    if (!codigo) nuevos.codigo = "El código es obligatorio";
    else if (!/^[A-Za-z0-9-]+$/.test(codigo)) nuevos.codigo = "Solo letras, números y guiones";
    else if (codigo.length > 20) nuevos.codigo = "Máximo 20 caracteres";

    if (!nombre) nuevos.nombre = "El nombre es obligatorio";
    else if (nombre.length < 2 || nombre.length > 100) nuevos.nombre = "El nombre debe tener entre 2 y 100 caracteres";

    if (datos.precio === "" || !Number.isInteger(precio) || precio < 1) nuevos.precio = "Ingresa un precio entero mayor a 0";
    if (datos.stock === "" || !Number.isInteger(stock) || stock < 0) nuevos.stock = "Ingresa un stock entero desde 0";
    if (datos.descripcion.length > 300) nuevos.descripcion = "Máximo 300 caracteres";
    return nuevos;
  }

  function enviar(evento) {
    evento.preventDefault();
    const nuevos = validar();
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    onGuardar({
      codigo: datos.codigo.trim().toUpperCase(),
      nombre: datos.nombre.trim(),
      categoria: datos.categoria,
      descripcion: datos.descripcion.trim(),
      precio: Number(datos.precio),
      stock: Number(datos.stock),
      imagen: datos.imagen.trim(),
      activo: datos.activo,
    });
  }

  return (
    <Modal show onHide={onCancelar} centered backdrop="static" className="admin-modal">
      <Form onSubmit={enviar} noValidate>
        <Modal.Header closeButton>
          <div>
            <span className="admin-etiqueta">{editando ? "Editar producto" : "Nuevo producto"}</span>
            <Modal.Title as="h2" className="h5 mb-0">
              {editando ? "Datos del producto" : "Crear producto"}
            </Modal.Title>
          </div>
        </Modal.Header>

        <Modal.Body>
          {error && (
            <Alert variant="danger" role="alert" className="py-2">
              {error}
            </Alert>
          )}

          <Row className="g-3">
            <Col xs={12} md={5}>
              <Form.Group controlId="producto-codigo">
                <Form.Label>Código</Form.Label>
                <Form.Control
                  name="codigo"
                  value={datos.codigo}
                  onChange={cambiar}
                  maxLength={20}
                  readOnly={editando}
                  placeholder="MED-016"
                  isInvalid={Boolean(errores.codigo)}
                />
                {editando && <Form.Text className="text-secondary">El código no se puede cambiar.</Form.Text>}
                <Form.Control.Feedback type="invalid">{errores.codigo}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} md={7}>
              <Form.Group controlId="producto-categoria">
                <Form.Label>Categoría</Form.Label>
                <Form.Select name="categoria" value={datos.categoria} onChange={cambiar}>
                  {CATEGORIAS.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="producto-nombre">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  name="nombre"
                  value={datos.nombre}
                  onChange={cambiar}
                  maxLength={100}
                  isInvalid={Boolean(errores.nombre)}
                />
                <Form.Control.Feedback type="invalid">{errores.nombre}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group controlId="producto-precio">
                <Form.Label>Precio (CLP)</Form.Label>
                <Form.Control
                  type="number"
                  name="precio"
                  min="1"
                  value={datos.precio}
                  onChange={cambiar}
                  isInvalid={Boolean(errores.precio)}
                />
                <Form.Control.Feedback type="invalid">{errores.precio}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group controlId="producto-stock">
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  type="number"
                  name="stock"
                  min="0"
                  value={datos.stock}
                  onChange={cambiar}
                  isInvalid={Boolean(errores.stock)}
                />
                <Form.Control.Feedback type="invalid">{errores.stock}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="producto-descripcion">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="descripcion"
                  value={datos.descripcion}
                  onChange={cambiar}
                  maxLength={300}
                  isInvalid={Boolean(errores.descripcion)}
                />
                <Form.Control.Feedback type="invalid">{errores.descripcion}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="producto-imagen">
                <Form.Label>Imagen (opcional)</Form.Label>
                <Form.Control name="imagen" value={datos.imagen} onChange={cambiar} maxLength={200} placeholder="/img/producto.jpg" />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Check
                type="switch"
                id="producto-activo"
                name="activo"
                label="Visible en la tienda"
                checked={datos.activo}
                onChange={cambiar}
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onCancelar} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" className="admin-btn-guardar" disabled={guardando}>
            {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear producto"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default FormularioProducto;
