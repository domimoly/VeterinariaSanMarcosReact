function TarjetaResena({ resena }) {
  return (
    <div className="resena-card p-3 bg-white">
      <div className="d-flex justify-content-between flex-wrap">
        <strong>{resena.autor}</strong>
        <span className="resena-estrellas" aria-label={`${resena.estrellas} de 5 estrellas`}>
          {"★".repeat(resena.estrellas)}
          {"☆".repeat(5 - resena.estrellas)}
        </span>
      </div>
      <p className="mb-0 text-secondary">{resena.texto}</p>
    </div>
  );
}

export default TarjetaResena;
