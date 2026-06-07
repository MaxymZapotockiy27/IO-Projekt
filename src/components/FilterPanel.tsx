import { useAircraft } from '../context/AircraftContext';
import type { FilterState } from '../types/aircraft';

export default function FilterPanel() {
  const { filterState, setFilterState } = useAircraft();

  function update(partial: Partial<FilterState>) {
    setFilterState({ ...filterState, ...partial });
  }

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: '#374151' }}>Filtry</div>

      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Szukaj (lot / rejestracja / typ / ICAO)</label>
        <input
          style={inputStyle}
          type="text"
          placeholder="np. LOT, SP-LRA, A320..."
          value={filterState.search}
          onChange={e => update({ search: e.target.value })}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Typ samolotu</label>
        <input
          style={inputStyle}
          type="text"
          placeholder="np. A320, B738"
          value={filterState.aircraftType}
          onChange={e => update({ aircraftType: e.target.value })}
        />
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Min. wysokość (ft)</label>
          <input
            style={inputStyle}
            type="number"
            placeholder="0"
            value={filterState.minAltitude ?? ''}
            onChange={e => update({ minAltitude: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Max. wysokość (ft)</label>
          <input
            style={inputStyle}
            type="number"
            placeholder="60000"
            value={filterState.maxAltitude ?? ''}
            onChange={e => update({ maxAltitude: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', color: '#374151' }}>
        <input
          type="checkbox"
          checked={filterState.onlyWithPosition}
          onChange={e => update({ onlyWithPosition: e.target.checked })}
        />
        Tylko z pozycją GPS
      </label>

      <button
        onClick={() => setFilterState({ search: '', minAltitude: null, maxAltitude: null, aircraftType: '', onlyWithPosition: true })}
        style={{
          marginTop: 10,
          width: '100%',
          padding: '5px 0',
          background: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: 4,
          fontSize: 12,
          cursor: 'pointer',
          color: '#374151',
        }}
      >
        Wyczyść filtry
      </button>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#6b7280',
  marginBottom: 3,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  border: '1px solid #d1d5db',
  borderRadius: 4,
  fontSize: 12,
  outline: 'none',
  boxSizing: 'border-box',
};
