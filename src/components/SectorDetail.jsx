import { useState } from 'react';
import IchimokuChart from './IchimokuChart';

const CHARTS_PER_PAGE = 12;

export default function SectorDetail({ sectorName, sectors, stockDataMap, timeframe, setTimeframe, onBack }) {
  const [page, setPage] = useState(0);
  const { color, tickers } = sectors[sectorName];
  const totalPages = Math.ceil(tickers.length / CHARTS_PER_PAGE);
  const pageTickers = tickers.slice(page * CHARTS_PER_PAGE, (page + 1) * CHARTS_PER_PAGE);

  return (
    <div style={{ height: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: '#fff',
        flexShrink: 0,
        flexWrap: 'wrap',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <button onClick={onBack} style={{
          background: 'none',
          border: '1px solid #e2e8f0',
          color: '#64748b',
          padding: '5px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
        }}>← 섹터맵</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{sectorName}</span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{tickers.length}개 종목</span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          {['D', 'W'].map(tf => (
            <button key={tf} onClick={() => setTimeframe(tf)} style={{
              padding: '5px 14px',
              cursor: 'pointer',
              border: `1px solid ${timeframe === tf ? color : '#e2e8f0'}`,
              borderRadius: '5px',
              fontWeight: '700',
              fontSize: '11px',
              background: timeframe === tf ? color : '#fff',
              color: timeframe === tf ? '#fff' : '#64748b',
              transition: 'all 0.15s',
            }}>
              {tf === 'D' ? '일봉' : '주봉'}
            </button>
          ))}

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: '8px' }}>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '5px',
                color: page === 0 ? '#cbd5e1' : '#374151',
                padding: '5px 10px',
                cursor: page === 0 ? 'default' : 'pointer',
                fontSize: '14px',
              }}>‹</button>
              <span style={{ fontSize: '11px', color: '#94a3b8', padding: '0 4px' }}>{page + 1} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '5px',
                color: page === totalPages - 1 ? '#cbd5e1' : '#374151',
                padding: '5px 10px',
                cursor: page === totalPages - 1 ? 'default' : 'pointer',
                fontSize: '14px',
              }}>›</button>
            </div>
          )}
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '6px',
        padding: '8px',
        minHeight: 0,
      }}>
        {pageTickers.map(ticker => {
          const data = stockDataMap[ticker];
          if (data && data.length >= 60) {
            return <IchimokuChart key={ticker} symbol={ticker} dailyData={data} timeframe={timeframe} />;
          }
          return (
            <div key={ticker} style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>{ticker}</div>
              <div style={{ fontSize: '10px', color: '#cbd5e1' }}>
                {data === undefined ? '로딩 중...' : data === null ? '불러오기 실패' : '데이터 부족'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
