import { useAircraft } from '../context/AircraftContext';
import { useFilteredAircraft } from '../hooks/useFilteredAircraft';
import type { Aircraft } from '../types/aircraft';

function altitudeStr(alt: number | string | null): string {
  if (alt == null) return '—';
  if (typeof alt === 'number') return `${alt.toLocaleString()} ft`;
  return alt;
}

function AircraftRow({ ac, selected }: { ac: Aircraft; selected: boolean }) {
  const { setSelectedAircraft } = useAircraft();
  const isEmergency = (ac.emergency != null && ac.emergency !== 'none') ||
    ac.squawk === '7700' || ac.squawk === '7500' || ac.squawk === '7600';

  return (
    <div
      onClick={() => setSelectedAircraft(selected ? null : ac)}
      style={{
        padding: '7px 8px',
        cursor: 'pointer',
        borderBottom: '1px solid #f3f4f6',
        background: selected ? '#eff6ff' : isEmergency ? '#fef2f2' : 'white',
        borderLeft: selected ? '3px solid #3b82f6' : isEmergency ? '3px solid #ef4444' : '3px solid transparent',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: isEmergency ? '#ef4444' : '#1f2937' }}>
          {ac.flight?.trim() || ac.hex}
        </span>
        <span style={{ fontSize: 11, color: '#6b7280' }}>{ac.t || '—'}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontSize: 11, color: '#6b7280' }}>{ac.r || ac.hex}</span>
        <span style={{ fontSize: 11, color: '#374151' }}>{altitudeStr(ac.alt_baro)}</span>
      </div>
      {isEmergency && (
        <div style={{ fontSize: 10, color: '#ef4444', fontWeight: 600, marginTop: 2 }}>
          EMERGENCY {ac.squawk ? `• SQUAWK ${ac.squawk}` : ''}
        </div>
      )}
    </div>
  );
}

export default function AircraftList() {
  const { selectedAircraft, loading, error } = useAircraft();
  const filtered = useFilteredAircraft();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>Samoloty</span>
        <span style={{ fontSize: 11, color: '#6b7280' }}>
          {loading ? 'Aktualizacja...' : `${filtered.length} widocznych`}
        </span>
      </div>
      {error && (
        <div style={{ padding: '6px 8px', background: '#fef2f2', color: '#ef4444', fontSize: 12, borderRadius: 4, margin: '6px 0' }}>
          {error}
        </div>
      )}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {filtered.length === 0 && !loading && (
          <div style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
            Brak samolotów spełniających kryteria
          </div>
        )}
        {filtered.map(ac => (
          <AircraftRow key={ac.hex} ac={ac} selected={selectedAircraft?.hex === ac.hex} />
        ))}
      </div>
    </div>
  );
}
