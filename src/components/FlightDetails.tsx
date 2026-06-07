import { useAircraft } from '../context/AircraftContext';

function row(label: string, value: string | number | null | undefined) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: 11, color: '#6b7280' }}>{label}</span>
      <span style={{ fontSize: 12, color: '#1f2937', fontWeight: 500 }}>{value ?? '—'}</span>
    </div>
  );
}

export default function FlightDetails() {
  const { selectedAircraft, trailMap } = useAircraft();

  if (!selectedAircraft) return null;

  const ac = selectedAircraft;
  const trail = trailMap.get(ac.hex) ?? [];
  const altStr = typeof ac.alt_baro === 'number'
    ? `${ac.alt_baro.toLocaleString()} ft`
    : (ac.alt_baro ?? '—');

  const isEmergency = (ac.emergency != null && ac.emergency !== 'none') ||
    ac.squawk === '7700' || ac.squawk === '7500' || ac.squawk === '7600';

  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: isEmergency ? '#ef4444' : '#1f2937' }}>
            {ac.flight?.trim() || ac.hex}
          </div>
          {isEmergency && (
            <div style={{ fontSize: 11, fontWeight: 600, color: '#ef4444' }}>
              EMERGENCY{ac.squawk ? ` • SQUAWK ${ac.squawk}` : ''}
            </div>
          )}
        </div>
      </div>

      {row('ICAO Hex', ac.hex)}
      {row('Rejestracja', ac.r)}
      {row('Typ', ac.t)}
      {row('Kategoria', ac.category)}
      {row('Wysokość baro', altStr)}
      {row('Wysokość geom.', ac.alt_geom != null ? `${ac.alt_geom.toLocaleString()} ft` : null)}
      {row('Prędkość (GS)', ac.gs != null ? `${Math.round(ac.gs)} kts` : null)}
      {row('Kurs', ac.track != null ? `${Math.round(ac.track)}°` : null)}
      {row('Zmiana wys.', ac.baro_rate != null ? `${ac.baro_rate} ft/min` : null)}
      {row('Squawk', ac.squawk)}
      {row('Emergency', ac.emergency)}
      {row('Lat / Lon', ac.lat != null && ac.lon != null ? `${ac.lat.toFixed(4)}, ${ac.lon.toFixed(4)}` : null)}
      {row('Nav. wysokość', ac.nav_altitude_mcp != null ? `${ac.nav_altitude_mcp.toLocaleString()} ft` : null)}
      {row('Nav. kurs', ac.nav_heading != null ? `${Math.round(ac.nav_heading)}°` : null)}
      {row('Widziany', `${ac.seen.toFixed(1)} s temu`)}
      {row('Punkty trasy', trail.length.toString())}
    </div>
  );
}
