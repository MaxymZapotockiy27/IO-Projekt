import type { Aircraft, AircraftResponse } from '../types/aircraft';

const BASE_URL = '/api/adsb';

export async function fetchAircraftInRadius(lat: number, lon: number, radiusNm: number): Promise<Aircraft[]> {
  const url = `${BASE_URL}/v2/lat/${lat}/lon/${lon}/dist/${radiusNm}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ADS-B API error: ${res.status}`);
  const data: AircraftResponse = await res.json();
  return data.ac;
}

export async function fetchAircraftByHex(hex: string): Promise<Aircraft[]> {
  const url = `${BASE_URL}/v2/hex/${hex}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ADS-B API error: ${res.status}`);
  const data: AircraftResponse = await res.json();
  return data.ac;
}

export async function fetchAircraftByRegistration(reg: string): Promise<Aircraft[]> {
  const url = `${BASE_URL}/v2/reg/${reg}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ADS-B API error: ${res.status}`);
  const data: AircraftResponse = await res.json();
  return data.ac;
}

export async function fetchAircraftByCallsign(callsign: string): Promise<Aircraft[]> {
  const url = `${BASE_URL}/v2/callsign/${callsign}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ADS-B API error: ${res.status}`);
  const data: AircraftResponse = await res.json();
  return data.ac;
}

export async function fetchAircraftByType(type: string): Promise<Aircraft[]> {
  const url = `${BASE_URL}/v2/type/${type}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ADS-B API error: ${res.status}`);
  const data: AircraftResponse = await res.json();
  return data.ac;
}

export async function fetchMilitaryAircraft(): Promise<Aircraft[]> {
  const url = `${BASE_URL}/v2/mil`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ADS-B API error: ${res.status}`);
  const data: AircraftResponse = await res.json();
  return data.ac;
}
