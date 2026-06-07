import { useMemo } from 'react';
import { useAircraft } from '../context/AircraftContext';
import type { Aircraft } from '../types/aircraft';

export function useFilteredAircraft(): Aircraft[] {
  const { aircraft, filterState } = useAircraft();

  return useMemo(() => {
    let result = aircraft;

    if (filterState.onlyWithPosition) {
      result = result.filter(a => a.lat != null && a.lon != null);
    }

    if (filterState.search.trim()) {
      const q = filterState.search.trim().toLowerCase();
      result = result.filter(a =>
        a.hex.toLowerCase().includes(q) ||
        (a.flight?.trim().toLowerCase().includes(q) ?? false) ||
        (a.r?.toLowerCase().includes(q) ?? false) ||
        (a.t?.toLowerCase().includes(q) ?? false)
      );
    }

    if (filterState.aircraftType.trim()) {
      const t = filterState.aircraftType.trim().toUpperCase();
      result = result.filter(a => a.t?.toUpperCase().includes(t));
    }

    if (filterState.minAltitude != null) {
      result = result.filter(a => {
        const alt = typeof a.alt_baro === 'number' ? a.alt_baro : null;
        return alt != null && alt >= filterState.minAltitude!;
      });
    }

    if (filterState.maxAltitude != null) {
      result = result.filter(a => {
        const alt = typeof a.alt_baro === 'number' ? a.alt_baro : null;
        return alt != null && alt <= filterState.maxAltitude!;
      });
    }

    return result;
  }, [aircraft, filterState]);
}
