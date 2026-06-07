export interface Aircraft {
  hex: string;
  flight: string | null;
  r: string | null;
  t: string | null;
  lat: number | null;
  lon: number | null;
  alt_baro: number | string | null;
  alt_geom: number | null;
  gs: number | null;
  track: number | null;
  baro_rate: number | null;
  squawk: string | null;
  emergency: string | null;
  category: string | null;
  nav_altitude_mcp: number | null;
  nav_heading: number | null;
  seen: number;
  seen_pos: number | null;
  messages: number;
  rssi: number;
  mlat: string[];
  tisb: string[];
  type: string;
}

export interface AircraftResponse {
  ac: Aircraft[];
  ctime: number;
  msg: string;
  now: number;
  ptime: number;
  total: number;
}

export interface Notification {
  id: string;
  type: 'emergency' | 'squawk' | 'info';
  message: string;
  aircraftHex: string;
  timestamp: number;
}

export interface FilterState {
  search: string;
  minAltitude: number | null;
  maxAltitude: number | null;
  aircraftType: string;
  onlyWithPosition: boolean;
}
