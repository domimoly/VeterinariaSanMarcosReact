function FilaResumen({ titulo, valor }) {
  return (
    <div className="resumen-cita-fila">
      <dt>{titulo}</dt>
      <dd className="mb-0">{valor || <span className="text-secondary">Pendiente</span>}</dd>
    </div>
  );
}

export default FilaResumen;