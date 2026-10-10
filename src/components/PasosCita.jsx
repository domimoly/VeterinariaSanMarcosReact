function estadoDelPaso(numero, pasoActual) {
  if (numero < pasoActual) return "completado";
  if (numero === pasoActual) return "activo";
  return "pendiente";
}

function PasosCita({ pasos, pasoActual }) {
  return (
    <nav aria-label="Pasos para agendar la cita">
      <ol className="pasos-cita list-unstyled d-flex justify-content-between gap-2 mb-4">
        {pasos.map((nombre, indice) => {
          const numero = indice + 1;
          const estado = estadoDelPaso(numero, pasoActual);

          return (
            <li
              key={nombre}
              className={`paso-cita paso-${estado}`}
              aria-current={estado === "activo" ? "step" : undefined}
            >
              <span className="paso-cita-numero">{estado === "completado" ? "✓" : numero}</span>
              <span className="paso-cita-nombre d-none d-sm-inline">{nombre}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default PasosCita;