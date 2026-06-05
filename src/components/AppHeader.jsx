export default function AppHeader({ tab, setTab, timeframe, setTimeframe, totalLoaded, totalTickers, onTabChange }) {
  return (
    <div style={{
      background: '#fff',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      padding: '14px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap',
    }}>
      <h1 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
        Ichimoku Sector Dashboard
      </h1>

      <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px', gap: '2px' }}>
        {[['sp500', 'S&P 500'], ['russell', 'Russell 2000']].map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key); onTabChange(); }} style={{
            padding: '6px 16px',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '700',
            fontSize: '12px',
            background: tab === key ? '#fff' : 'transparent',
            color: tab === key ? '#0f172a' : '#94a3b8',
            boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
        {['D', 'W'].map(tf => (
          <button key={tf} onClick={() => setTimeframe(tf)} style={{
            padding: '6px 16px',
            cursor: 'pointer',
            border: `1px solid ${timeframe === tf ? '#2563eb' : '#e2e8f0'}`,
            borderRadius: '6px',
            fontWeight: '700',
            fontSize: '11px',
            background: timeframe === tf ? '#2563eb' : '#fff',
            color: timeframe === tf ? '#fff' : '#64748b',
            transition: 'all 0.15s',
          }}>
            {tf === 'D' ? '일봉' : '주봉'}
          </button>
        ))}
        <span style={{ fontSize: '10px', color: '#cbd5e1', marginLeft: '4px' }}>
          {totalLoaded}/{totalTickers} loaded
        </span>
      </div>
    </div>
  );
}
