import { Button, Col, Form, Row } from "react-bootstrap";

const estados = ["Pendiente", "Confirmada", "Reagendada", "Cancelada"];

function FiltrosCitas({ filtros, onCambiar, onLimpiar }) {
  return (
    <Form className="mb-4" onSubmit={(evento) => evento.preventDefault()}>
      <Row className="g-3 align-items-end">
        <Col xs={12} md={4}>
          <Form.Group controlId="filtro-estado">
            <Form.Label>Estado</Form.Label>
            <Form.Select name="estado" value={filtros.estado} onChange={onCambiar}>
              <option value="">Todos</option>
              {estados.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col xs={12} md={4}>
          <Form.Group controlId="filtro-fecha">
            <Form.Label>Fecha</Form.Label>
            <Form.Control name="fecha" type="date" value={filtros.fecha} onChange={onCambiar} />
          </Form.Group>
        </Col>

        <Col xs={12} md={4}>
          <Button type="button" variant="outline-secondary" onClick={onLimpiar}>
            Limpiar filtros
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default FiltrosCitas;
