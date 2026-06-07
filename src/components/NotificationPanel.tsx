import { useAircraft } from '../context/AircraftContext';

export default function NotificationPanel() {
  const { notifications, dismissNotification, setSelectedAircraft, aircraft } = useAircraft();

  if (notifications.length === 0) return null;

  function handleClick(hex: string) {
    const ac = aircraft.find(a => a.hex === hex);
    if (ac) setSelectedAircraft(ac);
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      right: 16,
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      maxWidth: 320,
    }}>
      {notifications.slice(0, 5).map(n => (
        <div
          key={n.id}
          style={{
            background: n.type === 'emergency' ? '#ef4444' : n.type === 'squawk' ? '#f59e0b' : '#3b82f6',
            color: 'white',
            padding: '8px 12px',
            borderRadius: 6,
            fontSize: 13,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            cursor: 'pointer',
          }}
          onClick={() => handleClick(n.aircraftHex)}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 12 }}>
              {n.type === 'emergency' ? '🚨 AWARYJNY' : n.type === 'squawk' ? '⚠️ SQUAWK' : 'ℹ️ INFO'}
            </div>
            <div style={{ marginTop: 2 }}>{n.message}</div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); dismissNotification(n.id); }}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
