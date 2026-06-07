import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Polyline, useMap, LayersControl } from 'react-leaflet';
import { useAircraft } from '../context/AircraftContext';
import { useFilteredAircraft } from '../hooks/useFilteredAircraft';
import type { Aircraft } from '../types/aircraft';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createPlaneIcon(track: number | null, isSelected: boolean, isEmergency: boolean) {
  const rotation = track ?? 0;
  const color = isEmergency ? '#ef4444' : isSelected ? '#f59e0b' : '#3b82f6';
  const size = isSelected ? 28 : 22;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" style="transform:rotate(${rotation}deg)">
    <path fill="${color}" d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapMover() {
  const map = useMap();
  const { mapCenter } = useAircraft();
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      map.setView(mapCenter, map.getZoom());
      initialized.current = true;
    }
  }, [map, mapCenter]);
  return null;
}

function calcEdgePos(center: [number, number], radiusNm: number): [number, number] {
  const radiusM = radiusNm * 1852;
  const deltaLng = (radiusM / (6371000 * Math.cos(center[0] * Math.PI / 180))) * (180 / Math.PI);
  return [center[0], center[1] + deltaLng];
}

function CircleEditor() {
  const map = useMap();
  const { mapCenter, mapRadius, setMapCenter, setMapRadius } = useAircraft();

  const circleRef = useRef<L.Circle | null>(null);
  const centerMarkerRef = useRef<L.Marker | null>(null);
  const edgeMarkerRef = useRef<L.Marker | null>(null);
  const isDraggingRef = useRef(false);
  const stateRef = useRef({ center: mapCenter, radiusNm: mapRadius });

  useEffect(() => {
    const CROSSHAIR = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">',
      '<line x1="18" y1="2" x2="18" y2="14" stroke="#ef4444" stroke-width="2.5"/>',
      '<line x1="18" y1="22" x2="18" y2="34" stroke="#ef4444" stroke-width="2.5"/>',
      '<line x1="2" y1="18" x2="14" y2="18" stroke="#ef4444" stroke-width="2.5"/>',
      '<line x1="22" y1="18" x2="34" y2="18" stroke="#ef4444" stroke-width="2.5"/>',
      '<circle cx="18" cy="18" r="4" fill="rgba(239,68,68,0.15)" stroke="#ef4444" stroke-width="2.5"/>',
      '</svg>',
    ].join('');
    const HANDLE = '<div style="width:12px;height:12px;border-radius:50%;background:#ef4444;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4);cursor:ew-resize"></div>';

    const centerIcon = L.divIcon({ html: CROSSHAIR, className: '', iconSize: [36, 36], iconAnchor: [18, 18] });
    const edgeIcon = L.divIcon({ html: HANDLE, className: '', iconSize: [14, 14], iconAnchor: [7, 7] });

    const { center: initCenter, radiusNm: initRadius } = stateRef.current;

    const circle = L.circle(initCenter as L.LatLngExpression, {
      radius: initRadius * 1852,
      color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.08, weight: 1.5,
      interactive: false,
    }).addTo(map);

    const centerMarker = L.marker(initCenter as L.LatLngExpression, {
      icon: centerIcon, draggable: true, zIndexOffset: 1000,
    }).addTo(map);

    const edgeMarker = L.marker(calcEdgePos(initCenter, initRadius) as L.LatLngExpression, {
      icon: edgeIcon, draggable: true, zIndexOffset: 999,
    }).addTo(map);

    circleRef.current = circle;
    centerMarkerRef.current = centerMarker;
    edgeMarkerRef.current = edgeMarker;

    centerMarker.on('dragstart', () => { isDraggingRef.current = true; });
    centerMarker.on('drag', () => {
      const ll = centerMarker.getLatLng();
      stateRef.current.center = [ll.lat, ll.lng];
      circle.setLatLng(ll);
      edgeMarker.setLatLng(calcEdgePos([ll.lat, ll.lng], stateRef.current.radiusNm) as L.LatLngExpression);
    });
    centerMarker.on('dragend', () => {
      isDraggingRef.current = false;
      const ll = centerMarker.getLatLng();
      setMapCenter([parseFloat(ll.lat.toFixed(5)), parseFloat(ll.lng.toFixed(5))]);
    });

    edgeMarker.on('dragstart', () => { isDraggingRef.current = true; });
    edgeMarker.on('drag', () => {
      const center = centerMarker.getLatLng();
      const distM = center.distanceTo(edgeMarker.getLatLng());
      const distNm = Math.min(250, Math.max(1, distM / 1852));
      stateRef.current.radiusNm = distNm;
      circle.setRadius(distNm * 1852);
      if (distM > 250 * 1852) {
        edgeMarker.setLatLng(calcEdgePos([center.lat, center.lng], 250) as L.LatLngExpression);
      }
    });
    edgeMarker.on('dragend', () => {
      isDraggingRef.current = false;
      const distM = centerMarker.getLatLng().distanceTo(edgeMarker.getLatLng());
      const distNm = Math.min(250, Math.max(1, Math.round(distM / 1852)));
      stateRef.current.radiusNm = distNm;
      edgeMarker.setLatLng(calcEdgePos(stateRef.current.center, distNm) as L.LatLngExpression);
      setMapRadius(distNm);
    });

    return () => { circle.remove(); centerMarker.remove(); edgeMarker.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    if (isDraggingRef.current) return;
    const c = circleRef.current;
    const cm = centerMarkerRef.current;
    const em = edgeMarkerRef.current;
    if (!c || !cm || !em) return;
    stateRef.current = { center: mapCenter, radiusNm: mapRadius };
    c.setLatLng(mapCenter as L.LatLngExpression);
    c.setRadius(mapRadius * 1852);
    cm.setLatLng(mapCenter as L.LatLngExpression);
    em.setLatLng(calcEdgePos(mapCenter, mapRadius) as L.LatLngExpression);
  }, [mapCenter, mapRadius]);

  return null;
}

