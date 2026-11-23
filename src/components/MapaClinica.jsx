import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconoMarcador from "leaflet/dist/images/marker-icon.png";
import iconoMarcador2x from "leaflet/dist/images/marker-icon-2x.png";
import sombraMarcador from "leaflet/dist/images/marker-shadow.png";
import { CLINICA, urlComoLlegar } from "../utils/clinica";

const iconoClinica = L.icon({
  iconUrl: iconoMarcador,
  iconRetinaUrl: iconoMarcador2x,
  shadowUrl: sombraMarcador,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapaClinica() {
  const contenedor = useRef(null);
  const mapa = useRef(null);
  const marcadorUsuario = useRef(null);
  const [origen, setOrigen] = useState(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const instancia = L.map(contenedor.current).setView([CLINICA.latitud, CLINICA.longitud], 16);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; Colaboradores de OpenStreetMap",
    }).addTo(instancia);
    L.marker([CLINICA.latitud, CLINICA.longitud], { icon: iconoClinica, title: CLINICA.nombre })
      .addTo(instancia)
      .bindPopup(`<strong>${CLINICA.nombre}</strong><br>${CLINICA.direccion}`)
      .openPopup();
    mapa.current = instancia;
    return () => {
      instancia.remove();
      mapa.current = null;
      marcadorUsuario.current = null;
    };
  }, []);

  function usarMiUbicacion() {
    if (!navigator.geolocation) {
      setAviso("Tu navegador no permite obtener la ubicación.");
      return;
    }
    setAviso("Buscando tu ubicación…");
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const punto = { latitud: posicion.coords.latitude, longitud: posicion.coords.longitude };
        setOrigen(punto);
        setAviso("");
        if (!mapa.current) return;
        if (marcadorUsuario.current) marcadorUsuario.current.remove();
        marcadorUsuario.current = L.circleMarker([punto.latitud, punto.longitud], {
          radius: 8,
          color: "#0d6efd",
          fillOpacity: 0.8,
        })
          .addTo(mapa.current)
          .bindPopup("Tu ubicación");
        mapa.current.fitBounds(
          [
            [punto.latitud, punto.longitud],
            [CLINICA.latitud, CLINICA.longitud],
          ],
          { padding: [40, 40] }
        );
      },
      () => setAviso("No pudimos obtener tu ubicación. Revisa el permiso del navegador."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="d-flex flex-column gap-3 h-100">
      <div
        ref={contenedor}
        className="contacto-mapa flex-grow-1"
        role="region"
        aria-label={`Mapa con la ubicación de ${CLINICA.nombre}`}
      />
      <p className="text-white mb-0">📍 {CLINICA.direccion}</p>
      <div className="d-flex flex-wrap gap-2 align-items-center">
        <button type="button" className="btn btn-outline-light" onClick={usarMiUbicacion}>
          Usar mi ubicación
        </button>
        <a
          href={urlComoLlegar(origen)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-contacto"
        >
          Cómo llegar
        </a>
      </div>
      {aviso && (
        <p className="text-warning small mb-0" role="status">
          {aviso}
        </p>
      )}
    </div>
  );
}

export default MapaClinica;
