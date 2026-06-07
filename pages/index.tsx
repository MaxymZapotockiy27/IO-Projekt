import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AircraftProvider, useAircraft } from '../src/context/AircraftContext';
import AircraftList from '../src/components/AircraftList';
import FilterPanel from '../src/components/FilterPanel';
import FlightDetails from '../src/components/FlightDetails';
import NotificationPanel from '../src/components/NotificationPanel';
import StatusBar from '../src/components/StatusBar';
import RadiusSettings from '../src/components/RadiusSettings';

const MapView = dynamic(() => import('../src/components/MapView'), { ssr: false });

function RightSidebar() {
  const { selectedAircraft, setSelectedAircraft } = useAircraft();
  if (!selectedAircraft) return null;
  return (
    <aside style={{
      width: 280,
      flexShrink: 0,
      background: 'white',
      borderLeft: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '10px 12px', background: '#1f2937', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0, letterSpacing: 0.3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Szczegóły lotu</span>
        <button
          onClick={() => setSelectedAircraft(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af', lineHeight: 1 }}
        >✕</button>
      </div>
      <div style={{ padding: '0 12px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <FlightDetails />
      </div>
    </aside>
  );
}

function AppLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <aside style={{
          width: 260,
          flexShrink: 0,
          background: 'white',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 12px',
            background: '#1f2937',
            color: 'white',
            fontWeight: 700,
            fontSize: 14,
            flexShrink: 0,
            letterSpacing: 0.3,
          }}>
            System Monitorowania Ruchu Lotniczego
          </div>
          <div style={{ padding: '0 12px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <FilterPanel />
            <RadiusSettings />
            <AircraftList />
          </div>
        </aside>
        <main style={{ flex: 1, position: 'relative' }}>
          <MapView />
        </main>
        <RightSidebar />
      </div>
      <StatusBar />
      <NotificationPanel />
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Head>
        <title>System Monitorowania Ruchu Lotniczego</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <AircraftProvider>
        <AppLayout />
      </AircraftProvider>
    </>
  );
}