interface AircraftMarkerProps {
  ac: Aircraft;
  trail: [number, number][];
  isSelected: boolean;
}

function AircraftMarker({ ac, trail, isSelected }: AircraftMarkerProps) {
  const { setSelectedAircraft } = useAircraft();
  if (ac.lat == null || ac.lon == null) return null;

  const isEmergency = (ac.emergency != null && ac.emergency !== 'none') ||
    ac.squawk === '7700' || ac.squawk === '7500' || ac.squawk === '7600';

  const icon = createPlaneIcon(ac.track, isSelected, isEmergency);
  const altStr = typeof ac.alt_baro === 'number'
    ? `${ac.alt_baro.toLocaleString()} ft`
    : (ac.alt_baro ?? '—');

  void altStr;

  return (
    <>
      {trail.length > 1 && (
        <Polyline
          positions={trail}
          pathOptions={{ color: isEmergency ? '#ef4444' : isSelected ? '#f59e0b' : '#3b82f6', weight: isSelected ? 2 : 1, opacity: 0.7 }}
        />
      )}
      <Marker
        position={[ac.lat, ac.lon]}
        icon={icon}
        eventHandlers={{ click: () => setSelectedAircraft(ac) }}
      />
    </>
  );
}

export default function MapView() {
  const { selectedAircraft, trailMap } = useAircraft();
  const filtered = useFilteredAircraft();

  return (
    <MapContainer
      center={[52.0, 19.0]}
      zoom={6}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
    >
      <MapMover />
      <CircleEditor />
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Esri Satellite">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="© Esri"
          />
        </LayersControl.BaseLayer>
      </LayersControl>
      {filtered.map(ac => (
        <AircraftMarker
          key={ac.hex}
          ac={ac}
          trail={(trailMap.get(ac.hex) ?? []) as [number, number][]}
          isSelected={selectedAircraft?.hex === ac.hex}
        />
      ))}
    </MapContainer>
  );
}
