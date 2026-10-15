import { Col, Form, Row } from "react-bootstrap";
import { regiones } from "../data/Tutor/regiones";

function CampoSoloLectura({ id, etiqueta, valor }) {
  return (
    <Col xs={12} md={6}>
      <Form.Group controlId={`cliente-${id}`}>
        <Form.Label>{etiqueta}</Form.Label>
        <Form.Control type="text" value={valor} readOnly disabled />
      </Form.Group>
    </Col>
  );
}

function DatosCliente({ datos }) {
  const region = regiones.find((r) => r.id === datos.region);

  return (
    <>
      <Row className="g-3 mb-3">
        <CampoSoloLectura id="nombre" etiqueta="Nombre" valor={datos.nombre} />
        <CampoSoloLectura id="apellidos" etiqueta="Apellidos" valor={datos.apellidos} />
        <CampoSoloLectura id="correo" etiqueta="Correo" valor={datos.correo} />
      </Row>

      <h2 className="h5">Dirección de entrega de los productos</h2>
      <Row className="g-3 mb-3">
        <CampoSoloLectura id="calle" etiqueta="Calle" valor={datos.calle} />
        <CampoSoloLectura id="departamento" etiqueta="Departamento (opcional)" valor={datos.departamento} />
        <CampoSoloLectura id="region" etiqueta="Región" valor={region?.nombre ?? ""} />
        <CampoSoloLectura id="comuna" etiqueta="Comuna" valor={datos.comuna} />
        <Col xs={12}>
          <Form.Group controlId="cliente-indicaciones">
            <Form.Label>Indicaciones para la entrega (opcional)</Form.Label>
            <Form.Control as="textarea" rows={3} value={datos.indicaciones} readOnly disabled />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
}

export default DatosCliente;
