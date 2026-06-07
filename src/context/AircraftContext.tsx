import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import type { Aircraft, Notification, FilterState } from '../types/aircraft';
import { fetchAircraftInRadius } from '../services/adsbApi';

interface AircraftContextType {
  aircraft: Aircraft[];
  selectedAircraft: Aircraft | null;
  notifications: Notification[];
  filterState: FilterState;
  loading: boolean;
  error: string | null;
  mapCenter: [number, number];
  mapRadius: number;
  trailMap: Map<string, [number, number][]>;
  setSelectedAircraft: (a: Aircraft | null) => void;
  setFilterState: (f: FilterState) => void;
  setMapCenter: (c: [number, number]) => void;
  setMapRadius: (r: number) => void;
  commitArea: (center: [number, number], radius: number) => void;
  dismissNotification: (id: string) => void;
  refresh: () => void;
}

const AircraftContext = createContext<AircraftContextType | null>(null);

export function AircraftProvider({ children }: { children: ReactNode }) {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([52.0, 19.0]);
  const [mapRadius, setMapRadius] = useState(250);
  const [trailMap, setTrailMap] = useState<Map<string, [number, number][]>>(new Map());
  const [filterState, setFilterState] = useState<FilterState>({
    search: '',
    minAltitude: null,
    maxAltitude: null,
    aircraftType: '',
    onlyWithPosition: true,
  });

  const knownEmergencies = useRef<Set<string>>(new Set());
  const fetchParamsRef = useRef<{ center: [number, number]; radius: number }>({ center: [52.0, 19.0], radius: 250 });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { center, radius } = fetchParamsRef.current;
      const data = await fetchAircraftInRadius(center[0], center[1], radius);
      setAircraft(data);

      setTrailMap(prev => {
        const next = new Map(prev);
        for (const ac of data) {
          if (ac.lat != null && ac.lon != null) {
            const trail = next.get(ac.hex) ?? [];
            const last = trail[trail.length - 1];
            if (!last || last[0] !== ac.lat || last[1] !== ac.lon) {
              next.set(ac.hex, [...trail.slice(-29), [ac.lat, ac.lon]]);
            }
          }
        }
        return next;
      });

      const newNotifs: Notification[] = [];
      for (const ac of data) {
        if (ac.emergency && ac.emergency !== 'none' && !knownEmergencies.current.has(ac.hex)) {
          knownEmergencies.current.add(ac.hex);
          newNotifs.push({
            id: `${ac.hex}-${Date.now()}`,
            type: 'emergency',
            message: `EMERGENCY: ${ac.flight?.trim() || ac.hex} — ${ac.emergency}`,
            aircraftHex: ac.hex,
            timestamp: Date.now(),
          });
        }
        if (ac.squawk === '7700' && !knownEmergencies.current.has(`sq-${ac.hex}`)) {
          knownEmergencies.current.add(`sq-${ac.hex}`);
          newNotifs.push({
            id: `sq-${ac.hex}-${Date.now()}`,
            type: 'squawk',
            message: `SQUAWK 7700: ${ac.flight?.trim() || ac.hex} — General Emergency`,
            aircraftHex: ac.hex,
            timestamp: Date.now(),
          });
        }
        if (ac.squawk === '7600' && !knownEmergencies.current.has(`sq7600-${ac.hex}`)) {
          knownEmergencies.current.add(`sq7600-${ac.hex}`);
          newNotifs.push({
            id: `sq7600-${ac.hex}-${Date.now()}`,
            type: 'squawk',
            message: `SQUAWK 7600: ${ac.flight?.trim() || ac.hex} — Radio Failure`,
            aircraftHex: ac.hex,
            timestamp: Date.now(),
          });
        }
        if (ac.squawk === '7500' && !knownEmergencies.current.has(`sq7500-${ac.hex}`)) {
          knownEmergencies.current.add(`sq7500-${ac.hex}`);
          newNotifs.push({
            id: `sq7500-${ac.hex}-${Date.now()}`,
            type: 'squawk',
            message: `SQUAWK 7500: ${ac.flight?.trim() || ac.hex} — Hijacking`,
            aircraftHex: ac.hex,
            timestamp: Date.now(),
          });
        }
      }
      if (newNotifs.length > 0) {
        setNotifications(prev => [...newNotifs, ...prev].slice(0, 50));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const commitArea = useCallback((center: [number, number], radius: number) => {
    fetchParamsRef.current = { center, radius };
    setMapRadius(radius);
    refresh();
  }, [refresh]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <AircraftContext.Provider value={{
      aircraft,
      selectedAircraft,
      notifications,
      filterState,
      loading,
      error,
      mapCenter,
      mapRadius,
      trailMap,
      setSelectedAircraft,
      setFilterState,
      setMapCenter,
      setMapRadius,
      commitArea,
      dismissNotification,
      refresh,
    }}>
      {children}
    </AircraftContext.Provider>
  );
}

export function useAircraft(): AircraftContextType {
  const ctx = useContext(AircraftContext);
  if (!ctx) throw new Error('useAircraft must be used inside AircraftProvider');
  return ctx;
}
