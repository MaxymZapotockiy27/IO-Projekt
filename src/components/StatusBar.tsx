import { useAircraft } from '../context/AircraftContext';

export default function StatusBar() {
  const { aircraft, error, mapCenter, mapRadius, refresh } = useAircraft();
  const withPos = aircraft.filter(a => a.lat != null && a.lon != null).length;

  return (
    <div style={{
      height: 32,
      background: '#1f2937',
      color: '#d1d5db',
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      gap: 16,
      fontSize: 12,
      flexShrink: 0,
    }}>
      <button
        onClick={refresh}
        style={{
          background: '#374151',
          border: '1px solid #4b5563',
          color: '#d1d5db',
          padding: '2px 10px',
          borderRadius: 3,
          cursor: 'pointer',
          fontSize: 11,
        }}
      >
        Odśwież
      </button>
      <span>
        {error
          ? <span style={{ color: '#f87171' }}>● Offline</span>
          : <span style={{ color: '#34d399' }}>● Online</span>
        }
      </span>
      <span>Samoloty: {aircraft.length} (z pozycją: {withPos})</span>
      <span style={{ marginLeft: 'auto' }}>Centrum: {mapCenter[0].toFixed(2)}°N, {mapCenter[1].toFixed(2)}°E</span>
      <span>Zasięg: {mapRadius} nm</span>
    </div>
  );
}
