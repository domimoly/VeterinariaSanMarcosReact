import { Button } from "react-bootstrap";

const iconos = {
  Perro: "fa-solid fa-dog",
  Gato: "fa-solid fa-cat",
  Conejo: "fa-solid fa-paw",
  Ave: "fa-solid fa-dove",
};

function calcularEdad(fechaNacimiento) {
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + hoy.getMonth() - nacimiento.getMonth();
  if (hoy.getDate() < nacimiento.getDate()) meses--;

  if (meses < 1) return "Menos de 1 mes";
  if (meses < 12) return `${meses} meses`;
  const anios = Math.floor(meses / 12);
  return `${anios} ${anios === 1 ? "año" : "años"}`;
}

function TarjetaMascota({ mascota, onEditar, onEliminar }) {
  return (
    <div className="tarjeta-mascota card h-100 shadow-sm p-3">
      <div className="d-flex align-items-center gap-3 mb-3">
        <i className={`${iconos[mascota.especie]} icono-mascota`} aria-hidden="true"></i>
        <div>
          <h3 className="h5 mb-0">{mascota.nombre}</h3>
          <small className="text-secondary">
            {mascota.especie} · {mascota.raza || "Sin raza definida"}
          </small>
        </div>
      </div>

      <ul className="list-unstyled small flex-grow-1">
        <li><strong>Sexo:</strong> {mascota.sexo}</li>
        <li><strong>Edad:</strong> {calcularEdad(mascota.fechaNacimiento)}</li>
        <li><strong>Peso:</strong> {mascota.peso} kg</li>
        <li><strong>Esterilizado:</strong> {mascota.esterilizado ? "Sí" : "No"}</li>
        <li><strong>Observaciones:</strong> {mascota.observaciones || "Ninguna"}</li>
      </ul>

      <div className="d-flex gap-2">
        <Button size="sm" className="btn-servicio" onClick={() => onEditar(mascota)}>
          Editar
        </Button>
        <Button size="sm" variant="outline-danger" onClick={() => onEliminar(mascota.id)}>
          Eliminar
        </Button>
      </div>
    </div>
  );
}

export default TarjetaMascota;