import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

export const CENTRO_SAMAMBAIA = [-15.8755, -48.0860];

const criarIconePino = (cor) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width: 22px; height: 22px; border-radius: 50% 50% 50% 0;
      background: ${cor}; transform: rotate(-45deg);
      border: 2px solid #ffffff; box-shadow: 0 3px 8px rgba(0,0,0,0.65);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -22],
  });

const iconeUsuario = L.divIcon({
  className: '',
  html: `<div style="
    width: 16px; height: 16px; border-radius: 50%;
    background: #0ea5e9; border: 3px solid #ffffff;
    box-shadow: 0 0 0 6px rgba(14,165,233,0.35);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const icones = {
  ABERTO: criarIconePino('#ef4444'),
  EM_ANDAMENTO: criarIconePino('#f59e0b'),
  RESOLVIDO: criarIconePino('#10b981'),
  EVENTO: criarIconePino('#3b82f6'),
  SELECIONADO: criarIconePino('#a855f7'),
};

function CliqueNoMapa({ onSelecionarPonto }) {
  useMapEvents({
    click(e) {
      onSelecionarPonto([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function CentralizarMapa({ centro, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(centro, zoom, { duration: 0.7 });
  }, [centro, zoom, map]);
  return null;
}

function PinoArrastavel({ position, onSelecionarPonto, buscandoCep }) {
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          onSelecionarPonto([lat, lng]);
        }
      },
    }),
    [onSelecionarPonto]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={icones.SELECIONADO}
    >
      <Popup>
        <div className="text-dark">
          <strong>{buscandoCep ? 'Buscando CEP deste local...' : 'Local marcado (arraste para ajustar)'}</strong>
          <div className="small text-muted">
            {position[0].toFixed(5)}, {position[1].toFixed(5)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapaRegiao({
  ocorrencias,
  eventos,
  pontoSelecionado,
  minhaLocalizacao,
  onSelecionarPonto,
  centroMapa,
  zoomMapa,
  camadaSatelite,
  buscandoCep,
}) {
  return (
    <div className="rounded-3 overflow-hidden border border-secondary-subtle shadow position-relative" style={{ height: 450 }}>
      {buscandoCep && (
        <div
          className="position-absolute top-0 end-0 m-3 badge text-bg-dark border border-info px-3 py-2 shadow"
          style={{ zIndex: 1000 }}
        >
          Consultando CEP e endereço no mapa...
        </div>
      )}

      <MapContainer center={centroMapa} zoom={zoomMapa} style={{ height: '100%', width: '100%' }}>
        {camadaSatelite ? (
          <TileLayer
            attribution="Google Earth / Satellite"
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          />
        ) : (
          <TileLayer
            attribution="Google Maps"
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          />
        )}

        <CentralizarMapa centro={centroMapa} zoom={zoomMapa} />
        <CliqueNoMapa onSelecionarPonto={onSelecionarPonto} />

        {minhaLocalizacao && (
          <>
            <Circle center={minhaLocalizacao} radius={90} pathOptions={{ color: '#0ea5e9', fillOpacity: 0.12, weight: 1 }} />
            <Marker position={minhaLocalizacao} icon={iconeUsuario}>
              <Popup>
                <div className="text-dark small fw-semibold">Sua localização atual (GPS)</div>
              </Popup>
            </Marker>
          </>
        )}

        {pontoSelecionado && (
          <PinoArrastavel
            position={pontoSelecionado}
            onSelecionarPonto={onSelecionarPonto}
            buscandoCep={buscandoCep}
          />
        )}

        {ocorrencias.map((oc) => (
          <Marker key={`oc-${oc.id}`} position={[oc.latitude, oc.longitude]} icon={icones[oc.status] || icones.ABERTO}>
            <Popup>
              <div className="text-dark" style={{ maxWidth: 230 }}>
                <span className="badge bg-danger mb-1">{oc.quadra} • {oc.categoria}</span>
                <h6 className="fw-bold mb-1">{oc.titulo}</h6>
                <p className="small mb-2">{oc.descricao}</p>
                {oc.imagemBase64 && (
                  <img src={oc.imagemBase64} alt={oc.titulo} className="img-fluid rounded mb-2" style={{ maxHeight: 120, objectFit: 'cover', width: '100%' }} />
                )}
                <div className="small text-muted">{oc.localizacao}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {eventos.map((ev) => (
          <Marker key={`ev-${ev.id}`} position={[ev.latitude, ev.longitude]} icon={icones.EVENTO}>
            <Popup>
              <div className="text-dark" style={{ maxWidth: 230 }}>
                <span className="badge bg-primary mb-1">EVENTO • {ev.quadra}</span>
                <h6 className="fw-bold mb-1">{ev.titulo}</h6>
                <p className="small mb-2">{ev.descricao}</p>
                {ev.imagemBase64 && (
                  <img src={ev.imagemBase64} alt={ev.titulo} className="img-fluid rounded mb-2" style={{ maxHeight: 120, objectFit: 'cover', width: '100%' }} />
                )}
                <div className="small fw-semibold text-success">{ev.dataEvento}</div>
                <div className="small text-muted">{ev.local}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}