import { lazy, Suspense, useMemo, useState } from 'react';
import AppHeader from './components/AppHeader';
import LoadingPanel from './components/LoadingPanel';
import { RUSSELL_SECTORS, SP500_SECTORS } from './data/sectors';
import { useStockData } from './hooks/useStockData';

const SectorHeatmap = lazy(() => import('./components/SectorHeatmap'));
const SectorDetail = lazy(() => import('./components/SectorDetail'));

export default function App() {
  const [tab, setTab] = useState('sp500');
  const [timeframe, setTimeframe] = useState('W');
  const [selectedSector, setSelectedSector] = useState(null);

  const sectors = tab === 'sp500' ? SP500_SECTORS : RUSSELL_SECTORS;
  const { stockDataMap, sectorStats } = useStockData(sectors);

  const allTickers = useMemo(
    () => [...new Set(Object.values(sectors).flatMap(sector => sector.tickers))],
    [sectors]
  );
  const totalLoaded = allTickers.filter(ticker => stockDataMap[ticker] && stockDataMap[ticker].length > 0).length;

  if (selectedSector && sectors[selectedSector]) {
    return (
      <Suspense fallback={<LoadingPanel />}>
        <SectorDetail
          sectorName={selectedSector}
          sectors={sectors}
          stockDataMap={stockDataMap}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          onBack={() => setSelectedSector(null)}
        />
      </Suspense>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <AppHeader
        tab={tab}
        setTab={setTab}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        totalLoaded={totalLoaded}
        totalTickers={allTickers.length}
        onTabChange={() => setSelectedSector(null)}
      />
      <Suspense fallback={<LoadingPanel />}>
        <SectorHeatmap
          sectors={sectors}
          stockDataMap={stockDataMap}
          sectorStats={sectorStats}
          onSelect={setSelectedSector}
        />
      </Suspense>
    </div>
  );
}
