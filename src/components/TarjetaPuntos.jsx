function TarjetaPuntos({ puntos }) {
  return (
    <div className="card shadow-sm p-4 h-100">
      <h2 id="titulo-puntos" className="h4">
        Puntos importantes
      </h2>
      <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
        {puntos.map((punto) => (
          <li key={punto.titulo}>
            {punto.icono} <strong>{punto.titulo}:</strong> {punto.texto}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TarjetaPuntos;
