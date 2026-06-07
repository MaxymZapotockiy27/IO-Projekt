import { useState, useEffect } from 'react';
import { useAircraft } from '../context/AircraftContext';

export default function RadiusSettings() {
  const { mapCenter, mapRadius, commitArea } = useAircraft();
  const [radius, setRadius] = useState(String(mapRadius));
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { setRadius(String(mapRadius)); }, [mapRadius]);

  function apply() {
    const radN = parseInt(radius, 10);
    if (isNaN(radN) || radN < 1 || radN > 250) { setErr('Zasięg: 1 do 250 nm'); return; }
    setErr(null);
    commitArea(mapCenter, radN);
  }

  const label: React.CSSProperties = { fontSize: 11, color: '#6b7280', marginBottom: 2 };
  const input: React.CSSProperties = {
    width: '100%', padding: '3px 6px', fontSize: 12,
    border: '1px solid #d1d5db', borderRadius: 3, boxSizing: 'border-box',
  };

  return (
    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 8, paddingBottom: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Obszar obserwacji</div>
      <div style={{ marginBottom: 6 }}>
        <div style={label}>Zasięg: <strong>{mapRadius} nm</strong></div>
        <input
          type="number" min={1} max={250} value={radius}
          onChange={e => { setRadius(e.target.value); setErr(null); }}
          onKeyDown={e => e.key === 'Enter' && apply()}
          style={input}
        />
      </div>
      {err && <div style={{ color: '#ef4444', fontSize: 11, marginBottom: 4 }}>{err}</div>}
      <button
        onClick={apply}
        style={{
          width: '100%', padding: '4px 0', fontSize: 12,
          background: '#1f2937', color: 'white',
          border: 'none', borderRadius: 3, cursor: 'pointer',
        }}
      >
        Zastosuj
      </button>
    </div>
  );
}
