import { Badge } from "react-bootstrap";
import { ETIQUETAS_ESTADO } from "../../services/pedidoService";

const COLORES = { PAGADO: "primary", ENTREGADO: "success", CANCELADO: "secondary" };

function EstadoPedido({ estado }) {
  return <Badge bg={COLORES[estado] ?? "secondary"}>{ETIQUETAS_ESTADO[estado] ?? estado}</Badge>;
}

export default EstadoPedido;
